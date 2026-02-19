package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.quotes.QuoteCreateParams
import com.lightspark.grid.models.quotes.QuoteSourceOneOf
import com.lightspark.grid.models.quotes.QuoteDestinationOneOf
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.quoteRoutes() {
    route("/api/quotes") {
        post {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/quotes", body)

                val sourceNode = json.get("source")
                val source = buildQuoteSource(sourceNode)

                val destNode = json.get("destination")
                val destination = buildQuoteDestination(destNode)

                val params = QuoteCreateParams.builder()
                    .source(source)
                    .destination(destination)
                    .lockedCurrencyAmount(json.get("lockedCurrencyAmount").asLong())
                    .lockedCurrencySide(
                        when (json.optText("lockedCurrencySide")?.uppercase()) {
                            "RECEIVING" -> QuoteCreateParams.LockedCurrencySide.RECEIVING
                            else -> QuoteCreateParams.LockedCurrencySide.SENDING
                        }
                    )
                    .apply {
                        json.optText("description")?.let { description(it) }
                    }
                    .build()

                Log.gridRequest("quotes.create", body)
                val quote = GridClientBuilder.client.quotes().create(params)
                val responseJson = JsonUtils.prettyPrint(quote)
                Log.gridResponse("quotes.create", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.Created)
            } catch (e: Exception) {
                Log.gridError("quotes.create", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        post("/{quoteId}/execute") {
            try {
                val quoteId = call.parameters["quoteId"]
                    ?: return@post call.respondText(
                        """{"error": "quoteId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                Log.incoming("POST", "/api/quotes/$quoteId/execute")
                Log.gridRequest("quotes.execute", "quoteId=$quoteId")
                val quote = GridClientBuilder.client.quotes().execute(quoteId)
                val responseJson = JsonUtils.prettyPrint(quote)
                Log.gridResponse("quotes.execute", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("quotes.execute", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

private fun buildQuoteSource(sourceNode: JsonNode): QuoteSourceOneOf {
    val sourceType = sourceNode.optText("sourceType")

    if (sourceType == "REALTIME_FUNDING" || sourceNode.has("currency")) {
        val realtimeSource = QuoteSourceOneOf.RealtimeFundingQuoteSource.builder()
            .currency(sourceNode.get("currency").asText())
            .apply {
                sourceNode.optText("customerId")?.let { customerId(it) }
            }
            .build()
        return QuoteSourceOneOf.ofRealtimeFundingQuoteSource(realtimeSource)
    }

    val accountSource = QuoteSourceOneOf.AccountQuoteSource.builder()
        .accountId(sourceNode.get("accountId").asText())
        .apply {
            sourceNode.optText("customerId")?.let { customerId(it) }
        }
        .build()
    return QuoteSourceOneOf.ofAccountQuoteSource(accountSource)
}

private fun buildQuoteDestination(destNode: JsonNode): QuoteDestinationOneOf {
    if (destNode.has("umaAddress")) {
        val umaDest = QuoteDestinationOneOf.UmaAddressDestination.builder()
            .umaAddress(destNode.get("umaAddress").asText())
            .build()
        return QuoteDestinationOneOf.ofUmaAddressDestination(umaDest)
    }

    val accountDest = QuoteDestinationOneOf.AccountDestination.builder()
        .accountId(destNode.get("accountId").asText())
        .build()
    return QuoteDestinationOneOf.ofAccountDestination(accountDest)
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
