// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.tokens

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TokenCreateParamsTest {

    @Test
    fun create() {
        TokenCreateParams.builder().name("Sandbox read-only").addPermission(Permission.VIEW).build()
    }

    @Test
    fun body() {
        val params =
            TokenCreateParams.builder()
                .name("Sandbox read-only")
                .addPermission(Permission.VIEW)
                .build()

        val body = params._body()

        assertThat(body.name()).isEqualTo("Sandbox read-only")
        assertThat(body.permissions()).containsExactly(Permission.VIEW)
    }
}
