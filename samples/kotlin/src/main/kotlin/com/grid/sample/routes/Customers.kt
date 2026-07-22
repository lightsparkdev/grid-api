package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.customers.CustomerCreateParams
import com.lightspark.grid.models.customers.CustomerCreateParams.CreateCustomerRequest
import com.lightspark.grid.models.customers.IndividualCustomerFields
import com.lightspark.grid.models.customers.externalaccounts.Address
import com.grid.sample.Config
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.SessionRegistry
import com.grid.sample.optText
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.LocalDate
import java.util.Base64

// SDK 1.7.1 predates the current POST /customers/{id}/kyc-link endpoint shape,
// so the kyc-link route below calls the REST API directly.
private val DEFAULT_GRID_API_BASE_URL = "https://api.lightspark.com/grid/2025-10-13"
private val kycHttpClient: HttpClient by lazy { HttpClient.newHttpClient() }

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

                val body = call.receiveText().ifBlank { "{}" }
                Log.incoming("POST", "/api/customers/$customerId/kyc-link", body)

                val baseUrl = Config.apiBaseUrl ?: DEFAULT_GRID_API_BASE_URL
                val auth = Base64.getEncoder()
                    .encodeToString("${Config.apiTokenId}:${Config.apiClientSecret}".toByteArray())
                val request = HttpRequest.newBuilder()
                    .uri(URI.create("$baseUrl/customers/$customerId/kyc-link"))
                    .header("Authorization", "Basic $auth")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build()

                Log.gridRequest("customers.kycLink", body)
                val response = kycHttpClient.send(request, HttpResponse.BodyHandlers.ofString())
                Log.gridResponse("customers.kycLink", response.body())

                // Pass Grid's status through (201 on success; 400/404/409 errors verbatim).
                call.respondText(
                    response.body(),
                    ContentType.Application.Json,
                    HttpStatusCode.fromValue(response.statusCode())
                )
            } catch (e: Exception) {
                Log.gridError("customers.kycLink", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

