package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.lightspark.grid.models.BrlExternalAccountCreateInfo
import com.lightspark.grid.models.EurBeneficiary
import com.lightspark.grid.models.EurExternalAccountCreateInfo
import com.lightspark.grid.models.GbpExternalAccountCreateInfo
import com.lightspark.grid.models.InrExternalAccountCreateInfo
import com.lightspark.grid.models.MxnExternalAccountCreateInfo
import com.lightspark.grid.models.PhpExternalAccountCreateInfo
import com.lightspark.grid.models.UsdExternalAccountCreateInfo
import com.lightspark.grid.models.customers.externalaccounts.Address
import com.lightspark.grid.models.customers.externalaccounts.BrlBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreate
import com.lightspark.grid.models.customers.externalaccounts.ExternalAccountCreateParams
import com.lightspark.grid.models.customers.externalaccounts.GbpBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.InrBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.MxnBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.PhpBeneficiary
import com.lightspark.grid.models.customers.externalaccounts.UsdBeneficiary
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

private fun buildAccountInfo(accountType: String, accountInfo: JsonNode): ExternalAccountCreate.AccountInfo {
    val beneficiaryNode = accountInfo.get("beneficiary")

    return when (accountType) {
        "USD_ACCOUNT" -> {
            val info = UsdExternalAccountCreateInfo.builder()
                .accountType(UsdExternalAccountCreateInfo.AccountType.USD_ACCOUNT)
                .accountNumber(accountInfo.requireText("accountNumber"))
                .routingNumber(accountInfo.requireText("routingNumber"))
                .beneficiary(buildUsdBeneficiary(beneficiaryNode))
                .build()
            ExternalAccountCreate.AccountInfo.ofUsdAccount(info)
        }
        "INR_ACCOUNT" -> {
            val info = InrExternalAccountCreateInfo.builder()
                .accountType(InrExternalAccountCreateInfo.AccountType.INR_ACCOUNT)
                .vpa(accountInfo.requireText("vpa"))
                .beneficiary(buildInrBeneficiary(beneficiaryNode))
                .build()
            ExternalAccountCreate.AccountInfo.ofInrAccount(info)
        }
        "BRL_ACCOUNT" -> {
            val info = BrlExternalAccountCreateInfo.builder()
                .accountType(BrlExternalAccountCreateInfo.AccountType.BRL_ACCOUNT)
                .pixKey(accountInfo.requireText("pixKey"))
                .pixKeyType(BrlExternalAccountCreateInfo.PixKeyType.of(accountInfo.requireText("pixKeyType")))
                .taxId(accountInfo.requireText("taxId"))
                .beneficiary(buildBrlBeneficiary(beneficiaryNode))
                .build()
            ExternalAccountCreate.AccountInfo.ofBrlAccount(info)
        }
        "MXN_ACCOUNT" -> {
            val info = MxnExternalAccountCreateInfo.builder()
                .accountType(MxnExternalAccountCreateInfo.AccountType.MXN_ACCOUNT)
                .clabeNumber(accountInfo.requireText("clabeNumber"))
                .beneficiary(buildMxnBeneficiary(beneficiaryNode))
                .build()
            ExternalAccountCreate.AccountInfo.ofMxnAccount(info)
        }
        "GBP_ACCOUNT" -> {
            val info = GbpExternalAccountCreateInfo.builder()
                .accountType(GbpExternalAccountCreateInfo.AccountType.GBP_ACCOUNT)
                .sortCode(accountInfo.requireText("sortCode"))
                .accountNumber(accountInfo.requireText("accountNumber"))
                .beneficiary(buildGbpBeneficiary(beneficiaryNode))
                .build()
            ExternalAccountCreate.AccountInfo.ofGbpAccount(info)
        }
        "PHP_ACCOUNT" -> {
            val info = PhpExternalAccountCreateInfo.builder()
                .accountType(PhpExternalAccountCreateInfo.AccountType.PHP_ACCOUNT)
                .bankName(accountInfo.optText("bankCode") ?: accountInfo.requireText("bankName"))
                .accountNumber(accountInfo.requireText("accountNumber"))
                .beneficiary(buildPhpBeneficiary(beneficiaryNode))
                .build()
            ExternalAccountCreate.AccountInfo.ofPhpAccount(info)
        }
        "EUR_ACCOUNT" -> {
            val info = EurExternalAccountCreateInfo.builder()
                .accountType(EurExternalAccountCreateInfo.AccountType.EUR_ACCOUNT)
                .iban(accountInfo.requireText("iban"))
                .beneficiary(buildEurBeneficiary(beneficiaryNode))
                .apply {
                    accountInfo.optText("swiftCode")?.let { swiftCode(it) }
                }
                .build()
            ExternalAccountCreate.AccountInfo.ofEurAccount(info)
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

private fun buildUsdBeneficiary(node: JsonNode?): UsdExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return UsdExternalAccountCreateInfo.Beneficiary.ofIndividual(
        UsdBeneficiary.builder()
            .beneficiaryType(UsdBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .nationality(f.nationality ?: "US")
            .birthDate(f.birthDate ?: "1990-01-01")
            .apply { f.address?.let { address(it) } }
            .build()
    )
}

private fun buildInrBeneficiary(node: JsonNode?): InrExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return InrExternalAccountCreateInfo.Beneficiary.ofIndividual(
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

private fun buildBrlBeneficiary(node: JsonNode?): BrlExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return BrlExternalAccountCreateInfo.Beneficiary.ofIndividual(
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

private fun buildMxnBeneficiary(node: JsonNode?): MxnExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return MxnExternalAccountCreateInfo.Beneficiary.ofIndividual(
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

private fun buildGbpBeneficiary(node: JsonNode?): GbpExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return GbpExternalAccountCreateInfo.Beneficiary.ofIndividual(
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

private fun buildPhpBeneficiary(node: JsonNode?): PhpExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return PhpExternalAccountCreateInfo.Beneficiary.ofIndividual(
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

private fun buildEurBeneficiary(node: JsonNode?): EurExternalAccountCreateInfo.Beneficiary {
    val f = parseBeneficiaryFields(node)
    return EurExternalAccountCreateInfo.Beneficiary.ofIndividual(
        EurBeneficiary.builder()
            .beneficiaryType(EurBeneficiary.BeneficiaryType.INDIVIDUAL)
            .fullName(f.fullName)
            .address(f.address ?: throw IllegalArgumentException("EUR beneficiary requires an address"))
            .apply {
                f.nationality?.let { nationality(it) }
                f.birthDate?.let { birthDate(it) }
            }
            .build()
    )
}
