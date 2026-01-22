// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.config.CustomerInfoFieldName
import com.grid.api.models.quotes.Currency
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ReceiverLookupUmaResponseTest {

    @Test
    fun create() {
        val receiverLookupUmaResponse =
            ReceiverLookupUmaResponse.builder()
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
                .receiverUmaAddress("\$receiver@uma.domain")
                .build()

        assertThat(receiverLookupUmaResponse.lookupId())
            .isEqualTo("Lookup:019542f5-b3e7-1d02-0000-000000000009")
        assertThat(receiverLookupUmaResponse.supportedCurrencies())
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
        assertThat(receiverLookupUmaResponse.requiredPayerDataFields())
            .containsExactly(
                CounterpartyFieldDefinition.builder()
                    .mandatory(true)
                    .name(CustomerInfoFieldName.FULL_NAME)
                    .build()
            )
        assertThat(receiverLookupUmaResponse.receiverUmaAddress())
            .isEqualTo("\$receiver@uma.domain")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val receiverLookupUmaResponse =
            ReceiverLookupUmaResponse.builder()
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
                .receiverUmaAddress("\$receiver@uma.domain")
                .build()

        val roundtrippedReceiverLookupUmaResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(receiverLookupUmaResponse),
                jacksonTypeRef<ReceiverLookupUmaResponse>(),
            )

        assertThat(roundtrippedReceiverLookupUmaResponse).isEqualTo(receiverLookupUmaResponse)
    }
}
