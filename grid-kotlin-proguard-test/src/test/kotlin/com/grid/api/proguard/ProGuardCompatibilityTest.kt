// File generated from our OpenAPI spec by Stainless.

package com.grid.api.proguard

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.jsonMapper
import com.grid.api.models.config.CustomerInfoFieldName
import com.grid.api.models.quotes.Currency
import com.grid.api.models.quotes.QuoteDestinationOneOf
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
        assertThat(client.exchangeRates()).isNotNull()
    }

    @Test
    fun currencyRoundtrip() {
        val jsonMapper = jsonMapper()
        val currency =
            Currency.builder()
                .code("USD")
                .decimals(2L)
                .name("United States Dollar")
                .symbol("\$")
                .build()

        val roundtrippedCurrency =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(currency),
                jacksonTypeRef<Currency>(),
            )

        assertThat(roundtrippedCurrency).isEqualTo(currency)
    }

    @Test
    fun quoteDestinationOneOfRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteDestinationOneOf =
            QuoteDestinationOneOf.ofAccount(
                QuoteDestinationOneOf.Account.builder()
                    .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .destinationType(QuoteDestinationOneOf.Account.DestinationType.ACCOUNT)
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
