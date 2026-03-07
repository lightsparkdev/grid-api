package com.grid.sample

import io.github.cdimascio.dotenv.dotenv

object Config {
    private val dotenv = dotenv {
        directory = "./"
        ignoreIfMalformed = true
        ignoreIfMissing = true
    }

    val gridClientId: String = getEnvVar("GRID_CLIENT_ID")
    val gridClientSecret: String = getEnvVar("GRID_CLIENT_SECRET")
    val webhookPubkey: String = getEnvVar("GRID_WEBHOOK_PUBKEY").replace("\\n", "\n")

    private fun getEnvVar(key: String): String =
        System.getProperty(key)
            ?: dotenv[key]
            ?: System.getenv(key)
            ?: throw IllegalStateException("$key environment variable not set")
}
