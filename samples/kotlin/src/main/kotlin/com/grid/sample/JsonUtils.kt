package com.grid.sample

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

fun JsonNode.optText(field: String): String? =
    get(field)?.takeIf { !it.isNull }?.asText()

fun JsonNode.requireText(field: String): String =
    optText(field) ?: throw IllegalArgumentException("$field is required")

object JsonUtils {
    val mapper: ObjectMapper = jacksonObjectMapper().apply {
        registerModule(JavaTimeModule())
        disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        enable(SerializationFeature.INDENT_OUTPUT)
    }

    fun prettyPrint(obj: Any): String =
        try {
            mapper.writeValueAsString(obj)
        } catch (e: Exception) {
            """{"error": "Failed to serialize response: ${e.message}"}"""
        }
}
