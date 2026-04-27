package com.grid.sample.routes

import com.lightspark.grid.models.customers.CustomerListInternalAccountsParams
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import com.grid.sample.Log
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

// Lists a customer's internal accounts. Used by the frontend to find the
// auto-provisioned Grid Global Account (filtered by type=EMBEDDED_WALLET).
fun Route.internalAccountRoutes() {
    route("/api/internal-accounts") {
        get {
            try {
                val customerId = call.request.queryParameters["customerId"]
                    ?: return@get call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )
                val typeParam = call.request.queryParameters["type"]
                Log.incoming("GET", "/api/internal-accounts?customerId=$customerId&type=$typeParam")

                val params = CustomerListInternalAccountsParams.builder()
                    .customerId(customerId)
                    .apply {
                        typeParam?.let { type(CustomerListInternalAccountsParams.Type.of(it)) }
                    }
                    .build()

                Log.gridRequest("customers.listInternalAccounts", "customerId=$customerId type=$typeParam")
                val page = GridClientBuilder.client.customers().listInternalAccounts(params)
                // Page wraps a service reference Jackson can't serialize; flatten to its response shape.
                val responsePayload = mapOf(
                    "data" to page.data(),
                    "hasMore" to page.hasMore(),
                    "nextCursor" to page.nextCursor(),
                    "totalCount" to page.totalCount(),
                )
                val responseJson = JsonUtils.prettyPrint(responsePayload)
                Log.gridResponse("customers.listInternalAccounts", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("customers.listInternalAccounts", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}
