package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.customers.externalaccounts.Address
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreate
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreateParams
import com.lightspark.grid.models.customers.externalaccounts.InrBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.InrExternalAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.InrAccountInfo
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

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
                    InrBeneficiary.builder()
                        .beneficiaryType(InrBeneficiary.BeneficiaryType.INDIVIDUAL)
                        .fullName(beneficiaryNode.optText("fullName") ?: "")
                        .nationality(beneficiaryNode.optText("nationality") ?: "IN")
                        .birthDate(beneficiaryNode.optText("birthDate") ?: "1990-01-01")
                        .apply {
                            beneficiaryNode.optText("email")?.let { email(it) }
                            beneficiaryNode.optText("phoneNumber")?.let { phoneNumber(it) }
                            beneficiaryNode.get("address")?.takeIf { !it.isNull }?.let { addrNode ->
                                address(
                                    Address.builder()
                                        .country(addrNode.optText("country") ?: "IN")
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
                    InrBeneficiary.builder()
                        .beneficiaryType(InrBeneficiary.BeneficiaryType.INDIVIDUAL)
                        .fullName("Account Holder")
                        .nationality("IN")
                        .birthDate("1990-01-01")
                        .build()
                }

                val inrAccountInfo = InrExternalAccountInfo.builder()
                    .accountType(InrAccountInfo.AccountType.INR_ACCOUNT)
                    .vpa(accountInfo.get("vpa").asText())
                    .addPaymentRail(InrAccountInfo.PaymentRail.UPI)
                    .beneficiary(beneficiary)
                    .build()

                val externalAccountCreate = ExternalAccountCreate.builder()
                    .accountInfo(inrAccountInfo)
                    .currency(json.optText("currency") ?: "INR")
                    .apply {
                        customerId(customerId)
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
