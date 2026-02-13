package com.grid.sample.routes

import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.WebhookStream
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.webhookRoutes() {
    route("/api/webhooks") {
        post {
            val rawBody = call.receiveText()
            Log.webhook(rawBody)

            try {
                val event = GridClientBuilder.client.webhooks().unwrap(rawBody)
                val eventJson = JsonUtils.prettyPrint(event)
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
