// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.config

import com.grid.api.models.receiver.CounterpartyFieldDefinition
import com.grid.api.models.transactions.TransactionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ConfigUpdateParamsTest {

    @Test
    fun create() {
        ConfigUpdateParams.builder()
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
                                .name(CustomerInfoFieldName.NATIONALITY)
                                .build(),
                            CounterpartyFieldDefinition.builder()
                                .mandatory(true)
                                .name(CustomerInfoFieldName.BIRTH_DATE)
                                .build(),
                        )
                    )
                    .addProviderRequiredCounterpartyCustomerField(CustomerInfoFieldName.FULL_NAME)
                    .addProviderRequiredCounterpartyCustomerField(
                        CustomerInfoFieldName.COUNTRY_OF_RESIDENCE
                    )
                    .addProviderRequiredCustomerField(CustomerInfoFieldName.NATIONALITY)
                    .addProviderRequiredCustomerField(CustomerInfoFieldName.BIRTH_DATE)
                    .build()
            )
            .umaDomain("mycompany.com")
            .webhookEndpoint("https://api.mycompany.com/webhooks/uma")
            .build()
    }

    @Test
    fun body() {
        val params =
            ConfigUpdateParams.builder()
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
                                    .name(CustomerInfoFieldName.NATIONALITY)
                                    .build(),
                                CounterpartyFieldDefinition.builder()
                                    .mandatory(true)
                                    .name(CustomerInfoFieldName.BIRTH_DATE)
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
                .umaDomain("mycompany.com")
                .webhookEndpoint("https://api.mycompany.com/webhooks/uma")
                .build()

        val body = params._body()

        assertThat(body.supportedCurrencies())
            .containsExactly(
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
                                .name(CustomerInfoFieldName.NATIONALITY)
                                .build(),
                            CounterpartyFieldDefinition.builder()
                                .mandatory(true)
                                .name(CustomerInfoFieldName.BIRTH_DATE)
                                .build(),
                        )
                    )
                    .addProviderRequiredCounterpartyCustomerField(CustomerInfoFieldName.FULL_NAME)
                    .addProviderRequiredCounterpartyCustomerField(
                        CustomerInfoFieldName.COUNTRY_OF_RESIDENCE
                    )
                    .addProviderRequiredCustomerField(CustomerInfoFieldName.NATIONALITY)
                    .addProviderRequiredCustomerField(CustomerInfoFieldName.BIRTH_DATE)
                    .build()
            )
        assertThat(body.umaDomain()).isEqualTo("mycompany.com")
        assertThat(body.webhookEndpoint()).isEqualTo("https://api.mycompany.com/webhooks/uma")
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params = ConfigUpdateParams.builder().build()

        val body = params._body()
    }
}
