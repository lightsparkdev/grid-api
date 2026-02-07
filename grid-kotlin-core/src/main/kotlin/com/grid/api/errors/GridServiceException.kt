// File generated from our OpenAPI spec by Stainless.

package com.grid.api.errors

import com.grid.api.core.JsonValue
import com.grid.api.core.http.Headers

abstract class GridServiceException
protected constructor(message: String, cause: Throwable? = null) : GridException(message, cause) {

    abstract fun statusCode(): Int

    abstract fun headers(): Headers

    abstract fun body(): JsonValue
}
