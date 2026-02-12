package com.grid.sample

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

object JsonUtils {
    val mapper: ObjectMapper = jacksonObjectMapper().apply {
        enable(SerializationFeature.INDENT_OUTPUT)
    }

    fun prettyPrint(obj: Any): String =
        try {
            mapper.writeValueAsString(obj)
        } catch (e: Exception) {
            """{"error": "Failed to serialize response: ${e.message}"}"""
        }
}
