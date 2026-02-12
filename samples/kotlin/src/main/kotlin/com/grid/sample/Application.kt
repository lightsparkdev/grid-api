package com.grid.sample

import com.grid.sample.routes.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import io.ktor.server.sse.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowCredentials = true
        anyHost()
    }
    install(SSE)
    routing {
        customerRoutes()
        externalAccountRoutes()
        quoteRoutes()
        sandboxRoutes()
        webhookRoutes()
        sseRoutes()

        // Serve frontend static files — must come last to avoid catching API routes
        staticResources("/", "static")
    }
}
