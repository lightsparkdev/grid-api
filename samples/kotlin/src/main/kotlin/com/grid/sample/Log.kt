package com.grid.sample

import org.slf4j.LoggerFactory

object Log {
    private val logger = LoggerFactory.getLogger("grid-sample")

    private const val RESET = "\u001B[0m"
    private const val CYAN = "\u001B[36m"
    private const val GREEN = "\u001B[32m"
    private const val YELLOW = "\u001B[33m"
    private const val MAGENTA = "\u001B[35m"
    private const val RED = "\u001B[31m"
    private const val DIM = "\u001B[2m"
    private const val BOLD = "\u001B[1m"

    fun incoming(method: String, path: String, body: String? = null) {
        logger.info("${CYAN}${BOLD}⬇ FE REQUEST${RESET}  ${CYAN}$method $path${RESET}")
        body?.let {
            if (it.isNotBlank()) logger.info("${DIM}  Body: ${prettyOneLine(it)}${RESET}")
        }
    }

    fun gridRequest(operation: String, detail: String? = null) {
        logger.info("${YELLOW}${BOLD}➡ GRID API${RESET}   ${YELLOW}$operation${RESET}")
        detail?.let {
            logger.info("${DIM}  Params: ${prettyOneLine(it)}${RESET}")
        }
    }

    fun gridResponse(operation: String, response: String) {
        logger.info("${GREEN}${BOLD}⬅ GRID RESP${RESET}  ${GREEN}$operation${RESET}")
        logger.info("${DIM}  ${prettyOneLine(response)}${RESET}")
    }

    fun gridError(operation: String, error: Exception) {
        logger.error("${RED}${BOLD}✘ GRID ERR${RESET}   ${RED}$operation: ${error.message}${RESET}")
    }

    fun webhook(body: String) {
        logger.info("${MAGENTA}${BOLD}⚡ WEBHOOK${RESET}   ${MAGENTA}${prettyOneLine(body)}${RESET}")
    }

    fun webhookSignatureResult(valid: Boolean) {
        if (valid) {
            logger.info("${GREEN}  Signature: valid${RESET}")
        } else {
            logger.warn("${RED}  Signature: INVALID${RESET}")
        }
    }

    fun response(status: Int) {
        val color = if (status < 400) GREEN else RED
        logger.info("${color}${BOLD}⬆ FE RESPONSE${RESET} ${color}$status${RESET}")
    }

    private fun prettyOneLine(json: String): String {
        val trimmed = json.trim()
        return if (trimmed.length > 500) trimmed.take(500) + "..." else trimmed
    }
}
