package com.grid.api.errors

class GridIoException(message: String? = null, cause: Throwable? = null) :
    GridException(message, cause)
