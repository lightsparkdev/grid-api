package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.sandbox.SandboxSendFundsParams
import com.lightspark.grid.models.sandbox.internalaccounts.InternalAccountFundParams
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.optText
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.sandboxRoutes() {
    route("/api/sandbox") {
        post("/internal-accounts/{accountId}/fund") {
            try {
                val accountId = call.parameters["accountId"]
                    ?: return@post call.respondText(
                        """{"error": "accountId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/sandbox/internal-accounts/$accountId/fund", body)

                val params = InternalAccountFundParams.builder()
                    .accountId(accountId)
                    .amount(json.get("amount").asLong())
                    .build()

                Log.gridRequest("sandbox.internalAccounts.fund", body)
                val response = GridClientBuilder.client.sandbox().internalAccounts().fund(params)
                val responseJson = JsonUtils.prettyPrint(response)
                Log.gridResponse("sandbox.internalAccounts.fund", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("sandbox.internalAccounts.fund", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        post("/send-funds") {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/sandbox/send-funds", body)

                val params = SandboxSendFundsParams.builder()
                    .quoteId(json.get("quoteId").asText())
                    .currencyCode(json.optText("currencyCode") ?: "USD")
                    .apply {
                        if (json.has("currencyAmount") && !json.get("currencyAmount").isNull) {
                            currencyAmount(json.get("currencyAmount").asLong())
                        }
                    }
                    .build()

                Log.gridRequest("sandbox.sendFunds", body)
                val response = GridClientBuilder.client.sandbox().sendFunds(params)
                val responseJson = JsonUtils.prettyPrint(response)
                Log.gridResponse("sandbox.sendFunds", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("sandbox.sendFunds", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}
