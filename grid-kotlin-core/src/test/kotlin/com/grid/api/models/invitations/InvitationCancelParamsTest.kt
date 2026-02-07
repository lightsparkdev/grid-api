// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.invitations

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class InvitationCancelParamsTest {

    @Test
    fun create() {
        InvitationCancelParams.builder().invitationCode("invitationCode").build()
    }

    @Test
    fun pathParams() {
        val params = InvitationCancelParams.builder().invitationCode("invitationCode").build()

        assertThat(params._pathParam(0)).isEqualTo("invitationCode")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }
}
