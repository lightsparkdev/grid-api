package com.grid.sample

import io.github.cdimascio.dotenv.dotenv

object Config {
    private val dotenv = dotenv {
        directory = "./"
        ignoreIfMalformed = true
        ignoreIfMissing = true
    }

    val apiTokenId: String = getEnvVar("GRID_CLIENT_ID")
    val apiClientSecret: String = getEnvVar("GRID_CLIENT_SECRET")
    val webhookPublicKey: String = getEnvVar("GRID_WEBHOOK_PUBKEY").replace("\\n", "\n")

    // Optional override for the Grid API base URL (e.g. a dev/RC environment).
    // When unset, the SDK uses its default (production) base URL.
    val apiBaseUrl: String? = getEnvVarOrNull("GRID_API_BASE_URL")

    private fun getEnvVar(key: String): String =
        getEnvVarOrNull(key)
            ?: throw IllegalStateException("$key environment variable not set")

    private fun getEnvVarOrNull(key: String): String? =
        System.getProperty(key)
            ?: dotenv[key]
            ?: System.getenv(key)
}
