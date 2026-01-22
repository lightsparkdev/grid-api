// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.tokens.Permission
import com.grid.api.models.tokens.TokenCreateParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class TokenServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val tokenService = client.tokens()

        val apiToken =
            tokenService.create(
                TokenCreateParams.builder()
                    .name("Sandbox read-only")
                    .addPermission(Permission.VIEW)
                    .build()
            )

        apiToken.validate()
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
        val tokenService = client.tokens()

        val apiToken = tokenService.retrieve("tokenId")

        apiToken.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun list() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val tokenService = client.tokens()

        val page = tokenService.list()

        page.response().validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun delete() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val tokenService = client.tokens()

        tokenService.delete("tokenId")
    }
}
