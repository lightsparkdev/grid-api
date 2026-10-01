package com.grid.sample.routes

import com.grid.sample.GridRest
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.SessionRegistry
import com.fasterxml.jackson.databind.node.ObjectNode
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

// The external-account schema moves faster than the pinned Kotlin SDK (new
// wallet types, bankAccountType on USD, NEFT/RTGS fields on INR), so this route
// forwards the spec-shaped body to POST /customers/external-accounts directly.
fun Route.externalAccountRoutes() {
    route("/api/customers/{customerId}/external-accounts") {
        post {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@post call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val body = call.receiveText()
                Log.incoming("POST", "/api/customers/$customerId/external-accounts", body)

                val json = JsonUtils.mapper.readTree(body) as? ObjectNode
                    ?: return@post call.respondText(
                        """{"error": "request body must be a JSON object"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                if (json.get("accountInfo")?.get("accountType") == null) {
                    return@post call.respondText(
                        """{"error": "accountInfo.accountType is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                }
                // customerId is required in the body; the path value is authoritative.
                json.put("customerId", customerId)
                if (!json.has("currency")) json.put("currency", "USD")
                val request = JsonUtils.mapper.writeValueAsString(json)

                Log.gridRequest("customers.externalAccounts.create", request)
                val response = GridRest.request("POST", "/customers/external-accounts", request)
                Log.gridResponse("customers.externalAccounts.create", response.body)

                if (response.status in 200..299) {
                    val sessionId = call.request.header("X-Session-Id")
                    SessionRegistry.tag(JsonUtils.mapper.readTree(response.body).get("id")?.asText(), sessionId)
                    SessionRegistry.tag(customerId, sessionId)
                }

                call.respondText(response.body, ContentType.Application.Json, HttpStatusCode.fromValue(response.status))
            } catch (e: Exception) {
                Log.gridError("customers.externalAccounts.create", e)
                call.respondText(
                    JsonUtils.mapper.writeValueAsString(mapOf("error" to e.message)),
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}
