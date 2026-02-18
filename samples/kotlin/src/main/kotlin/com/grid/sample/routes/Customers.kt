package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.customers.CustomerCreateParams
import com.lightspark.grid.models.customers.CustomerCreateParams.CreateCustomerRequest
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.time.LocalDate

fun Route.customerRoutes() {
    route("/api/customers") {
        post {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/customers", body)

                val individual = CreateCustomerRequest.Individual.builder()
                    .customerType(CreateCustomerRequest.Individual.CustomerType.INDIVIDUAL)
                    .platformCustomerId(json.requiredText("platformCustomerId"))
                    .apply {
                        json.optText("fullName")?.let { fullName(it) }
                        json.optText("nationality")?.let { nationality(it) }
                        json.optText("birthDate")?.let { birthDate(LocalDate.parse(it)) }
                        json.get("address")?.takeIf { !it.isNull }?.let { addrNode ->
                            address(
                                CreateCustomerRequest.Individual.Address.builder()
                                    .apply {
                                        addrNode.optText("line1")?.let { line1(it) }
                                        addrNode.optText("line2")?.let { line2(it) }
                                        addrNode.optText("city")?.let { city(it) }
                                        addrNode.optText("state")?.let { state(it) }
                                        addrNode.optText("postalCode")?.let { postalCode(it) }
                                        addrNode.optText("country")?.let { country(it) }
                                    }
                                    .build()
                            )
                        }
                    }
                    .build()

                val params = CustomerCreateParams.builder()
                    .createCustomerRequest(individual)
                    .build()

                Log.gridRequest("customers.create", JsonUtils.prettyPrint(individual))
                val customer = GridClientBuilder.client.customers().create(params)
                val responseJson = JsonUtils.prettyPrint(customer)
                Log.gridResponse("customers.create", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.Created)
            } catch (e: Exception) {
                Log.gridError("customers.create", e)
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
