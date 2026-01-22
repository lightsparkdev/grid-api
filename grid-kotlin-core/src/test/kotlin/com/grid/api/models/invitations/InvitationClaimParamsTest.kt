// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.invitations

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class InvitationClaimParamsTest {

    @Test
    fun create() {
        InvitationClaimParams.builder()
            .invitationCode("invitationCode")
            .inviteeUma("\$invitee@uma.domain")
            .build()
    }

    @Test
    fun pathParams() {
        val params =
            InvitationClaimParams.builder()
                .invitationCode("invitationCode")
                .inviteeUma("\$invitee@uma.domain")
                .build()

        assertThat(params._pathParam(0)).isEqualTo("invitationCode")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
            InvitationClaimParams.builder()
                .invitationCode("invitationCode")
                .inviteeUma("\$invitee@uma.domain")
                .build()

        val body = params._body()

        assertThat(body.inviteeUma()).isEqualTo("\$invitee@uma.domain")
    }
}
