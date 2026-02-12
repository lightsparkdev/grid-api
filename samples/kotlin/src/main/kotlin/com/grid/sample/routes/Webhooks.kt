package com.grid.sample.routes

import com.grid.sample.Config
import com.grid.sample.WebhookStream
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

fun Route.webhookRoutes() {
    route("/api/webhooks") {
        post {
            val rawBody = call.receiveText()
            val signatureHeader = call.request.headers["X-Grid-Signature"]

            if (signatureHeader != null) {
                val isValid = verifyWebhookSignature(rawBody, signatureHeader)
                if (!isValid) {
                    call.respondText(
                        """{"error": "Invalid webhook signature"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.Unauthorized
                    )
                    return@post
                }
            }

            WebhookStream.addEvent(rawBody)
            call.respond(HttpStatusCode.OK)
        }
    }
}

private fun verifyWebhookSignature(body: String, signature: String): Boolean {
    return try {
        val publicKeyPem = Config.webhookPublicKey
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")

        val keyBytes = Base64.getDecoder().decode(publicKeyPem)
        val keySpec = X509EncodedKeySpec(keyBytes)
        val keyFactory = KeyFactory.getInstance("EC")
        val publicKey = keyFactory.generatePublic(keySpec)

        val sig = Signature.getInstance("SHA256withECDSA")
        sig.initVerify(publicKey)
        sig.update(body.toByteArray())

        val decodedSignature = Base64.getDecoder().decode(signature)
        sig.verify(decodedSignature)
    } catch (e: Exception) {
        println("Webhook signature verification failed: ${e.message}")
        false
    }
}
