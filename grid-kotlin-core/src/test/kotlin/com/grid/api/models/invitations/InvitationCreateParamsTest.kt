// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.invitations

import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class InvitationCreateParamsTest {

    @Test
    fun create() {
        InvitationCreateParams.builder()
            .inviterUma("\$inviter@uma.domain")
            .amountToSend(12550L)
            .expiresAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
            .firstName("Alice")
            .build()
    }

    @Test
    fun body() {
        val params =
            InvitationCreateParams.builder()
                .inviterUma("\$inviter@uma.domain")
                .amountToSend(12550L)
                .expiresAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                .firstName("Alice")
                .build()

        val body = params._body()

        assertThat(body.inviterUma()).isEqualTo("\$inviter@uma.domain")
        assertThat(body.amountToSend()).isEqualTo(12550L)
        assertThat(body.expiresAt()).isEqualTo(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
        assertThat(body.firstName()).isEqualTo("Alice")
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params = InvitationCreateParams.builder().inviterUma("\$inviter@uma.domain").build()

        val body = params._body()

        assertThat(body.inviterUma()).isEqualTo("\$inviter@uma.domain")
    }
}
