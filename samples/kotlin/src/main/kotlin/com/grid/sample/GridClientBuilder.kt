package com.grid.sample

import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

object GridClientBuilder {
    val client: GridClient by lazy {
        GridOkHttpClient.builder()
            .username(Config.apiTokenId)
            .password(Config.apiClientSecret)
            .build()
    }
}
