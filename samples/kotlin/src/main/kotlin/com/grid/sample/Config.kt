package com.grid.sample

import io.github.cdimascio.dotenv.dotenv

object Config {
    private val dotenv = dotenv {
        directory = "./"
        ignoreIfMalformed = true
        ignoreIfMissing = true
    }

    val apiTokenId: String = getEnvVar("GRID_API_TOKEN_ID")
    val apiClientSecret: String = getEnvVar("GRID_API_CLIENT_SECRET")
    val webhookPublicKey: String = getEnvVar("GRID_WEBHOOK_PUBLIC_KEY").replace("\\n", "\n")

    private fun getEnvVar(key: String): String =
        System.getProperty(key)
            ?: dotenv[key]
            ?: System.getenv(key)
            ?: throw IllegalStateException("$key environment variable not set")
}
