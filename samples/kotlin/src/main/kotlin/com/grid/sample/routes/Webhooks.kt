package com.grid.sample.routes

import com.grid.sample.Config
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.WebhookStream
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
                WebhookStream.addEvent(eventJson)
            } catch (e: Exception) {
                Log.gridError("webhooks.unwrap", e)
                WebhookStream.addEvent(rawBody)
            }

            call.respond(HttpStatusCode.OK)
        }
    }
}
