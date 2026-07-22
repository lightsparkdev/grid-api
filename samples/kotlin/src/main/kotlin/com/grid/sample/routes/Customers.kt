package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.customers.CustomerCreateParams
import com.lightspark.grid.models.customers.CustomerCreateParams.CreateCustomerRequest
import com.lightspark.grid.models.customers.CustomerGetKycLinkParams
import com.lightspark.grid.models.customers.IndividualCustomerFields
import com.lightspark.grid.models.customers.externalaccounts.Address
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.SessionRegistry
import com.grid.sample.optText
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
                    .customerType(IndividualCustomerFields.CustomerType.INDIVIDUAL)
                    .apply {
                        json.optText("platformCustomerId")?.let { platformCustomerId(it) }
                        json.optText("fullName")?.let { fullName(it) }
                        json.optText("email")?.let { email(it) }
                        json.optText("nationality")?.let { nationality(it) }
                        json.optText("birthDate")?.let { birthDate(LocalDate.parse(it)) }
                        json.get("address")?.takeIf { !it.isNull }?.let { addrNode ->
                            address(
                                Address.builder()
                                    .apply {
                                        addrNode.optText("country")?.let { country(it) }
                                        addrNode.optText("line1")?.let { line1(it) }
                                        addrNode.optText("postalCode")?.let { postalCode(it) }
                                        addrNode.optText("line2")?.let { line2(it) }
                                        addrNode.optText("city")?.let { city(it) }
                                        addrNode.optText("state")?.let { state(it) }
                                    }
                                    .build()
                            )
                        }
                    }
                    .build()

                val params = CustomerCreateParams.builder()
                    .createCustomerRequest(CreateCustomerRequest.ofIndividual(individual))
                    .build()

                Log.gridRequest("customers.create", JsonUtils.prettyPrint(individual))
                val customer = GridClientBuilder.client.customers().create(params)
                val responseJson = JsonUtils.prettyPrint(customer)
                Log.gridResponse("customers.create", responseJson)

                val sessionId = call.request.header("X-Session-Id")
                val customerId = JsonUtils.mapper.readTree(responseJson).get("id")?.asText()
                SessionRegistry.tag(customerId, sessionId)

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

        get("/{customerId}") {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@get call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                Log.gridRequest("customers.retrieve", customerId)
                val customer = GridClientBuilder.client.customers().retrieve(customerId)
                val responseJson = JsonUtils.prettyPrint(customer)
                Log.gridResponse("customers.retrieve", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("customers.retrieve", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        post("/{customerId}/kyc-link") {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@post call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val body = call.receiveText()
                Log.incoming("POST", "/api/customers/$customerId/kyc-link", body)
                val json = if (body.isBlank()) {
                    JsonUtils.mapper.createObjectNode()
                } else {
                    JsonUtils.mapper.readTree(body)
                }

                val params = CustomerGetKycLinkParams.builder()
                    // Fills the {customerId} path segment (SDK names it platformCustomerId).
                    .platformCustomerId(customerId)
                    .apply {
                        json.optText("redirectUri")?.let { redirectUri(it) }
                    }
                    .build()

                Log.gridRequest("customers.getKycLink", customerId)
                val link = GridClientBuilder.client.customers().getKycLink(params)
                val responseJson = JsonUtils.prettyPrint(link)
                Log.gridResponse("customers.getKycLink", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.Created)
            } catch (e: Exception) {
                Log.gridError("customers.getKycLink", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

