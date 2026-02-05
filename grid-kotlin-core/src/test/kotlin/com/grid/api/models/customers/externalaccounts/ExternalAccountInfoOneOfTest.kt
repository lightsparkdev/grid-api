// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class ExternalAccountInfoOneOfTest {

    @Test
    fun ofUsAccountExternalAccountInfo() {
        val usAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                .accountNumber("123456789")
                .routingNumber("987654321")
                .bankName("Chase Bank")
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
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(usAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo())
            .isEqualTo(usAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofUsAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                    .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                    .accountNumber("123456789")
                    .routingNumber("987654321")
                    .bankName("Chase Bank")
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
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofClabeAccountExternalAccountInfo() {
        val clabeAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.ClabeAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.CLABE)
                .clabeNumber("123456789012345678")
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
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofClabeAccountExternalAccountInfo(
                clabeAccountExternalAccountInfo
            )

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo())
            .isEqualTo(clabeAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofClabeAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofClabeAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.ClabeAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.CLABE)
                    .clabeNumber("123456789012345678")
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
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofPixAccountExternalAccountInfo() {
        val pixAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.PixAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.PIX)
                .pixKey("55119876543210")
                .pixKeyType(PixAccountInfo.PixKeyType.PHONE)
                .taxId("1234567890")
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
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPixAccountExternalAccountInfo(pixAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo())
            .isEqualTo(pixAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofPixAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPixAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.PixAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.PIX)
                    .pixKey("55119876543210")
                    .pixKeyType(PixAccountInfo.PixKeyType.PHONE)
                    .taxId("1234567890")
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
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofIbanAccountExternalAccountInfo() {
        val ibanAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.IbanAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.IBAN)
                .iban("DE89370400440532013000")
                .swiftBic("DEUTDEFF")
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
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofIbanAccountExternalAccountInfo(
                ibanAccountExternalAccountInfo
            )

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo())
            .isEqualTo(ibanAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofIbanAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofIbanAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.IbanAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.IBAN)
                    .iban("DE89370400440532013000")
                    .swiftBic("DEUTDEFF")
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
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofUpiAccountExternalAccountInfo() {
        val upiAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.UpiAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.UPI)
                .vpa("somecustomers@okbank")
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
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofUpiAccountExternalAccountInfo(upiAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo())
            .isEqualTo(upiAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofUpiAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofUpiAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.UpiAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.UPI)
                    .vpa("somecustomers@okbank")
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
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofNgnAccountExternalAccountInfo() {
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

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofNgnAccountExternalAccountInfo(ngnAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo())
            .isEqualTo(ngnAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofNgnAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofNgnAccountExternalAccountInfo(
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
                    .purposeOfPayment(
                        NgnAccountExternalAccountInfo.PurposeOfPayment.GOODS_OR_SERVICES
                    )
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofCadAccountExternalAccountInfo() {
        val cadAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.CadAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.CAD_ACCOUNT)
                .accountNumber("1234567")
                .bankCode("001")
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
                .branchCode("00012")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofCadAccountExternalAccountInfo(cadAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo())
            .isEqualTo(cadAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofCadAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofCadAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.CadAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.CAD_ACCOUNT)
                    .accountNumber("1234567")
                    .bankCode("001")
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
                    .branchCode("00012")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofGbpAccountExternalAccountInfo() {
        val gbpAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.GbpAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.GBP_ACCOUNT)
                .accountNumber("12345678")
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
                .sortCode("20-00-00")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofGbpAccountExternalAccountInfo(gbpAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo())
            .isEqualTo(gbpAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofGbpAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofGbpAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.GbpAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.GBP_ACCOUNT)
                    .accountNumber("12345678")
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
                    .sortCode("20-00-00")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofPhpAccountExternalAccountInfo() {
        val phpAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.PhpAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.PHP_ACCOUNT)
                .accountNumber("001234567890")
                .bankName("BDO Unibank")
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
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPhpAccountExternalAccountInfo(phpAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo())
            .isEqualTo(phpAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofPhpAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPhpAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.PhpAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.PHP_ACCOUNT)
                    .accountNumber("001234567890")
                    .bankName("BDO Unibank")
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
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofSgdAccountExternalAccountInfo() {
        val sgdAccountExternalAccountInfo =
            ExternalAccountInfoOneOf.SgdAccountExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.SGD_ACCOUNT)
                .accountNumber("0123456789")
                .bankName("DBS Bank Ltd")
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
                .swiftCode("DBSSSGSG")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSgdAccountExternalAccountInfo(sgdAccountExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo())
            .isEqualTo(sgdAccountExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofSgdAccountExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSgdAccountExternalAccountInfo(
                ExternalAccountInfoOneOf.SgdAccountExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.SGD_ACCOUNT)
                    .accountNumber("0123456789")
                    .bankName("DBS Bank Ltd")
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
                    .swiftCode("DBSSSGSG")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofSparkWalletExternalAccountInfo() {
        val sparkWalletExternalAccountInfo =
            ExternalAccountInfoOneOf.SparkWalletExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.SPARK_WALLET)
                .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSparkWalletExternalAccountInfo(
                sparkWalletExternalAccountInfo
            )

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo())
            .isEqualTo(sparkWalletExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofSparkWalletExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSparkWalletExternalAccountInfo(
                ExternalAccountInfoOneOf.SparkWalletExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.SPARK_WALLET)
                    .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofLightningExternalAccountInfo() {
        val lightningExternalAccountInfo =
            LightningExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.LIGHTNING)
                .bolt12(
                    "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                )
                .invoice(
                    "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                )
                .lightningAddress("john.doe@lightningwallet.com")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofLightningExternalAccountInfo(lightningExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo())
            .isEqualTo(lightningExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofLightningExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofLightningExternalAccountInfo(
                LightningExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.LIGHTNING)
                    .bolt12(
                        "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                    )
                    .invoice(
                        "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                    )
                    .lightningAddress("john.doe@lightningwallet.com")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofSolanaWalletExternalAccountInfo() {
        val solanaWalletExternalAccountInfo =
            ExternalAccountInfoOneOf.SolanaWalletExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.SOLANA_WALLET)
                .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSolanaWalletExternalAccountInfo(
                solanaWalletExternalAccountInfo
            )

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo())
            .isEqualTo(solanaWalletExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofSolanaWalletExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSolanaWalletExternalAccountInfo(
                ExternalAccountInfoOneOf.SolanaWalletExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.SOLANA_WALLET)
                    .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofTronWalletExternalAccountInfo() {
        val tronWalletExternalAccountInfo =
            ExternalAccountInfoOneOf.TronWalletExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.TRON_WALLET)
                .address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofTronWalletExternalAccountInfo(tronWalletExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo())
            .isEqualTo(tronWalletExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofTronWalletExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofTronWalletExternalAccountInfo(
                ExternalAccountInfoOneOf.TronWalletExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.TRON_WALLET)
                    .address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofPolygonWalletExternalAccountInfo() {
        val polygonWalletExternalAccountInfo =
            ExternalAccountInfoOneOf.PolygonWalletExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.POLYGON_WALLET)
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPolygonWalletExternalAccountInfo(
                polygonWalletExternalAccountInfo
            )

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo())
            .isEqualTo(polygonWalletExternalAccountInfo)
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo()).isNull()
    }

    @Test
    fun ofPolygonWalletExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPolygonWalletExternalAccountInfo(
                ExternalAccountInfoOneOf.PolygonWalletExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.POLYGON_WALLET)
                    .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
    }

    @Test
    fun ofBaseWalletExternalAccountInfo() {
        val baseWalletExternalAccountInfo =
            ExternalAccountInfoOneOf.BaseWalletExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.BASE_WALLET)
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofBaseWalletExternalAccountInfo(baseWalletExternalAccountInfo)

        assertThat(externalAccountInfoOneOf.usAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.clabeAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.pixAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ibanAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.upiAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccountExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.lightningExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.tronWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWalletExternalAccountInfo()).isNull()
        assertThat(externalAccountInfoOneOf.baseWalletExternalAccountInfo())
            .isEqualTo(baseWalletExternalAccountInfo)
    }

    @Test
    fun ofBaseWalletExternalAccountInfoRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofBaseWalletExternalAccountInfo(
                ExternalAccountInfoOneOf.BaseWalletExternalAccountInfo.builder()
                    .accountType(BaseExternalAccountInfo.AccountType.BASE_WALLET)
                    .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                    .build()
            )

        val roundtrippedExternalAccountInfoOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfoOneOf),
                jacksonTypeRef<ExternalAccountInfoOneOf>(),
            )

        assertThat(roundtrippedExternalAccountInfoOneOf).isEqualTo(externalAccountInfoOneOf)
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
        val externalAccountInfoOneOf =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<ExternalAccountInfoOneOf>())

        val e = assertThrows<GridInvalidDataException> { externalAccountInfoOneOf.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
