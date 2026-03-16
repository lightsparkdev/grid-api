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

private fun buildAccountInfo(accountType: String, accountInfo: JsonNode): ExternalAccountInfoOneOf {
    val beneficiaryNode = accountInfo.get("beneficiary")

    return when (accountType) {
        "USD_ACCOUNT" -> {
            val beneficiary = buildUsdBeneficiary(beneficiaryNode)
            val info = UsdExternalAccountInfo.builder()
                .accountType(UsdExternalAccountInfo.AccountType.USD_ACCOUNT)
                .accountNumber(accountInfo.requireText("accountNumber"))
                .routingNumber(accountInfo.requireText("routingNumber"))
                .beneficiary(beneficiary)
                .paymentRails(buildPaymentRails(accountInfo) { UsdExternalAccountInfo.PaymentRail.of(it) })
                .build()
            ExternalAccountInfoOneOf.ofUsdAccount(info)
        }
        "INR_ACCOUNT" -> {
            val beneficiary = buildInrBeneficiary(beneficiaryNode)
            val info = InrExternalAccountInfo.builder()
                .accountType(InrExternalAccountInfo.AccountType.INR_ACCOUNT)
                .vpa(accountInfo.requireText("vpa"))
                .beneficiary(beneficiary)
                .paymentRails(buildPaymentRails(accountInfo) { InrExternalAccountInfo.PaymentRail.of(it) })
                .build()
            ExternalAccountInfoOneOf.ofInrAccount(info)
        }
        "BRL_ACCOUNT" -> {
            val beneficiary = buildBrlBeneficiary(beneficiaryNode)
            val info = BrlExternalAccountInfo.builder()
                .accountType(BrlExternalAccountInfo.AccountType.BRL_ACCOUNT)
                .pixKey(accountInfo.requireText("pixKey"))
                .pixKeyType(accountInfo.requireText("pixKeyType"))
                .taxId(accountInfo.requireText("taxId"))
                .beneficiary(beneficiary)
                .paymentRails(buildPaymentRails(accountInfo) { BrlExternalAccountInfo.PaymentRail.of(it) })
                .build()
            ExternalAccountInfoOneOf.ofBrlAccount(info)
        }
        "MXN_ACCOUNT" -> {
            val beneficiary = buildMxnBeneficiary(beneficiaryNode)
            val info = MxnExternalAccountInfo.builder()
                .accountType(MxnExternalAccountInfo.AccountType.MXN_ACCOUNT)
                .clabeNumber(accountInfo.requireText("clabeNumber"))
                .beneficiary(beneficiary)
                .paymentRails(buildPaymentRails(accountInfo) { MxnExternalAccountInfo.PaymentRail.of(it) })
                .build()
            ExternalAccountInfoOneOf.ofMxnAccount(info)
        }
        "GBP_ACCOUNT" -> {
            val beneficiary = buildGbpBeneficiary(beneficiaryNode)
            val info = GbpExternalAccountInfo.builder()
                .accountType(GbpExternalAccountInfo.AccountType.GBP_ACCOUNT)
                .sortCode(accountInfo.requireText("sortCode"))
                .accountNumber(accountInfo.requireText("accountNumber"))
                .beneficiary(beneficiary)
                .paymentRails(buildPaymentRails(accountInfo) { GbpExternalAccountInfo.PaymentRail.of(it) })
                .build()
            ExternalAccountInfoOneOf.ofGbpAccount(info)
        }
        else -> throw IllegalArgumentException("Unsupported account type: $accountType")
    }
}

private fun buildAddress(addrNode: JsonNode?): Address? {
    if (addrNode == null || addrNode.isNull) return null
    return Address.builder()
        .country(addrNode.optText("country") ?: "US")
        .line1(addrNode.optText("line1") ?: "")
        .postalCode(addrNode.optText("postalCode") ?: "")
        .apply {
            addrNode.optText("line2")?.let { line2(it) }
            addrNode.optText("city")?.let { city(it) }
            addrNode.optText("state")?.let { state(it) }
        }
        .build()
}

