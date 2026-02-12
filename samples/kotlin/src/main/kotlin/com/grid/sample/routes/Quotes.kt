package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.grid.api.models.quotes.BaseDestination
import com.grid.api.models.quotes.BaseQuoteSource
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteSourceOneOf
import com.grid.api.models.quotes.QuoteDestinationOneOf
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
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

                val quote = GridClientBuilder.client.quotes().create(params)
                call.respondText(
                    JsonUtils.prettyPrint(quote),
                    ContentType.Application.Json,
                    HttpStatusCode.Created
                )
            } catch (e: Exception) {
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

                val quote = GridClientBuilder.client.quotes().execute(quoteId)
                call.respondText(
                    JsonUtils.prettyPrint(quote),
                    ContentType.Application.Json,
                    HttpStatusCode.OK
                )
            } catch (e: Exception) {
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
        return QuoteSourceOneOf.ofRealtimeFundingQuoteSource(
            QuoteSourceOneOf.RealtimeFundingQuoteSource.builder()
                .sourceType(BaseQuoteSource.SourceType.REALTIME_FUNDING)
                .currency(sourceNode.get("currency").asText())
                .apply {
                    sourceNode.optText("customerId")?.let { customerId(it) }
                }
                .build()
        )
    }

    return QuoteSourceOneOf.ofAccountQuoteSource(
        QuoteSourceOneOf.AccountQuoteSource.builder()
            .sourceType(BaseQuoteSource.SourceType.ACCOUNT)
            .accountId(sourceNode.get("accountId").asText())
            .apply {
                sourceNode.optText("customerId")?.let { customerId(it) }
            }
            .build()
    )
}

private fun buildQuoteDestination(destNode: JsonNode): QuoteDestinationOneOf {
    if (destNode.has("umaAddress")) {
        return QuoteDestinationOneOf.ofUmaAddressDestination(
            QuoteDestinationOneOf.UmaAddressDestination.builder()
                .destinationType(BaseDestination.DestinationType.UMA_ADDRESS)
                .umaAddress(destNode.get("umaAddress").asText())
                .build()
        )
    }

    return QuoteDestinationOneOf.ofAccountDestination(
        QuoteDestinationOneOf.AccountDestination.builder()
            .destinationType(BaseDestination.DestinationType.ACCOUNT)
            .accountId(destNode.get("accountId").asText())
            .build()
    )
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
