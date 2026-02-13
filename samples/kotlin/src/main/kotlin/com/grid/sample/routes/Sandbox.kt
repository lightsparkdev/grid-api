package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.sandbox.SandboxSendFundsParams
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.sandboxRoutes() {
    route("/api/sandbox") {
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

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
