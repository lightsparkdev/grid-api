// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.config.CustomerInfoFieldName
import com.grid.api.models.quotes.Currency
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ReceiverLookupExternalAccountResponseTest {

    @Test
    fun create() {
        val receiverLookupExternalAccountResponse =
            ReceiverLookupExternalAccountResponse.builder()
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
                .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        assertThat(receiverLookupExternalAccountResponse.lookupId())
            .isEqualTo("Lookup:019542f5-b3e7-1d02-0000-000000000009")
        assertThat(receiverLookupExternalAccountResponse.supportedCurrencies())
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
        assertThat(receiverLookupExternalAccountResponse.requiredPayerDataFields())
            .containsExactly(
                CounterpartyFieldDefinition.builder()
                    .mandatory(true)
                    .name(CustomerInfoFieldName.FULL_NAME)
                    .build()
            )
        assertThat(receiverLookupExternalAccountResponse.accountId())
            .isEqualTo("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val receiverLookupExternalAccountResponse =
            ReceiverLookupExternalAccountResponse.builder()
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
                .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        val roundtrippedReceiverLookupExternalAccountResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(receiverLookupExternalAccountResponse),
                jacksonTypeRef<ReceiverLookupExternalAccountResponse>(),
            )

        assertThat(roundtrippedReceiverLookupExternalAccountResponse)
            .isEqualTo(receiverLookupExternalAccountResponse)
    }
}
