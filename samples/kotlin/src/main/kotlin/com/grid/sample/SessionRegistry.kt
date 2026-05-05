package com.grid.sample

import com.fasterxml.jackson.databind.JsonNode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

/**
 * Per-session routing for webhook events so multiple users can share one
 * deployment of this sample without seeing each other's webhooks.
 *
 * Resources (customer / external account / quote IDs) are tagged with the
 * session that created them; webhook handlers look up the session by scanning
 * the event payload for any tagged ID. Both the resource map and per-session
 * flows expire after [maxAge] to bound memory.
 */
object SessionRegistry {
    private val maxAge: Duration = Duration.ofHours(1)
    private val sweepEvery: Duration = Duration.ofMinutes(5)

    private data class Tag(val sessionId: String, val createdAt: Instant)
    private data class SessionFlow(
        val flow: MutableSharedFlow<String>,
        val createdAt: Instant,
    )

    private val resources = ConcurrentHashMap<String, Tag>()
    private val sessions = ConcurrentHashMap<String, SessionFlow>()

    fun tag(resourceId: String?, sessionId: String?) {
        if (resourceId.isNullOrBlank() || sessionId.isNullOrBlank()) return
        resources[resourceId] = Tag(sessionId, Instant.now())
    }

    /** Walks the event tree looking for any tagged resource ID. First hit wins. */
    fun sessionFor(event: JsonNode): String? {
        val seen = mutableListOf<String>()
        collectStrings(event, seen)
        return seen.firstNotNullOfOrNull { resources[it]?.sessionId }
    }

    private fun collectStrings(node: JsonNode, out: MutableList<String>) {
        when {
            node.isTextual -> out.add(node.asText())
            node.isArray -> node.forEach { collectStrings(it, out) }
            node.isObject -> node.fields().forEach { collectStrings(it.value, out) }
        }
    }

    fun flowFor(sessionId: String): SharedFlow<String> =
        sessions.computeIfAbsent(sessionId) {
            SessionFlow(MutableSharedFlow(replay = 10), Instant.now())
        }.flow.asSharedFlow()

    fun emit(sessionId: String, event: String) {
        val sf = sessions.computeIfAbsent(sessionId) {
            SessionFlow(MutableSharedFlow(replay = 10), Instant.now())
        }
        sf.flow.tryEmit(event)
    }

    fun startSweeper(scope: CoroutineScope = CoroutineScope(Dispatchers.Default)): Job =
        scope.launch {
            while (isActive) {
                kotlinx.coroutines.delay(sweepEvery.toMillis())
                sweep()
            }
        }

    internal fun sweep(now: Instant = Instant.now()) {
        val cutoff = now.minus(maxAge)
        resources.entries.removeIf { it.value.createdAt.isBefore(cutoff) }
        sessions.entries.removeIf { it.value.createdAt.isBefore(cutoff) }
    }
}
