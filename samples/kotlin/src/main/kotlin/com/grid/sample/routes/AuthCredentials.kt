package com.grid.sample.routes

import com.lightspark.grid.models.auth.credentials.CredentialCreateParams.AuthCredentialCreateRequest.PasskeyCredentialCreateRequest
import com.lightspark.grid.models.auth.credentials.CredentialResendChallengeParams
import com.lightspark.grid.models.auth.credentials.CredentialVerifyParams
import com.lightspark.grid.models.auth.credentials.CredentialVerifyParams.AuthCredentialVerifyRequest.PasskeyCredentialVerifyRequest
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.optText
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.security.SecureRandom
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap

// Backend-issued WebAuthn registration challenges. Production integrators would
// keep these in their session store; an in-memory map is sufficient for the sample.
private object RegistrationChallengeStore {
    private val random = SecureRandom()
    private val store = ConcurrentHashMap<String, Long>()
    private const val TTL_MS = 5 * 60 * 1000L

    fun mint(): String {
        val bytes = ByteArray(32).also(random::nextBytes)
        val challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
        store[challenge] = System.currentTimeMillis() + TTL_MS
        return challenge
    }

    fun consume(challenge: String): Boolean {
        val expiresAt = store.remove(challenge) ?: return false
        return System.currentTimeMillis() < expiresAt
    }
}

fun Route.authCredentialRoutes() {
    route("/api/auth/credentials") {
        // Mints a WebAuthn registration challenge plus the rp/user blocks the
        // client needs to feed navigator.credentials.create(). Backend-only —
        // not a Grid endpoint.
        post("/registration-challenge") {
            val body = call.receiveText()
            Log.incoming("POST", "/api/auth/credentials/registration-challenge", body)
            val json = JsonUtils.mapper.readTree(body)
            val accountId = json.optText("accountId") ?: ""
            val customerId = json.optText("customerId") ?: ""
            // rpId must match the page's effective domain. Frontend supplies its
            // window.location.hostname so the same backend works for any host.
            val rpId = json.optText("rpId") ?: "localhost"

            val challenge = RegistrationChallengeStore.mint()
            // user.id is opaque to the relying party but must be stable per
            // Global Account; account id is a natural choice.
            val userIdSeed = accountId.ifEmpty { "anonymous-${System.nanoTime()}" }
            val userId = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(userIdSeed.toByteArray())

            val response = mapOf(
                "challenge" to challenge,
                "rp" to mapOf("id" to rpId, "name" to "Grid Sample"),
                "user" to mapOf(
                    "id" to userId,
                    "name" to customerId.ifEmpty { "global-account-user" },
                    "displayName" to "Grid Global Account",
                ),
            )
            call.respondText(
                JsonUtils.prettyPrint(response),
                ContentType.Application.Json,
                HttpStatusCode.OK
            )
        }

        // Registers a passkey with Grid. Expects the WebAuthn attestation from
        // the client plus the challenge originally minted above.
        post {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/auth/credentials", body)

                val challenge = json.optText("challenge")
                    ?: throw IllegalArgumentException("challenge is required")
                if (!RegistrationChallengeStore.consume(challenge)) {
                    return@post call.respondText(
                        """{"error": "challenge is invalid or expired"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                }

                val attestationNode = json.get("attestation")
                    ?: throw IllegalArgumentException("attestation is required")
                val attestation = PasskeyCredentialCreateRequest.Attestation.builder()
                    .credentialId(attestationNode.get("credentialId").asText())
                    .clientDataJson(attestationNode.get("clientDataJson").asText())
                    .attestationObject(attestationNode.get("attestationObject").asText())
                    .build()

                val request = PasskeyCredentialCreateRequest.builder()
                    .type(PasskeyCredentialCreateRequest.Type.PASSKEY)
                    .accountId(json.get("accountId").asText())
                    .challenge(challenge)
                    .attestation(attestation)
                    .apply {
                        json.optText("nickname")?.let { nickname(it) }
                    }
                    .build()

                Log.gridRequest("auth.credentials.create", JsonUtils.prettyPrint(request))
                val response = GridClientBuilder.client.auth().credentials().create(request)
                val responseJson = JsonUtils.prettyPrint(response)
                Log.gridResponse("auth.credentials.create", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.Created)
            } catch (e: Exception) {
                Log.gridError("auth.credentials.create", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        // Issues a fresh challenge for an already-registered credential, used
        // before signing a sensitive action (withdrawal, revoke, export).
        post("/{authMethodId}/challenge") {
            try {
                val authMethodId = call.parameters["authMethodId"]
                    ?: return@post call.respondText(
                        """{"error": "authMethodId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                // Body is required for PASSKEY (carries clientPublicKey so Grid can
                // seal the session signing key to the device). Empty body is fine
                // for EMAIL_OTP and OAUTH.
                val body = runCatching { call.receiveText() }.getOrDefault("")
                val clientPublicKey = body.takeIf { it.isNotBlank() }
                    ?.let { JsonUtils.mapper.readTree(it).optText("clientPublicKey") }
                Log.incoming("POST", "/api/auth/credentials/$authMethodId/challenge", body)

                val params = CredentialResendChallengeParams.builder()
                    .id(authMethodId)
                    .apply { clientPublicKey?.let { clientPublicKey(it) } }
                    .build()

                Log.gridRequest(
                    "auth.credentials.resendChallenge",
                    "id=$authMethodId clientPublicKey=${clientPublicKey != null}",
                )
                val response = GridClientBuilder.client.auth().credentials().resendChallenge(params)
                val responseJson = JsonUtils.prettyPrint(response)
                Log.gridResponse("auth.credentials.resendChallenge", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("auth.credentials.resendChallenge", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        // Verifies a passkey assertion and mints a session signing key. The client
        // decrypts encryptedSessionSigningKey with the matching client private key
        // and uses it to sign payloadToSign for the next sensitive action.
        post("/{authMethodId}/verify") {
            try {
                val authMethodId = call.parameters["authMethodId"]
                    ?: return@post call.respondText(
                        """{"error": "authMethodId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                val requestId = call.request.headers["Request-Id"]
                    ?: return@post call.respondText(
                        """{"error": "Request-Id header is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/auth/credentials/$authMethodId/verify", body)

                val assertionNode = json.get("assertion")
                    ?: throw IllegalArgumentException("assertion is required")
                val assertion = PasskeyCredentialVerifyRequest.Assertion.builder()
                    .credentialId(assertionNode.get("credentialId").asText())
                    .clientDataJson(assertionNode.get("clientDataJson").asText())
                    .authenticatorData(assertionNode.get("authenticatorData").asText())
                    .signature(assertionNode.get("signature").asText())
                    .apply {
                        assertionNode.optText("userHandle")?.let { userHandle(it) }
                    }
                    .build()

                // clientPublicKey moved to /challenge in SDK 1.7.x; verify carries
                // the assertion only.
                val verifyRequest = PasskeyCredentialVerifyRequest.builder()
                    .type(PasskeyCredentialVerifyRequest.Type.PASSKEY)
                    .assertion(assertion)
                    .build()

                val params = CredentialVerifyParams.builder()
                    .id(authMethodId)
                    .requestId(requestId)
                    .authCredentialVerifyRequest(verifyRequest)
                    .build()

                Log.gridRequest("auth.credentials.verify", "id=$authMethodId requestId=$requestId")
                val response = GridClientBuilder.client.auth().credentials().verify(params)
                val responseJson = JsonUtils.prettyPrint(response)
                Log.gridResponse("auth.credentials.verify", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("auth.credentials.verify", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}