private fun buildUsdBeneficiary(node: JsonNode?): UsdExternalAccountInfo.Beneficiary {
    val b = if (node != null && !node.isNull) {
        UsdBeneficiary.builder()
            .beneficiaryType(UsdBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(node.optText("fullName") ?: "")
            .nationality(node.optText("nationality") ?: "US")
            .birthDate(node.optText("birthDate") ?: "1990-01-01")
            .apply { buildAddress(node.get("address"))?.let { address(it) } }
            .build()
    } else {
        UsdBeneficiary.builder()
            .beneficiaryType(UsdBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName("Account Holder")
            .nationality("US")
            .birthDate("1990-01-01")
            .build()
    }
    return UsdExternalAccountInfo.Beneficiary.ofIndividual(b)
}

private fun buildInrBeneficiary(node: JsonNode?): InrExternalAccountInfo.Beneficiary {
    val b = if (node != null && !node.isNull) {
        InrBeneficiary.builder()
            .beneficiaryType(InrBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(node.optText("fullName") ?: "")
            .apply {
                node.optText("nationality")?.let { nationality(it) }
                node.optText("birthDate")?.let { birthDate(it) }
                buildAddress(node.get("address"))?.let { address(it) }
            }
            .build()
    } else {
        InrBeneficiary.builder()
            .beneficiaryType(InrBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName("Account Holder")
            .build()
    }
    return InrExternalAccountInfo.Beneficiary.ofIndividual(b)
}

private fun buildBrlBeneficiary(node: JsonNode?): BrlExternalAccountInfo.Beneficiary {
    val b = if (node != null && !node.isNull) {
        BrlBeneficiary.builder()
            .beneficiaryType(BrlBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(node.optText("fullName") ?: "")
            .apply {
                node.optText("nationality")?.let { nationality(it) }
                node.optText("birthDate")?.let { birthDate(it) }
                buildAddress(node.get("address"))?.let { address(it) }
            }
            .build()
    } else {
        BrlBeneficiary.builder()
            .beneficiaryType(BrlBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName("Account Holder")
            .build()
    }
    return BrlExternalAccountInfo.Beneficiary.ofIndividual(b)
}

private fun buildMxnBeneficiary(node: JsonNode?): MxnExternalAccountInfo.Beneficiary {
    val b = if (node != null && !node.isNull) {
        MxnBeneficiary.builder()
            .beneficiaryType(MxnBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(node.optText("fullName") ?: "")
            .apply {
                node.optText("nationality")?.let { nationality(it) }
                node.optText("birthDate")?.let { birthDate(it) }
                buildAddress(node.get("address"))?.let { address(it) }
            }
            .build()
    } else {
        MxnBeneficiary.builder()
            .beneficiaryType(MxnBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName("Account Holder")
            .build()
    }
    return MxnExternalAccountInfo.Beneficiary.ofIndividual(b)
}

private fun buildGbpBeneficiary(node: JsonNode?): GbpExternalAccountInfo.Beneficiary {
    val b = if (node != null && !node.isNull) {
        GbpBeneficiary.builder()
            .beneficiaryType(GbpBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(node.optText("fullName") ?: "")
            .apply {
                node.optText("nationality")?.let { nationality(it) }
                node.optText("birthDate")?.let { birthDate(it) }
                buildAddress(node.get("address"))?.let { address(it) }
            }
            .build()
    } else {
        GbpBeneficiary.builder()
            .beneficiaryType(GbpBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName("Account Holder")
            .build()
    }
    return GbpExternalAccountInfo.Beneficiary.ofIndividual(b)
}

private fun <T> buildPaymentRails(accountInfo: JsonNode, parse: (String) -> T): List<T> {
    val railsNode = accountInfo.get("paymentRails")
    if (railsNode == null || !railsNode.isArray || railsNode.isEmpty) return emptyList()
    return railsNode.map { parse(it.asText()) }
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null

private fun JsonNode.requireText(field: String): String =
    optText(field) ?: throw IllegalArgumentException("$field is required")
