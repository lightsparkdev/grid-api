@file:JvmName("EmptyHandler")

package com.grid.api.core.handlers

import com.grid.api.core.http.HttpResponse
import com.grid.api.core.http.HttpResponse.Handler

internal fun emptyHandler(): Handler<Void?> = EmptyHandlerInternal

private object EmptyHandlerInternal : Handler<Void?> {
    override fun handle(response: HttpResponse): Void? = null
}
