// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.externalaccounts.BeneficiaryOneOf
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import com.grid.api.models.customers.externalaccounts.ExternalAccountInfoOneOf
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class QuoteDestinationOneOfTest {

    @Test
    fun ofAccountDestination() {
        val accountDestination =
            QuoteDestinationOneOf.AccountDestination.builder()
                .destinationType(BaseDestination.DestinationType.ACCOUNT)
                .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                .build()

        val quoteDestinationOneOf = QuoteDestinationOneOf.ofAccountDestination(accountDestination)

        assertThat(quoteDestinationOneOf.accountDestination()).isEqualTo(accountDestination)
        assertThat(quoteDestinationOneOf.umaAddressDestination()).isNull()
        assertThat(quoteDestinationOneOf.externalAccountDetailsDestination()).isNull()
    }

    @Test
    fun ofAccountDestinationRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteDestinationOneOf =
            QuoteDestinationOneOf.ofAccountDestination(
                QuoteDestinationOneOf.AccountDestination.builder()
                    .destinationType(BaseDestination.DestinationType.ACCOUNT)
                    .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .build()
            )

        val roundtrippedQuoteDestinationOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteDestinationOneOf),
                jacksonTypeRef<QuoteDestinationOneOf>(),
            )

        assertThat(roundtrippedQuoteDestinationOneOf).isEqualTo(quoteDestinationOneOf)
    }

    @Test
    fun ofUmaAddressDestination() {
        val umaAddressDestination =
            QuoteDestinationOneOf.UmaAddressDestination.builder()
                .destinationType(BaseDestination.DestinationType.UMA_ADDRESS)
                .umaAddress("\$receiver@uma.domain.com")
                .counterpartyInformation(
                    QuoteDestinationOneOf.UmaAddressDestination.CounterpartyInformation.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .currency("EUR")
                .build()

        val quoteDestinationOneOf =
            QuoteDestinationOneOf.ofUmaAddressDestination(umaAddressDestination)

        assertThat(quoteDestinationOneOf.accountDestination()).isNull()
        assertThat(quoteDestinationOneOf.umaAddressDestination()).isEqualTo(umaAddressDestination)
        assertThat(quoteDestinationOneOf.externalAccountDetailsDestination()).isNull()
    }

    @Test
    fun ofUmaAddressDestinationRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteDestinationOneOf =
            QuoteDestinationOneOf.ofUmaAddressDestination(
                QuoteDestinationOneOf.UmaAddressDestination.builder()
                    .destinationType(BaseDestination.DestinationType.UMA_ADDRESS)
                    .umaAddress("\$receiver@uma.domain.com")
                    .counterpartyInformation(
                        QuoteDestinationOneOf.UmaAddressDestination.CounterpartyInformation
                            .builder()
                            .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                            .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                            .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                            .build()
                    )
                    .currency("EUR")
                    .build()
            )

        val roundtrippedQuoteDestinationOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteDestinationOneOf),
                jacksonTypeRef<QuoteDestinationOneOf>(),
            )

        assertThat(roundtrippedQuoteDestinationOneOf).isEqualTo(quoteDestinationOneOf)
    }

    @Test
    fun ofExternalAccountDetailsDestination() {
        val externalAccountDetailsDestination =
            QuoteDestinationOneOf.ExternalAccountDetailsDestination.builder()
                .destinationType(BaseDestination.DestinationType.EXTERNAL_ACCOUNT_DETAILS)
                .externalAccountDetails(
                    ExternalAccountCreate.builder()
                        .accountInfo(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                                .accountCategory(
                                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo
                                        .AccountCategory
                                        .CHECKING
                                )
                                .accountNumber("123456789")
                                .accountType(
                                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo
                                        .AccountType
                                        .US_ACCOUNT
                                )
                                .beneficiary(
                                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                                        .beneficiaryType(
                                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType
                                                .INDIVIDUAL
                                        )
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Michael Doe")
                                        .nationality("US")
                                        .address(
                                            Address.builder()
                                                .country("US")
                                                .line1("123 Main Street")
                                                .postalCode("94105")
                                                .city("San Francisco")
                                                .line2("Apt 4B")
                                                .state("CA")
                                                .build()
                                        )
                                        .build()
                                )
                                .routingNumber("987654321")
                                .bankName("Chase Bank")
                                .build()
                        )
                        .currency("USD")
                        .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                        .defaultUmaDepositAccount(true)
                        .platformAccountId("ext_acc_123456")
                        .build()
                )
                .build()

        val quoteDestinationOneOf =
            QuoteDestinationOneOf.ofExternalAccountDetailsDestination(
                externalAccountDetailsDestination
            )

        assertThat(quoteDestinationOneOf.accountDestination()).isNull()
        assertThat(quoteDestinationOneOf.umaAddressDestination()).isNull()
        assertThat(quoteDestinationOneOf.externalAccountDetailsDestination())
            .isEqualTo(externalAccountDetailsDestination)
    }

    @Test
    fun ofExternalAccountDetailsDestinationRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteDestinationOneOf =
            QuoteDestinationOneOf.ofExternalAccountDetailsDestination(
                QuoteDestinationOneOf.ExternalAccountDetailsDestination.builder()
                    .destinationType(BaseDestination.DestinationType.EXTERNAL_ACCOUNT_DETAILS)
                    .externalAccountDetails(
                        ExternalAccountCreate.builder()
                            .accountInfo(
                                ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                                    .accountCategory(
                                        ExternalAccountInfoOneOf.UsAccountExternalAccountInfo
                                            .AccountCategory
                                            .CHECKING
                                    )
                                    .accountNumber("123456789")
                                    .accountType(
                                        ExternalAccountInfoOneOf.UsAccountExternalAccountInfo
                                            .AccountType
                                            .US_ACCOUNT
                                    )
                                    .beneficiary(
                                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                                            .beneficiaryType(
                                                BeneficiaryOneOf.IndividualBeneficiary
                                                    .BeneficiaryType
                                                    .INDIVIDUAL
                                            )
                                            .birthDate(LocalDate.parse("1990-01-15"))
                                            .fullName("John Michael Doe")
                                            .nationality("US")
                                            .address(
                                                Address.builder()
                                                    .country("US")
                                                    .line1("123 Main Street")
                                                    .postalCode("94105")
                                                    .city("San Francisco")
                                                    .line2("Apt 4B")
                                                    .state("CA")
                                                    .build()
                                            )
                                            .build()
                                    )
                                    .routingNumber("987654321")
                                    .bankName("Chase Bank")
                                    .build()
                            )
                            .currency("USD")
                            .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                            .defaultUmaDepositAccount(true)
                            .platformAccountId("ext_acc_123456")
                            .build()
                    )
                    .build()
            )

        val roundtrippedQuoteDestinationOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteDestinationOneOf),
                jacksonTypeRef<QuoteDestinationOneOf>(),
            )

        assertThat(roundtrippedQuoteDestinationOneOf).isEqualTo(quoteDestinationOneOf)
    }

    enum class IncompatibleJsonShapeTestCase(val value: JsonValue) {
        BOOLEAN(JsonValue.from(false)),
        STRING(JsonValue.from("invalid")),
        INTEGER(JsonValue.from(-1)),
        FLOAT(JsonValue.from(3.14)),
        ARRAY(JsonValue.from(listOf("invalid", "array"))),
    }

    @ParameterizedTest
    @EnumSource
    fun incompatibleJsonShapeDeserializesToUnknown(testCase: IncompatibleJsonShapeTestCase) {
        val quoteDestinationOneOf =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<QuoteDestinationOneOf>())

        val e = assertThrows<GridInvalidDataException> { quoteDestinationOneOf.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
