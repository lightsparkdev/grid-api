package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.customers.CustomerCreateParams.CreateCustomerRequest
import com.grid.api.models.customers.CustomerType
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.customerRoutes() {
    route("/api/customers") {
        post {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)

                val individualRequest = CreateCustomerRequest
                    .IndividualCustomerCreateRequest.builder()
                    .customerType(CustomerType.INDIVIDUAL)
                    .platformCustomerId(json.requiredText("platformCustomerId"))
                    .apply {
                        json.optText("fullName")?.let { fullName(it) }
                        json.optText("nationality")?.let { nationality(it) }
                    }
                    .build()

                val params = CustomerCreateParams.builder()
                    .createCustomerRequest(
                        CreateCustomerRequest.ofIndividualCustomerCreate(individualRequest)
                    )
                    .build()

                val customer = GridClientBuilder.client.customers().create(params)
                call.respondText(
                    JsonUtils.prettyPrint(customer),
                    ContentType.Application.Json,
                    HttpStatusCode.Created
                )
            } catch (e: Exception) {
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null

private fun JsonNode.requiredText(field: String): String =
    optText(field) ?: throw IllegalArgumentException("$field is required")
