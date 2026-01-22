// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.invitations.InvitationClaimParams
import com.grid.api.models.invitations.InvitationCreateParams
import java.time.OffsetDateTime
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class InvitationServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val invitationService = client.invitations()

        val umaInvitation =
            invitationService.create(
                InvitationCreateParams.builder()
                    .inviterUma("\$inviter@uma.domain")
                    .amountToSend(12550L)
                    .expiresAt(OffsetDateTime.parse("2025-09-01T14:30:00Z"))
                    .firstName("Alice")
                    .build()
            )

        umaInvitation.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun retrieve() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val invitationService = client.invitations()

        val umaInvitation = invitationService.retrieve("invitationCode")

        umaInvitation.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun cancel() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val invitationService = client.invitations()

        val umaInvitation = invitationService.cancel("invitationCode")

        umaInvitation.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun claim() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val invitationService = client.invitations()

        val umaInvitation =
            invitationService.claim(
                InvitationClaimParams.builder()
                    .invitationCode("invitationCode")
                    .inviteeUma("\$invitee@uma.domain")
                    .build()
            )

        umaInvitation.validate()
    }
}
