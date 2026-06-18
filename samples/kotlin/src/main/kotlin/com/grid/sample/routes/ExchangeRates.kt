package com.grid.sample.routes

import com.lightspark.grid.models.exchangerates.ExchangeRateListParams
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.exchangeRateRoutes() {
    route("/api/exchange-rates") {
        get {
            try {
                val sourceCurrency = call.request.queryParameters["sourceCurrency"]
                    ?: return@get call.respondText(
                        """{"error": "sourceCurrency is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                val destinationCurrency = call.request.queryParameters["destinationCurrency"]
                val amount = call.request.queryParameters["sendingAmount"]?.toLongOrNull()
                Log.incoming(
                    "GET",
                    "/api/exchange-rates?sourceCurrency=$sourceCurrency&destinationCurrency=$destinationCurrency&sendingAmount=$amount"
                )

                val params = ExchangeRateListParams.builder()
                    .sourceCurrency(sourceCurrency)
                    .apply {
                        destinationCurrency?.let { addDestinationCurrency(it) }
                        amount?.let { sendingAmount(it) }
                    }
                    .build()

                Log.gridRequest("exchangeRates.list", "source=$sourceCurrency dest=$destinationCurrency amount=$amount")
                val response = GridClientBuilder.client.exchangeRates().list(params)
                val responseJson = JsonUtils.prettyPrint(response)
                Log.gridResponse("exchangeRates.list", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("exchangeRates.list", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}
