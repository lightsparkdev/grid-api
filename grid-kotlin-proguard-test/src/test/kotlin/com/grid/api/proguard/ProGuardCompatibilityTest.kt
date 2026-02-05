// File generated from our OpenAPI spec by Stainless.

package com.grid.api.proguard

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.jsonMapper
import com.grid.api.models.config.CustomerInfoFieldName
import com.grid.api.models.config.PlatformConfig
import com.grid.api.models.config.PlatformCurrencyConfig
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.Customer
import com.grid.api.models.customers.CustomerOneOf
import com.grid.api.models.customers.CustomerType
import com.grid.api.models.customers.IndividualCustomer
import com.grid.api.models.receiver.CounterpartyFieldDefinition
import com.grid.api.models.transactions.TransactionType
import java.time.LocalDate
import java.time.OffsetDateTime
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.jvm.javaMethod
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ProGuardCompatibilityTest {

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            // To debug that we're using the right JAR.
            val jarPath = this::class.java.getProtectionDomain().codeSource.location
            println("JAR being used: $jarPath")

            // We have to manually run the test methods instead of using the JUnit runner because it
            // seems impossible to get working with R8.
            val test = ProGuardCompatibilityTest()
            test::class
                .memberFunctions
                .asSequence()
                .filter { function ->
                    function.javaMethod?.isAnnotationPresent(Test::class.java) == true
                }
                .forEach { it.call(test) }
        }
    }

    @Test
    fun proguardRules() {
        val rulesFile =
            javaClass.classLoader.getResourceAsStream("META-INF/proguard/grid-kotlin-core.pro")

        assertThat(rulesFile).isNotNull()
    }

    @Test
    fun client() {
        val client =
            GridOkHttpClient.builder().username("My Username").password("My Password").build()

        assertThat(client).isNotNull()
        assertThat(client.config()).isNotNull()
        assertThat(client.customers()).isNotNull()
        assertThat(client.platform()).isNotNull()
        assertThat(client.plaid()).isNotNull()
        assertThat(client.transferIn()).isNotNull()
        assertThat(client.transferOut()).isNotNull()
        assertThat(client.receiver()).isNotNull()
        assertThat(client.quotes()).isNotNull()
        assertThat(client.transactions()).isNotNull()
        assertThat(client.webhooks()).isNotNull()
        assertThat(client.invitations()).isNotNull()
        assertThat(client.sandbox()).isNotNull()
        assertThat(client.umaProviders()).isNotNull()
        assertThat(client.tokens()).isNotNull()
    }

    @Test
    fun platformConfigRoundtrip() {
        val jsonMapper = jsonMapper()
        val platformConfig =
            PlatformConfig.builder()
                .id("PlatformConfig:019542f5-b3e7-1d02-0000-000000000003")
                .createdAt(OffsetDateTime.parse("2025-06-15T12:30:45Z"))
                .isRegulatedFinancialInstitution(false)
                .proxyUmaSubdomain("platform")
                .addSupportedCurrency(
                    PlatformCurrencyConfig.builder()
                        .currencyCode("USD")
                        .addEnabledTransactionType(TransactionType.OUTGOING)
                        .addEnabledTransactionType(TransactionType.INCOMING)
                        .maxAmount(1000000L)
                        .minAmount(100L)
                        .requiredCounterpartyFields(
                            listOf(
                                CounterpartyFieldDefinition.builder()
                                    .mandatory(true)
                                    .name(CustomerInfoFieldName.FULL_NAME)
                                    .build(),
                                CounterpartyFieldDefinition.builder()
                                    .mandatory(true)
                                    .name(CustomerInfoFieldName.BIRTH_DATE)
                                    .build(),
                                CounterpartyFieldDefinition.builder()
                                    .mandatory(true)
                                    .name(CustomerInfoFieldName.NATIONALITY)
                                    .build(),
                            )
                        )
                        .addProviderRequiredCounterpartyCustomerField(
                            CustomerInfoFieldName.FULL_NAME
                        )
                        .addProviderRequiredCounterpartyCustomerField(
                            CustomerInfoFieldName.COUNTRY_OF_RESIDENCE
                        )
                        .addProviderRequiredCustomerField(CustomerInfoFieldName.NATIONALITY)
                        .addProviderRequiredCustomerField(CustomerInfoFieldName.BIRTH_DATE)
                        .build()
                )
                .umaDomain("platform.uma.domain")
                .updatedAt(OffsetDateTime.parse("2025-06-15T12:30:45Z"))
                .webhookEndpoint("https://api.mycompany.com/webhooks/uma")
                .build()

        val roundtrippedPlatformConfig =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(platformConfig),
                jacksonTypeRef<PlatformConfig>(),
            )

        assertThat(roundtrippedPlatformConfig).isEqualTo(platformConfig)
    }

    @Test
    fun customerOneOfRoundtrip() {
        val jsonMapper = jsonMapper()
        val customerOneOf =
            CustomerOneOf.ofIndividualCustomer(
                IndividualCustomer.builder()
                    .customerType(CustomerType.INDIVIDUAL)
                    .platformCustomerId("9f84e0c2a72c4fa")
                    .umaAddress("\$john.doe@uma.domain.com")
                    .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .isDeleted(false)
                    .kycStatus(Customer.KycStatus.APPROVED)
                    .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
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

        val roundtrippedCustomerOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerOneOf),
                jacksonTypeRef<CustomerOneOf>(),
            )

        assertThat(roundtrippedCustomerOneOf).isEqualTo(customerOneOf)
    }

    @Test
    fun customerInfoFieldNameRoundtrip() {
        val jsonMapper = jsonMapper()
        val customerInfoFieldName = CustomerInfoFieldName.FULL_NAME

        val roundtrippedCustomerInfoFieldName =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerInfoFieldName),
                jacksonTypeRef<CustomerInfoFieldName>(),
            )

        assertThat(roundtrippedCustomerInfoFieldName).isEqualTo(customerInfoFieldName)
    }
}
