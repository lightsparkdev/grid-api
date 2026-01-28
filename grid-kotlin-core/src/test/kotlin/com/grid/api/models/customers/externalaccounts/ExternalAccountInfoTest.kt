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

internal class ExternalAccountInfoTest {

    @Test
    fun ofUsAccount() {
        val usAccount =
            ExternalAccountInfo.UsAccount.builder()
                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                .accountNumber("123456789")
                .routingNumber("987654321")
                .bankName("Chase Bank")
                .beneficiary(
                    IndividualBeneficiary.builder()
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

        val externalAccountInfo = ExternalAccountInfo.ofUsAccount(usAccount)

        assertThat(externalAccountInfo.usAccount()).isEqualTo(usAccount)
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofUsAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofUsAccount(
                ExternalAccountInfo.UsAccount.builder()
                    .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                    .accountNumber("123456789")
                    .routingNumber("987654321")
                    .bankName("Chase Bank")
                    .beneficiary(
                        IndividualBeneficiary.builder()
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

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofClabeAccount() {
        val clabeAccount =
            ExternalAccountInfo.ClabeAccount.builder()
                .clabeNumber("123456789012345678")
                .beneficiary(
                    IndividualBeneficiary.builder()
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

        val externalAccountInfo = ExternalAccountInfo.ofClabeAccount(clabeAccount)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isEqualTo(clabeAccount)
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofClabeAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofClabeAccount(
                ExternalAccountInfo.ClabeAccount.builder()
                    .clabeNumber("123456789012345678")
                    .beneficiary(
                        IndividualBeneficiary.builder()
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

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofPixAccount() {
        val pixAccount =
            ExternalAccountInfo.PixAccount.builder()
                .pixKey("55119876543210")
                .pixKeyType(PixAccountInfo.PixKeyType.PHONE)
                .taxId("1234567890")
                .beneficiary(
                    IndividualBeneficiary.builder()
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

        val externalAccountInfo = ExternalAccountInfo.ofPixAccount(pixAccount)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isEqualTo(pixAccount)
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofPixAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofPixAccount(
                ExternalAccountInfo.PixAccount.builder()
                    .pixKey("55119876543210")
                    .pixKeyType(PixAccountInfo.PixKeyType.PHONE)
                    .taxId("1234567890")
                    .beneficiary(
                        IndividualBeneficiary.builder()
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

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofIbanAccount() {
        val ibanAccount =
            ExternalAccountInfo.IbanAccount.builder()
                .iban("DE89370400440532013000")
                .swiftBic("DEUTDEFF")
                .beneficiary(
                    IndividualBeneficiary.builder()
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

        val externalAccountInfo = ExternalAccountInfo.ofIbanAccount(ibanAccount)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isEqualTo(ibanAccount)
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofIbanAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofIbanAccount(
                ExternalAccountInfo.IbanAccount.builder()
                    .iban("DE89370400440532013000")
                    .swiftBic("DEUTDEFF")
                    .beneficiary(
                        IndividualBeneficiary.builder()
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

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofUpiAccount() {
        val upiAccount =
            ExternalAccountInfo.UpiAccount.builder()
                .vpa("somecustomers@okbank")
                .beneficiary(
                    IndividualBeneficiary.builder()
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

        val externalAccountInfo = ExternalAccountInfo.ofUpiAccount(upiAccount)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isEqualTo(upiAccount)
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofUpiAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofUpiAccount(
                ExternalAccountInfo.UpiAccount.builder()
                    .vpa("somecustomers@okbank")
                    .beneficiary(
                        IndividualBeneficiary.builder()
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

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofNgnAccount() {
        val ngnAccount =
            ExternalAccountInfo.NgnAccount.builder()
                .accountNumber("0123456789")
                .accountType(JsonValue.from("CLABE"))
                .bankName("First Bank of Nigeria")
                .beneficiary(
                    IndividualBeneficiary.builder()
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
                .purposeOfPayment(NgnAccountExternalAccountInfo.PurposeOfPayment.GOODS_OR_SERVICES)
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofNgnAccount(ngnAccount)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isEqualTo(ngnAccount)
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofNgnAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofNgnAccount(
                ExternalAccountInfo.NgnAccount.builder()
                    .accountNumber("0123456789")
                    .accountType(JsonValue.from("CLABE"))
                    .bankName("First Bank of Nigeria")
                    .beneficiary(
                        IndividualBeneficiary.builder()
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
                        NgnAccountExternalAccountInfo.PurposeOfPayment.GOODS_OR_SERVICES
                    )
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofSparkWallet() {
        val sparkWallet =
            ExternalAccountInfo.SparkWallet.builder()
                .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofSparkWallet(sparkWallet)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isEqualTo(sparkWallet)
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofSparkWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofSparkWallet(
                ExternalAccountInfo.SparkWallet.builder()
                    .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofLightning() {
        val lightning =
            ExternalAccountInfo.Lightning.builder()
                .accountType(JsonValue.from("CLABE"))
                .bolt12(
                    "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                )
                .invoice(
                    "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                )
                .lightningAddress("john.doe@lightningwallet.com")
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofLightning(lightning)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isEqualTo(lightning)
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofLightningRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofLightning(
                ExternalAccountInfo.Lightning.builder()
                    .accountType(JsonValue.from("CLABE"))
                    .bolt12(
                        "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                    )
                    .invoice(
                        "lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs"
                    )
                    .lightningAddress("john.doe@lightningwallet.com")
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofSolanaWallet() {
        val solanaWallet =
            ExternalAccountInfo.SolanaWallet.builder()
                .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofSolanaWallet(solanaWallet)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isEqualTo(solanaWallet)
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofSolanaWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofSolanaWallet(
                ExternalAccountInfo.SolanaWallet.builder()
                    .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofTronWallet() {
        val tronWallet =
            ExternalAccountInfo.TronWallet.builder()
                .address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL")
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofTronWallet(tronWallet)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isEqualTo(tronWallet)
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofTronWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofTronWallet(
                ExternalAccountInfo.TronWallet.builder()
                    .address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL")
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofPolygonWallet() {
        val polygonWallet =
            ExternalAccountInfo.PolygonWallet.builder()
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofPolygonWallet(polygonWallet)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isEqualTo(polygonWallet)
        assertThat(externalAccountInfo.baseWallet()).isNull()
    }

    @Test
    fun ofPolygonWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofPolygonWallet(
                ExternalAccountInfo.PolygonWallet.builder()
                    .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
    }

    @Test
    fun ofBaseWallet() {
        val baseWallet =
            ExternalAccountInfo.BaseWallet.builder()
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val externalAccountInfo = ExternalAccountInfo.ofBaseWallet(baseWallet)

        assertThat(externalAccountInfo.usAccount()).isNull()
        assertThat(externalAccountInfo.clabeAccount()).isNull()
        assertThat(externalAccountInfo.pixAccount()).isNull()
        assertThat(externalAccountInfo.ibanAccount()).isNull()
        assertThat(externalAccountInfo.upiAccount()).isNull()
        assertThat(externalAccountInfo.ngnAccount()).isNull()
        assertThat(externalAccountInfo.sparkWallet()).isNull()
        assertThat(externalAccountInfo.lightning()).isNull()
        assertThat(externalAccountInfo.solanaWallet()).isNull()
        assertThat(externalAccountInfo.tronWallet()).isNull()
        assertThat(externalAccountInfo.polygonWallet()).isNull()
        assertThat(externalAccountInfo.baseWallet()).isEqualTo(baseWallet)
    }

    @Test
    fun ofBaseWalletRoundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountInfo =
            ExternalAccountInfo.ofBaseWallet(
                ExternalAccountInfo.BaseWallet.builder()
                    .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                    .build()
            )

        val roundtrippedExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountInfo),
                jacksonTypeRef<ExternalAccountInfo>(),
            )

        assertThat(roundtrippedExternalAccountInfo).isEqualTo(externalAccountInfo)
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
        val externalAccountInfo =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<ExternalAccountInfo>())

        val e = assertThrows<GridInvalidDataException> { externalAccountInfo.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
