package com.grid.api.core

import java.time.Duration
import kotlin.time.toKotlinDuration
import kotlinx.coroutines.delay

class DefaultSleeper : Sleeper {

    override fun sleep(duration: Duration) = Thread.sleep(duration.toMillis())

    override suspend fun sleepAsync(duration: Duration) = delay(duration.toKotlinDuration())

    override fun close() {}
}
