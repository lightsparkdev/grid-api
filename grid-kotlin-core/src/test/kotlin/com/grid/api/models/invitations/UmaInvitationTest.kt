// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.invitations

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.quotes.Currency
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UmaInvitationTest {

    @Test
    fun create() {
        val umaInvitation =
            UmaInvitation.builder()
                .code("019542f5")
                .createdAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .inviterUma("\$inviter@uma.domain")
                .status(UmaInvitation.Status.PENDING)
                .url("https://uma.me/i/019542f5")
                .amountToSend(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .claimedAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .expiresAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .firstName("Jane")
                .inviteeUma("\$invitee@uma.domain")
                .build()

        assertThat(umaInvitation.code()).isEqualTo("019542f5")
        assertThat(umaInvitation.createdAt())
            .isEqualTo(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
        assertThat(umaInvitation.inviterUma()).isEqualTo("\$inviter@uma.domain")
        assertThat(umaInvitation.status()).isEqualTo(UmaInvitation.Status.PENDING)
        assertThat(umaInvitation.url()).isEqualTo("https://uma.me/i/019542f5")
        assertThat(umaInvitation.amountToSend())
            .isEqualTo(
                CurrencyAmount.builder()
                    .amount(12550L)
                    .currency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .build()
            )
        assertThat(umaInvitation.claimedAt())
            .isEqualTo(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
        assertThat(umaInvitation.expiresAt())
            .isEqualTo(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
        assertThat(umaInvitation.firstName()).isEqualTo("Jane")
        assertThat(umaInvitation.inviteeUma()).isEqualTo("\$invitee@uma.domain")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val umaInvitation =
            UmaInvitation.builder()
                .code("019542f5")
                .createdAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .inviterUma("\$inviter@uma.domain")
                .status(UmaInvitation.Status.PENDING)
                .url("https://uma.me/i/019542f5")
                .amountToSend(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .claimedAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .expiresAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .firstName("Jane")
                .inviteeUma("\$invitee@uma.domain")
                .build()

        val roundtrippedUmaInvitation =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(umaInvitation),
                jacksonTypeRef<UmaInvitation>(),
            )

        assertThat(roundtrippedUmaInvitation).isEqualTo(umaInvitation)
    }
}
