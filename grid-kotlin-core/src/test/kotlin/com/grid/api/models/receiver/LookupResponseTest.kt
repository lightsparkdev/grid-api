// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.config.CustomerInfoFieldName
import com.grid.api.models.quotes.Currency
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class LookupResponseTest {

    @Test
    fun create() {
        val lookupResponse =
            LookupResponse.builder()
                .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                .addSupportedCurrency(
                    LookupResponse.SupportedCurrency.builder()
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .estimatedExchangeRate(1.08)
                        .max(1000000L)
                        .min(1L)
                        .build()
                )
                .addRequiredPayerDataField(
                    CounterpartyFieldDefinition.builder()
                        .mandatory(true)
                        .name(CustomerInfoFieldName.FULL_NAME)
                        .build()
                )
                .build()

        assertThat(lookupResponse.lookupId())
            .isEqualTo("Lookup:019542f5-b3e7-1d02-0000-000000000009")
        assertThat(lookupResponse.supportedCurrencies())
            .containsExactly(
                LookupResponse.SupportedCurrency.builder()
                    .currency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .estimatedExchangeRate(1.08)
                    .max(1000000L)
                    .min(1L)
                    .build()
            )
        assertThat(lookupResponse.requiredPayerDataFields())
            .containsExactly(
                CounterpartyFieldDefinition.builder()
                    .mandatory(true)
                    .name(CustomerInfoFieldName.FULL_NAME)
                    .build()
            )
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val lookupResponse =
            LookupResponse.builder()
                .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                .addSupportedCurrency(
                    LookupResponse.SupportedCurrency.builder()
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .estimatedExchangeRate(1.08)
                        .max(1000000L)
                        .min(1L)
                        .build()
                )
                .addRequiredPayerDataField(
                    CounterpartyFieldDefinition.builder()
                        .mandatory(true)
                        .name(CustomerInfoFieldName.FULL_NAME)
                        .build()
                )
                .build()

        val roundtrippedLookupResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(lookupResponse),
                jacksonTypeRef<LookupResponse>(),
            )

        assertThat(roundtrippedLookupResponse).isEqualTo(lookupResponse)
    }
}
