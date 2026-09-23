package com.grid.sample.routes

import com.grid.sample.GridRest
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.SessionRegistry
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.net.URLEncoder
import java.util.UUID

// SDK 1.9.0 predates the current card request shapes (it still sends
// `cardholderId` and `fundingSources[]`, and has no reveal or card-transaction
// filters), so these routes call the REST API directly via GridRest.
//
// These routes run with the platform's credentials. So a card is only reachable
// from the browser session that issued it (its X-Session-Id), which keeps other
// visitors to a shared or tunneled deployment from revealing or closing it.
fun Route.cardRoutes() {
    route("/api/cards") {
        // Issue a card. POST /cards requires an Idempotency-Key; forward the
        // client's or mint one so a double-click can't issue two cards.
        post {
            proxy("cards.issue") {
                val body = call.receiveText()
                val key = call.request.header("Idempotency-Key") ?: UUID.randomUUID().toString()
                GridRest.request("POST", "/cards", body, mapOf("Idempotency-Key" to key))
            }
        }

        get("/{cardId}") {
            proxy("cards.retrieve", ownedCard = true) {
                GridRest.request("GET", "/cards/${enc(call.cardId())}")
            }
        }

        // Freeze, unfreeze, close, or change limits.
        patch("/{cardId}") {
            proxy("cards.update", ownedCard = true) {
                val body = call.receiveText()
                GridRest.request("PATCH", "/cards/${enc(call.cardId())}", body)
            }
        }

        // Mints a short-lived iframe URL showing PAN, CVV, and expiry. The URL is
        // a bearer secret, so it is passed through to the browser but never logged.
        post("/{cardId}/reveal") {
            try {
                val cardId = call.cardId()
                if (!call.ownsCard()) return@post call.respondForbidden()
                // Optional body: { "cssUrl": "https://..." } styles this one reveal.
                val body = call.receiveText().ifBlank { "{}" }
                Log.gridRequest("cards.reveal", "$cardId $body")
                val response = GridRest.request("POST", "/cards/${enc(cardId)}/reveal", body)
                Log.gridResponse("cards.reveal", "status=${response.status} (URL redacted)")
                call.respondText(response.body, ContentType.Application.Json, HttpStatusCode.fromValue(response.status))
            } catch (e: Exception) {
                Log.gridError("cards.reveal", e)
                call.respondError(e)
            }
        }

        get("/{cardId}/transactions") {
            proxy("transactions.list", ownedCard = true) {
                GridRest.request("GET", "/transactions?type=CARD&cardId=${enc(call.cardId())}&limit=20")
            }
        }
    }

    // Sandbox-only simulators: authorization, clearing, and return.
    route("/api/sandbox/cards/{cardId}/simulate") {
        for (event in listOf("authorization", "clearing", "return")) {
            post("/$event") {
                proxy("sandbox.cards.simulate.$event", ownedCard = true) {
                    val body = call.receiveText()
                    Log.incoming("POST", "/api/sandbox/cards/${call.cardId()}/simulate/$event", body)
                    GridRest.request("POST", "/sandbox/cards/${enc(call.cardId())}/simulate/$event", body)
                }
            }
        }
    }
}

private fun ApplicationCall.cardId(): String =
    parameters["cardId"] ?: throw IllegalArgumentException("cardId is required")

private fun ApplicationCall.ownsCard(): Boolean =
    SessionRegistry.owns(request.header("X-Session-Id"), parameters["cardId"])

private suspend fun ApplicationCall.respondForbidden() =
    respondText(
        """{"error": "This card was not issued from this browser session."}""",
        ContentType.Application.Json,
        HttpStatusCode.Forbidden,
    )

private fun enc(value: String): String = URLEncoder.encode(value, Charsets.UTF_8)

/**
 * Runs a Grid REST call, tags returned ids with the session, and passes the status through.
 * Request bodies aren't logged because card create and update bodies can carry
 * `threeDSecurePassword`.
 */
private suspend fun RoutingContext.proxy(
    operation: String,
    ownedCard: Boolean = false,
    block: suspend () -> GridRest.Response,
) {
    try {
        if (ownedCard && !call.ownsCard()) return call.respondForbidden()
        Log.gridRequest(operation)
        val response = block()
        Log.gridResponse(operation, response.body)

        // Tag card and transaction ids so their webhooks route to this browser session.
        val sessionId = call.request.header("X-Session-Id")
        if (sessionId != null && response.status in 200..299) {
            val tree = JsonUtils.mapper.readTree(response.body)
            SessionRegistry.tag(tree.get("id")?.asText(), sessionId)
            tree.get("data")?.forEach { SessionRegistry.tag(it.get("id")?.asText(), sessionId) }
        }

        call.respondText(response.body, ContentType.Application.Json, HttpStatusCode.fromValue(response.status))
    } catch (e: Exception) {
        Log.gridError(operation, e)
        call.respondError(e)
    }
}

private suspend fun ApplicationCall.respondError(e: Exception) {
    val status = if (e is IllegalArgumentException) HttpStatusCode.BadRequest else HttpStatusCode.InternalServerError
    respondText(
        JsonUtils.mapper.writeValueAsString(mapOf("error" to e.message)),
        ContentType.Application.Json,
        status,
    )
}
