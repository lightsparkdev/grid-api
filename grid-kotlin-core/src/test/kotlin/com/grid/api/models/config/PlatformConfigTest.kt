// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.config

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.receiver.CounterpartyFieldDefinition
import com.grid.api.models.transactions.TransactionType
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PlatformConfigTest {

    @Test
    fun create() {
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

        assertThat(platformConfig.id())
            .isEqualTo("PlatformConfig:019542f5-b3e7-1d02-0000-000000000003")
        assertThat(platformConfig.createdAt())
            .isEqualTo(OffsetDateTime.parse("2025-06-15T12:30:45Z"))
        assertThat(platformConfig.isRegulatedFinancialInstitution()).isEqualTo(false)
        assertThat(platformConfig.proxyUmaSubdomain()).isEqualTo("platform")
        assertThat(platformConfig.supportedCurrencies())
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
            )
        assertThat(platformConfig.umaDomain()).isEqualTo("platform.uma.domain")
        assertThat(platformConfig.updatedAt())
            .isEqualTo(OffsetDateTime.parse("2025-06-15T12:30:45Z"))
        assertThat(platformConfig.webhookEndpoint())
            .isEqualTo("https://api.mycompany.com/webhooks/uma")
    }

    @Test
    fun roundtrip() {
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
}
