package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.customers.externalaccounts.Address
import com.lightspark.grid.models.customers.externalaccounts.BrlBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.BrlExternalAccountInfo
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreate
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreateParams
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountInfoOneOf
import com.lightspark.grid.models.customers.externalaccounts.GbpBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.GbpExternalAccountInfo
import com.lightspark.grid.models.customers.externalaccounts.InrBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.InrExternalAccountInfo
import com.lightspark.grid.models.customers.externalaccounts.MxnBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.MxnExternalAccountInfo
import com.lightspark.grid.models.customers.externalaccounts.PhpBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.PhpExternalAccountInfo
import com.lightspark.grid.models.customers.externalaccounts.UsdBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.UsdExternalAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.BrlAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.EurAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.GbpAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.InrAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.MxnAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.PhpAccountInfo
import com.lightspark.grid.models.platform.externalaccounts.UsdAccountInfo
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import com.grid.sample.optText
import com.grid.sample.requireText
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
                val accountInfoNode = json.get("accountInfo")
                    ?: return@post call.respondText(
                        """{"error": "accountInfo is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val accountType = accountInfoNode.optText("accountType")
                    ?: return@post call.respondText(
                        """{"error": "accountInfo.accountType is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val accountInfo = buildAccountInfo(accountType, accountInfoNode)

                val externalAccountCreate = ExternalAccountCreate.builder()
                    .accountInfo(accountInfo)
                    .currency(json.optText("currency") ?: "USD")
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
                .accountType(UsdAccountInfo.AccountType.USD_ACCOUNT)
                .accountNumber(accountInfo.requireText("accountNumber"))
                .routingNumber(accountInfo.requireText("routingNumber"))
                .beneficiary(beneficiary)
                .build()
            ExternalAccountInfoOneOf.ofUsdAccount(info)
        }
        "INR_ACCOUNT" -> {
            val beneficiary = buildInrBeneficiary(beneficiaryNode)
            val info = InrExternalAccountInfo.builder()
                .accountType(InrAccountInfo.AccountType.INR_ACCOUNT)
                .vpa(accountInfo.requireText("vpa"))
                .beneficiary(beneficiary)
                .build()
            ExternalAccountInfoOneOf.ofInrAccount(info)
        }
        "BRL_ACCOUNT" -> {
            val beneficiary = buildBrlBeneficiary(beneficiaryNode)
            val info = BrlExternalAccountInfo.builder()
                .accountType(BrlAccountInfo.AccountType.BRL_ACCOUNT)
                .pixKey(accountInfo.requireText("pixKey"))
                .pixKeyType(accountInfo.requireText("pixKeyType"))
                .taxId(accountInfo.requireText("taxId"))
                .beneficiary(beneficiary)
                .build()
            ExternalAccountInfoOneOf.ofBrlAccount(info)
        }
        "MXN_ACCOUNT" -> {
            val beneficiary = buildMxnBeneficiary(beneficiaryNode)
            val info = MxnExternalAccountInfo.builder()
                .accountType(MxnAccountInfo.AccountType.MXN_ACCOUNT)
                .clabeNumber(accountInfo.requireText("clabeNumber"))
                .beneficiary(beneficiary)
                .build()
            ExternalAccountInfoOneOf.ofMxnAccount(info)
        }
        "GBP_ACCOUNT" -> {
            val beneficiary = buildGbpBeneficiary(beneficiaryNode)
            val info = GbpExternalAccountInfo.builder()
                .accountType(GbpAccountInfo.AccountType.GBP_ACCOUNT)
                .sortCode(accountInfo.requireText("sortCode"))
                .accountNumber(accountInfo.requireText("accountNumber"))
                .beneficiary(beneficiary)
                .build()
            ExternalAccountInfoOneOf.ofGbpAccount(info)
        }
        "PHP_ACCOUNT" -> {
            val beneficiary = buildPhpBeneficiary(beneficiaryNode)
            val info = PhpExternalAccountInfo.builder()
                .accountType(PhpAccountInfo.AccountType.PHP_ACCOUNT)
                .bankName(accountInfo.optText("bankCode") ?: accountInfo.requireText("bankName"))
                .accountNumber(accountInfo.requireText("accountNumber"))
                .beneficiary(beneficiary)
                .build()
            ExternalAccountInfoOneOf.ofPhpAccount(info)
        }
        "EUR_ACCOUNT" -> {
            val beneficiary = buildEurBeneficiary(beneficiaryNode)
            val info = ExternalAccountInfoOneOf.EurAccount.builder()
                .accountType(EurAccountInfo.AccountType.EUR_ACCOUNT)
                .iban(accountInfo.requireText("iban"))
                .beneficiary(beneficiary)
                .apply {
                    val swiftCode = accountInfo.optText("swiftCode")
                    if (swiftCode != null) {
                        swiftBic(swiftCode)
                        // Workaround: SDK serializes as "swiftBic" but the API expects "swiftCode"
                        putAdditionalProperty("swiftCode", com.lightspark.grid.core.JsonValue.from(swiftCode))
                    }
                }
                .build()
            ExternalAccountInfoOneOf.ofEurAccount(info)
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

/** Parsed beneficiary fields shared across all currency types. */
private data class BeneficiaryFields(
    val fullName: String,
    val nationality: String?,
    val birthDate: String?,
    val address: Address?,
)

private fun parseBeneficiaryFields(node: JsonNode?): BeneficiaryFields {
    if (node == null || node.isNull) return BeneficiaryFields("Account Holder", null, null, null)
    return BeneficiaryFields(
        fullName = node.optText("fullName") ?: "",
        nationality = node.optText("countryOfResidence") ?: node.optText("nationality"),
        birthDate = node.optText("birthDate"),
        address = buildAddress(node.get("address")),
    )
}

private fun buildUsdBeneficiary(node: JsonNode?): UsdExternalAccountInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return UsdExternalAccountInfo.Beneficiary.ofIndividual(
        UsdBeneficiary.builder()
            .beneficiaryType(UsdBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .nationality(f.nationality ?: "US")
            .birthDate(f.birthDate ?: "1990-01-01")
            .apply { f.address?.let { address(it) } }
            .build()
    )
}

private fun buildInrBeneficiary(node: JsonNode?): InrExternalAccountInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return InrExternalAccountInfo.Beneficiary.ofIndividual(
        InrBeneficiary.builder()
            .beneficiaryType(InrBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
                f.address?.let { address(it) }
            }
            .build()
    )
}

private fun buildBrlBeneficiary(node: JsonNode?): BrlExternalAccountInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return BrlExternalAccountInfo.Beneficiary.ofIndividual(
        BrlBeneficiary.builder()
            .beneficiaryType(BrlBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
                f.address?.let { address(it) }
            }
            .build()
    )
}

