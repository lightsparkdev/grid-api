// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.config

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.receiver.CounterpartyFieldDefinition
import com.grid.api.models.transactions.TransactionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PlatformCurrencyConfigTest {

    @Test
    fun create() {
        val platformCurrencyConfig =
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
                .addProviderRequiredCounterpartyCustomerField(CustomerInfoFieldName.FULL_NAME)
                .addProviderRequiredCounterpartyCustomerField(
                    CustomerInfoFieldName.COUNTRY_OF_RESIDENCE
                )
                .addProviderRequiredCustomerField(CustomerInfoFieldName.NATIONALITY)
                .addProviderRequiredCustomerField(CustomerInfoFieldName.BIRTH_DATE)
                .build()

        assertThat(platformCurrencyConfig.currencyCode()).isEqualTo("USD")
        assertThat(platformCurrencyConfig.enabledTransactionTypes())
            .containsExactly(TransactionType.OUTGOING, TransactionType.INCOMING)
        assertThat(platformCurrencyConfig.maxAmount()).isEqualTo(1000000L)
        assertThat(platformCurrencyConfig.minAmount()).isEqualTo(100L)
        assertThat(platformCurrencyConfig.requiredCounterpartyFields())
            .containsExactly(
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
        assertThat(platformCurrencyConfig.providerRequiredCounterpartyCustomerFields())
            .containsExactly(
                CustomerInfoFieldName.FULL_NAME,
                CustomerInfoFieldName.COUNTRY_OF_RESIDENCE,
            )
        assertThat(platformCurrencyConfig.providerRequiredCustomerFields())
            .containsExactly(CustomerInfoFieldName.NATIONALITY, CustomerInfoFieldName.BIRTH_DATE)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val platformCurrencyConfig =
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
                .addProviderRequiredCounterpartyCustomerField(CustomerInfoFieldName.FULL_NAME)
                .addProviderRequiredCounterpartyCustomerField(
                    CustomerInfoFieldName.COUNTRY_OF_RESIDENCE
                )
                .addProviderRequiredCustomerField(CustomerInfoFieldName.NATIONALITY)
                .addProviderRequiredCustomerField(CustomerInfoFieldName.BIRTH_DATE)
                .build()

        val roundtrippedPlatformCurrencyConfig =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(platformCurrencyConfig),
                jacksonTypeRef<PlatformCurrencyConfig>(),
            )

        assertThat(roundtrippedPlatformCurrencyConfig).isEqualTo(platformCurrencyConfig)
    }
}
