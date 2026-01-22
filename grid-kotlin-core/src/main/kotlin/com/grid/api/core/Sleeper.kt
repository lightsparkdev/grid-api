package com.grid.api.core

import java.time.Duration

/**
 * An interface for delaying execution for a specified amount of time.
 *
 * Useful for testing and cleaning up resources.
 */
interface Sleeper : AutoCloseable {

    /** Synchronously pauses execution for the given [duration]. */
    fun sleep(duration: Duration)

    /** Asynchronously pauses execution for the given [duration]. */
    suspend fun sleepAsync(duration: Duration)
}