private fun buildMxnBeneficiary(node: JsonNode?): MxnExternalAccountInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return MxnExternalAccountInfo.Beneficiary.ofIndividual(
        MxnBeneficiary.builder()
            .beneficiaryType(MxnBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
                f.address?.let { address(it) }
            }
            .build()
    )
}

private fun buildGbpBeneficiary(node: JsonNode?): GbpExternalAccountInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return GbpExternalAccountInfo.Beneficiary.ofIndividual(
        GbpBeneficiary.builder()
            .beneficiaryType(GbpBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
                f.address?.let { address(it) }
            }
            .build()
    )
}

private fun buildPhpBeneficiary(node: JsonNode?): PhpExternalAccountInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return PhpExternalAccountInfo.Beneficiary.ofIndividual(
        PhpBeneficiary.builder()
            .beneficiaryType(PhpBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
                f.address?.let { address(it) }
            }
            .build()
    )
}

private fun buildEurBeneficiary(node: JsonNode?): ExternalAccountInfoOneOf.EurAccount.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return ExternalAccountInfoOneOf.EurAccount.Beneficiary.ofIndividual(
        ExternalAccountInfoOneOf.EurAccount.Beneficiary.Individual.builder()
            .fullName(f.fullName)
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
                f.address?.let { address(it) }
            }
            .build()
    )
}


