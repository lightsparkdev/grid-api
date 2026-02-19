package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.customers.externalaccounts.BeneficiaryOneOf
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreate
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreateParams
import com.lightspark.grid.models.customers.externalaccounts.UsAccountInfo
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.time.LocalDate

fun Route.externalAccountRoutes() {
    route("/api/customers/{customerId}/external-accounts") {
        post {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@post call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                Log.incoming("POST", "/api/customers/$customerId/external-accounts", body)
                val accountInfo = json.get("accountInfo")

                val beneficiaryNode = json.get("beneficiary")
                val beneficiary = if (beneficiaryNode != null && !beneficiaryNode.isNull) {
                    BeneficiaryOneOf.Individual.builder()
                        .fullName(beneficiaryNode.optText("fullName") ?: "")
                        .nationality(beneficiaryNode.optText("nationality") ?: "US")
                        .birthDate(LocalDate.parse(
                            beneficiaryNode.optText("birthDate") ?: "1990-01-01"
                        ))
                        .apply {
                            beneficiaryNode.get("address")?.takeIf { !it.isNull }?.let { addrNode ->
                                address(
                                    BeneficiaryOneOf.Individual.Address.builder()
                                        .country(addrNode.optText("country") ?: "US")
                                        .line1(addrNode.optText("line1") ?: "")
                                        .postalCode(addrNode.optText("postalCode") ?: "")
                                        .apply {
                                            addrNode.optText("line2")?.let { line2(it) }
                                            addrNode.optText("city")?.let { city(it) }
                                            addrNode.optText("state")?.let { state(it) }
                                        }
                                        .build()
                                )
                            }
                        }
                        .build()
                } else {
                    BeneficiaryOneOf.Individual.builder()
                        .fullName("Account Holder")
                        .nationality("US")
                        .birthDate(LocalDate.parse("1990-01-01"))
                        .build()
                }

                val accountCategory = when (accountInfo.optText("accountCategory")?.uppercase()) {
                    "SAVINGS" -> UsAccountInfo.AccountCategory.SAVINGS
                    else -> UsAccountInfo.AccountCategory.CHECKING
                }

                val usAccountInfo = UsAccountInfo.builder()
                    .accountType(UsAccountInfo.AccountType.US_ACCOUNT)
                    .accountCategory(accountCategory)
                    .accountNumber(accountInfo.get("accountNumber").asText())
                    .routingNumber(accountInfo.get("routingNumber").asText())
                    .beneficiary(beneficiary)
                    .apply {
                        accountInfo.optText("bankName")?.let { bankName(it) }
                    }
                    .build()

                val externalAccountCreate = ExternalAccountCreate.builder()
                    .accountInfo(usAccountInfo)
                    .currency(json.optText("currency") ?: "USD")
                    .customerId(customerId)
                    .apply {
                        json.optText("platformAccountId")?.let { platformAccountId(it) }
                    }
                    .build()

                val params = ExternalAccountCreateParams.builder()
                    .externalAccountCreate(externalAccountCreate)
                    .build()

                Log.gridRequest("customers.externalAccounts.create", JsonUtils.prettyPrint(externalAccountCreate))
                val account = GridClientBuilder.client.customers().externalAccounts().create(params)
                val responseJson = JsonUtils.prettyPrint(account)
                Log.gridResponse("customers.externalAccounts.create", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.Created)
            } catch (e: Exception) {
                Log.gridError("customers.externalAccounts.create", e)
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
