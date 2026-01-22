package com.grid.api.errors

open class GridException(message: String? = null, cause: Throwable? = null) :
    RuntimeException(message, cause)
