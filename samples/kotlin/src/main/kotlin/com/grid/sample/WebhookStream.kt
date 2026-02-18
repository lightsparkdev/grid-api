package com.grid.sample

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

object WebhookStream {
    private val _eventFlow = MutableSharedFlow<String>(replay = 10)
    val eventFlow: SharedFlow<String> = _eventFlow.asSharedFlow()

    fun addEvent(event: String) {
        println("Broadcasting webhook: $event")
        _eventFlow.tryEmit(event)
    }
}
