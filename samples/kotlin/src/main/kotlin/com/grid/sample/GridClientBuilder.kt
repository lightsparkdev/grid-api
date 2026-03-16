package com.grid.sample

import com.lightspark.grid.client.LightsparkGridClient
import com.lightspark.grid.client.okhttp.LightsparkGridOkHttpClient

object GridClientBuilder {
    val client: LightsparkGridClient by lazy {
        LightsparkGridOkHttpClient.builder()
            .username(Config.gridClientId)
            .password(Config.gridClientSecret)
            .build()
    }
}
