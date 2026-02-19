package com.grid.sample.routes

import com.grid.sample.WebhookStream
import io.ktor.server.routing.*
import io.ktor.server.sse.*
import io.ktor.sse.*
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlin.time.Duration.Companion.seconds

fun Route.sseRoutes() {
    sse("/api/sse") {
        val connected = """{"type":"connected","timestamp":${System.currentTimeMillis()}}"""
        send(ServerSentEvent(connected))

        WebhookStream.eventFlow
            .onEach { event -> send(ServerSentEvent(event)) }
            .catch { e -> println("SSE stream error: ${e.message}") }
            .launchIn(this)
    }

    sse("/api/sse/heartbeat") {
        heartbeat {
            period = 30.seconds
            event = ServerSentEvent("heartbeat")
        }
    }
}
