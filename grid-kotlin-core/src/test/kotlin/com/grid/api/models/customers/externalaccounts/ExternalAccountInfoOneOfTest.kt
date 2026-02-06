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
                .accountCategory(
                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountCategory.CHECKING
                )
                .accountNumber("123456789")
                .accountType(
                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .accountCategory(
                        ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountCategory
                            .CHECKING
                    )
                    .accountNumber("123456789")
                    .accountType(
                        ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountType.US_ACCOUNT
                    )
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .accountType(
                    ExternalAccountInfoOneOf.ClabeAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .clabeNumber("123456789012345678")
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
                    .accountType(
                        ExternalAccountInfoOneOf.ClabeAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .clabeNumber("123456789012345678")
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
                .accountType(
                    ExternalAccountInfoOneOf.PixAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .pixKey("55119876543210")
                .pixKeyType(ExternalAccountInfoOneOf.PixAccountExternalAccountInfo.PixKeyType.PHONE)
                .taxId("1234567890")
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
                    .accountType(
                        ExternalAccountInfoOneOf.PixAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .pixKey("55119876543210")
                    .pixKeyType(
                        ExternalAccountInfoOneOf.PixAccountExternalAccountInfo.PixKeyType.PHONE
                    )
                    .taxId("1234567890")
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
                .accountType(
                    ExternalAccountInfoOneOf.IbanAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .iban("DE89370400440532013000")
                .swiftBic("DEUTDEFF")
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
                    .accountType(
                        ExternalAccountInfoOneOf.IbanAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .iban("DE89370400440532013000")
                    .swiftBic("DEUTDEFF")
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
                .accountType(
                    ExternalAccountInfoOneOf.UpiAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .vpa("somecustomers@okbank")
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
                    .accountType(
                        ExternalAccountInfoOneOf.UpiAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .vpa("somecustomers@okbank")
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
            ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo.builder()
                .accountNumber("0123456789")
                .accountType(
                    ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .bankName("First Bank of Nigeria")
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .purposeOfPayment(
                    ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo.PurposeOfPayment
                        .GOODS_OR_SERVICES
                )
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
                ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo.builder()
                    .accountNumber("0123456789")
                    .accountType(
                        ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .bankName("First Bank of Nigeria")
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .purposeOfPayment(
                        ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo.PurposeOfPayment
                            .GOODS_OR_SERVICES
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
                .accountNumber("1234567")
                .accountType(
                    ExternalAccountInfoOneOf.CadAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .bankCode("001")
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .accountNumber("1234567")
                    .accountType(
                        ExternalAccountInfoOneOf.CadAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .bankCode("001")
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .accountNumber("12345678")
                .accountType(
                    ExternalAccountInfoOneOf.GbpAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .accountNumber("12345678")
                    .accountType(
                        ExternalAccountInfoOneOf.GbpAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .accountNumber("001234567890")
                .accountType(
                    ExternalAccountInfoOneOf.PhpAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .bankName("BDO Unibank")
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .accountNumber("001234567890")
                    .accountType(
                        ExternalAccountInfoOneOf.PhpAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .bankName("BDO Unibank")
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .accountNumber("0123456789")
                .accountType(
                    ExternalAccountInfoOneOf.SgdAccountExternalAccountInfo.AccountType.US_ACCOUNT
                )
                .bankName("DBS Bank Ltd")
                .beneficiary(
                    BeneficiaryOneOf.IndividualBeneficiary.builder()
                        .beneficiaryType(
                            BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                    .accountNumber("0123456789")
                    .accountType(
                        ExternalAccountInfoOneOf.SgdAccountExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
                    .bankName("DBS Bank Ltd")
                    .beneficiary(
                        BeneficiaryOneOf.IndividualBeneficiary.builder()
                            .beneficiaryType(
                                BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
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
                .accountType(
                    ExternalAccountInfoOneOf.SparkWalletExternalAccountInfo.AccountType.US_ACCOUNT
                )
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
                    .accountType(
                        ExternalAccountInfoOneOf.SparkWalletExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
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
            ExternalAccountInfoOneOf.LightningExternalAccountInfo.builder()
                .accountType(
                    ExternalAccountInfoOneOf.LightningExternalAccountInfo.AccountType.US_ACCOUNT
                )
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
                ExternalAccountInfoOneOf.LightningExternalAccountInfo.builder()
                    .accountType(
                        ExternalAccountInfoOneOf.LightningExternalAccountInfo.AccountType.US_ACCOUNT
                    )
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
                .accountType(
                    ExternalAccountInfoOneOf.SolanaWalletExternalAccountInfo.AccountType.US_ACCOUNT
                )
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
                    .accountType(
                        ExternalAccountInfoOneOf.SolanaWalletExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
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
                .accountType(
                    ExternalAccountInfoOneOf.TronWalletExternalAccountInfo.AccountType.US_ACCOUNT
                )
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
                    .accountType(
                        ExternalAccountInfoOneOf.TronWalletExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
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
                .accountType(
                    ExternalAccountInfoOneOf.PolygonWalletExternalAccountInfo.AccountType.US_ACCOUNT
                )
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
                    .accountType(
                        ExternalAccountInfoOneOf.PolygonWalletExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
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
                .accountType(
                    ExternalAccountInfoOneOf.BaseWalletExternalAccountInfo.AccountType.US_ACCOUNT
                )
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
                    .accountType(
                        ExternalAccountInfoOneOf.BaseWalletExternalAccountInfo.AccountType
                            .US_ACCOUNT
                    )
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
