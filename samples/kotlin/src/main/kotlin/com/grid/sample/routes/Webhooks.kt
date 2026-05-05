package com.grid.sample.routes

import com.grid.sample.Config
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.SessionRegistry
import com.lightspark.grid.utils.WebhookUtils
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private var publicKeyInitialized = false

private fun ensurePublicKey() {
    if (!publicKeyInitialized) {
        WebhookUtils.setPublicKey(Config.webhookPublicKey)
        publicKeyInitialized = true
    }
}

fun Route.webhookRoutes() {
    route("/api/webhooks") {
        post {
            val rawBody = call.receiveText()
            Log.webhook(rawBody)

            try {
                ensurePublicKey()
                val signature = call.request.header("X-Grid-Signature") ?: ""
                val isValid = WebhookUtils.verifyWebhookSignature(rawBody, signature)
                Log.webhookSignatureResult(isValid)

                val event = GridClientBuilder.client.webhooks().unwrap(rawBody)
                val eventJson = JsonUtils.mapper.writerWithDefaultPrettyPrinter().writeValueAsString(event)
                Log.gridResponse("webhooks.unwrap", eventJson)
                routeToSession(eventJson)
            } catch (e: Exception) {
                Log.gridError("webhooks.unwrap", e)
                routeToSession(rawBody)
            }

            call.respond(HttpStatusCode.OK)
        }
    }
}

private fun routeToSession(eventJson: String) {
    val tree = runCatching { JsonUtils.mapper.readTree(eventJson) }.getOrNull()
    val sessionId = tree?.let { SessionRegistry.sessionFor(it) }
    if (sessionId == null) {
        println("Webhook had no tagged resource; dropping (no session to route to)")
        return
    }
    SessionRegistry.emit(sessionId, eventJson)
}
