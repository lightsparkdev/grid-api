// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class ExternalAccountInfoOneOfTest {

    @Test
    fun ofUsAccount() {
        val usAccount =
            ExternalAccountInfoOneOf.UsAccount.builder()
                .accountCategory(ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING)
                .accountNumber("123456789")
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofUsAccount(usAccount)

        assertThat(externalAccountInfoOneOf.usAccount()).isEqualTo(usAccount)
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofUsAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofUsAccount(
                ExternalAccountInfoOneOf.UsAccount.builder()
                    .accountCategory(ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING)
                    .accountNumber("123456789")
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofClabe() {
        val clabe =
            ExternalAccountInfoOneOf.Clabe.builder()
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofClabe(clabe)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isEqualTo(clabe)
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofClabeRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofClabe(
                ExternalAccountInfoOneOf.Clabe.builder()
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofPix() {
        val pix =
            ExternalAccountInfoOneOf.Pix.builder()
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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
                .pixKeyType(ExternalAccountInfoOneOf.Pix.PixKeyType.PHONE)
                .taxId("1234567890")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofPix(pix)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isEqualTo(pix)
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofPixRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPix(
                ExternalAccountInfoOneOf.Pix.builder()
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
                    .pixKeyType(ExternalAccountInfoOneOf.Pix.PixKeyType.PHONE)
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
    fun ofIban() {
        val iban =
            ExternalAccountInfoOneOf.Iban.builder()
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofIban(iban)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isEqualTo(iban)
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofIbanRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofIban(
                ExternalAccountInfoOneOf.Iban.builder()
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofUpi() {
        val upi =
            ExternalAccountInfoOneOf.Upi.builder()
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofUpi(upi)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isEqualTo(upi)
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofUpiRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofUpi(
                ExternalAccountInfoOneOf.Upi.builder()
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofNgnAccount() {
        val ngnAccount =
            ExternalAccountInfoOneOf.NgnAccount.builder()
                .accountNumber("0123456789")
                .bankName("First Bank of Nigeria")
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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
                    ExternalAccountInfoOneOf.NgnAccount.PurposeOfPayment.GOODS_OR_SERVICES
                )
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofNgnAccount(ngnAccount)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isEqualTo(ngnAccount)
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofNgnAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofNgnAccount(
                ExternalAccountInfoOneOf.NgnAccount.builder()
                    .accountNumber("0123456789")
                    .bankName("First Bank of Nigeria")
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
                        ExternalAccountInfoOneOf.NgnAccount.PurposeOfPayment.GOODS_OR_SERVICES
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
    fun ofCadAccount() {
        val cadAccount =
            ExternalAccountInfoOneOf.CadAccount.builder()
                .accountNumber("1234567")
                .bankCode("001")
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofCadAccount(cadAccount)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isEqualTo(cadAccount)
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofCadAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofCadAccount(
                ExternalAccountInfoOneOf.CadAccount.builder()
                    .accountNumber("1234567")
                    .bankCode("001")
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofGbpAccount() {
        val gbpAccount =
            ExternalAccountInfoOneOf.GbpAccount.builder()
                .accountNumber("12345678")
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofGbpAccount(gbpAccount)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isEqualTo(gbpAccount)
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofGbpAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofGbpAccount(
                ExternalAccountInfoOneOf.GbpAccount.builder()
                    .accountNumber("12345678")
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofPhpAccount() {
        val phpAccount =
            ExternalAccountInfoOneOf.PhpAccount.builder()
                .accountNumber("001234567890")
                .bankName("BDO Unibank")
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofPhpAccount(phpAccount)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isEqualTo(phpAccount)
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofPhpAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPhpAccount(
                ExternalAccountInfoOneOf.PhpAccount.builder()
                    .accountNumber("001234567890")
                    .bankName("BDO Unibank")
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofSgdAccount() {
        val sgdAccount =
            ExternalAccountInfoOneOf.SgdAccount.builder()
                .accountNumber("0123456789")
                .bankName("DBS Bank Ltd")
                .beneficiary(
                    BeneficiaryOneOf.Individual.builder()
                        .birthDate(LocalDate.parse("1990-01-15"))
                        .fullName("John Michael Doe")
                        .nationality("US")
                        .address(
                            BeneficiaryOneOf.Individual.Address.builder()
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

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofSgdAccount(sgdAccount)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isEqualTo(sgdAccount)
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofSgdAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSgdAccount(
                ExternalAccountInfoOneOf.SgdAccount.builder()
                    .accountNumber("0123456789")
                    .bankName("DBS Bank Ltd")
                    .beneficiary(
                        BeneficiaryOneOf.Individual.builder()
                            .birthDate(LocalDate.parse("1990-01-15"))
                            .fullName("John Michael Doe")
                            .nationality("US")
                            .address(
                                BeneficiaryOneOf.Individual.Address.builder()
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
    fun ofSparkWallet() {
        val sparkWallet =
            ExternalAccountInfoOneOf.SparkWallet.builder()
                .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofSparkWallet(sparkWallet)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isEqualTo(sparkWallet)
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofSparkWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSparkWallet(
                ExternalAccountInfoOneOf.SparkWallet.builder()
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
    fun ofLightning() {
        val lightning =
            ExternalAccountInfoOneOf.Lightning.builder()
                .bolt12(
                    "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                )
                .invoice(
                    "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                )
                .lightningAddress("john.doe@lightningwallet.com")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofLightning(lightning)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isEqualTo(lightning)
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofLightningRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofLightning(
                ExternalAccountInfoOneOf.Lightning.builder()
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
    fun ofSolanaWallet() {
        val solanaWallet =
            ExternalAccountInfoOneOf.SolanaWallet.builder()
                .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofSolanaWallet(solanaWallet)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isEqualTo(solanaWallet)
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofSolanaWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofSolanaWallet(
                ExternalAccountInfoOneOf.SolanaWallet.builder()
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
    fun ofTronWallet() {
        val tronWallet =
            ExternalAccountInfoOneOf.TronWallet.builder()
                .address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofTronWallet(tronWallet)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isEqualTo(tronWallet)
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofTronWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofTronWallet(
                ExternalAccountInfoOneOf.TronWallet.builder()
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
    fun ofPolygonWallet() {
        val polygonWallet =
            ExternalAccountInfoOneOf.PolygonWallet.builder()
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofPolygonWallet(polygonWallet)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isEqualTo(polygonWallet)
        assertThat(externalAccountInfoOneOf.baseWallet()).isNull()
    }

    @Test
    fun ofPolygonWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofPolygonWallet(
                ExternalAccountInfoOneOf.PolygonWallet.builder()
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
    fun ofBaseWallet() {
        val baseWallet =
            ExternalAccountInfoOneOf.BaseWallet.builder()
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val externalAccountInfoOneOf = ExternalAccountInfoOneOf.ofBaseWallet(baseWallet)

        assertThat(externalAccountInfoOneOf.usAccount()).isNull()
        assertThat(externalAccountInfoOneOf.clabe()).isNull()
        assertThat(externalAccountInfoOneOf.pix()).isNull()
        assertThat(externalAccountInfoOneOf.iban()).isNull()
        assertThat(externalAccountInfoOneOf.upi()).isNull()
        assertThat(externalAccountInfoOneOf.ngnAccount()).isNull()
        assertThat(externalAccountInfoOneOf.cadAccount()).isNull()
        assertThat(externalAccountInfoOneOf.gbpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.phpAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sgdAccount()).isNull()
        assertThat(externalAccountInfoOneOf.sparkWallet()).isNull()
        assertThat(externalAccountInfoOneOf.lightning()).isNull()
        assertThat(externalAccountInfoOneOf.solanaWallet()).isNull()
        assertThat(externalAccountInfoOneOf.tronWallet()).isNull()
        assertThat(externalAccountInfoOneOf.polygonWallet()).isNull()
        assertThat(externalAccountInfoOneOf.baseWallet()).isEqualTo(baseWallet)
    }

    @Test
    fun ofBaseWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfoOneOf =
            ExternalAccountInfoOneOf.ofBaseWallet(
                ExternalAccountInfoOneOf.BaseWallet.builder()
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
