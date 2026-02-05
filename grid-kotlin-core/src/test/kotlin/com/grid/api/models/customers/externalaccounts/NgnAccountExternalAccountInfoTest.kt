// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class NgnAccountExternalAccountInfoTest {

    @Test
    fun create() {
        val ngnAccountExternalAccountInfo =
            NgnAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.NGN_ACCOUNT)
                .accountNumber("0123456789")
                .bankName("First Bank of Nigeria")
                .beneficiary(
                    IndividualBeneficiary.builder()
                        .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .build()
                )
                .purposeOfPayment(NgnAccountExternalAccountInfo.PurposeOfPayment.GOODS_OR_SERVICES)
                .build()

        assertThat(ngnAccountExternalAccountInfo.accountType())
            .isEqualTo(BaseExternalAccountInfo.AccountType.NGN_ACCOUNT)
        assertThat(ngnAccountExternalAccountInfo.accountNumber()).isEqualTo("0123456789")
        assertThat(ngnAccountExternalAccountInfo.bankName()).isEqualTo("First Bank of Nigeria")
        assertThat(ngnAccountExternalAccountInfo.beneficiary())
            .isEqualTo(
                BeneficiaryOneOf.ofIndividualBeneficiary(
                    IndividualBeneficiary.builder()
                        .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .build()
                )
            )
        assertThat(ngnAccountExternalAccountInfo.purposeOfPayment())
            .isEqualTo(NgnAccountExternalAccountInfo.PurposeOfPayment.GOODS_OR_SERVICES)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val ngnAccountExternalAccountInfo =
            NgnAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.NGN_ACCOUNT)
                .accountNumber("0123456789")
                .bankName("First Bank of Nigeria")
                .beneficiary(
                    IndividualBeneficiary.builder()
                        .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .build()
                )
                .purposeOfPayment(NgnAccountExternalAccountInfo.PurposeOfPayment.GOODS_OR_SERVICES)
                .build()

        val roundtrippedNgnAccountExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(ngnAccountExternalAccountInfo),
                jacksonTypeRef<NgnAccountExternalAccountInfo>(),
            )

        assertThat(roundtrippedNgnAccountExternalAccountInfo)
            .isEqualTo(ngnAccountExternalAccountInfo)
    }
}
