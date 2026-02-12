package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.grid.api.models.customers.externalaccounts.BaseExternalAccountInfo
import com.grid.api.models.customers.externalaccounts.BeneficiaryOneOf
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreateParams
import com.grid.api.models.customers.externalaccounts.ExternalAccountInfoOneOf
import com.grid.api.models.customers.externalaccounts.IndividualBeneficiary
import com.grid.api.models.customers.externalaccounts.BaseBeneficiary
import com.grid.api.models.customers.externalaccounts.UsAccountInfo
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
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
                val accountInfo = json.get("accountInfo")

                val beneficiaryNode = json.get("beneficiary")
                val beneficiary = if (beneficiaryNode != null && !beneficiaryNode.isNull) {
                    BeneficiaryOneOf.ofIndividualBeneficiary(
                        IndividualBeneficiary.builder()
                            .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
                            .fullName(beneficiaryNode.optText("fullName") ?: "")
                            .nationality(beneficiaryNode.optText("nationality") ?: "US")
                            .birthDate(LocalDate.parse(
                                beneficiaryNode.optText("birthDate") ?: "1990-01-01"
                            ))
                            .build()
                    )
                } else {
                    BeneficiaryOneOf.ofIndividualBeneficiary(
                        IndividualBeneficiary.builder()
                            .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
                            .fullName("Account Holder")
                            .nationality("US")
                            .birthDate(LocalDate.parse("1990-01-01"))
                            .build()
                    )
                }

                val accountCategory = when (accountInfo.optText("accountType")?.uppercase()) {
                    "SAVINGS" -> UsAccountInfo.AccountCategory.SAVINGS
                    else -> UsAccountInfo.AccountCategory.CHECKING
                }

                val usAccountInfo = ExternalAccountInfoOneOf
                    .UsAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                    .accountCategory(accountCategory)
                    .accountNumber(accountInfo.get("accountNumber").asText())
                    .routingNumber(accountInfo.get("routingNumber").asText())
                    .beneficiary(beneficiary)
                    .build()

                val externalAccountCreate = ExternalAccountCreate.builder()
                    .accountInfo(
                        ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(usAccountInfo)
                    )
                    .currency(json.optText("currency") ?: "USD")
                    .customerId(customerId)
                    .apply {
                        json.optText("platformAccountId")?.let { platformAccountId(it) }
                    }
                    .build()

                val params = ExternalAccountCreateParams.builder()
                    .externalAccountCreate(externalAccountCreate)
                    .build()

                val account = GridClientBuilder.client.customers().externalAccounts().create(params)
                call.respondText(
                    JsonUtils.prettyPrint(account),
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
