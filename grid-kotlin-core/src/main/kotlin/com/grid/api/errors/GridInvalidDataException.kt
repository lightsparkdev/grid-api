package com.grid.api.errors

class GridInvalidDataException(message: String? = null, cause: Throwable? = null) :
    GridException(message, cause)
