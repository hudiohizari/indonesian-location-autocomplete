/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

package id.my.hizari.indonesianlocation.autocomplete.engine

import android.content.Context
import android.util.Log
import id.my.hizari.indonesianlocation.autocomplete.model.LocationRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import java.io.InputStream
import kotlin.coroutines.coroutineContext

class LocationSearchEngine(private val context: Context) {

    private var cachedRecords: List<LocationRecord>? = null
    private val initMutex = Mutex()

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    companion object {
        private val PUNCTUATION_REGEX = Regex("[,.\\-]")
        private val WHITESPACE_REGEX = Regex("\\s+")
    }

    /**
     * Loads the postcode database from assets using streaming. Runs on Dispatchers.IO.
     * Direct streaming avoids reading the entire 15MB file into an intermediate String buffer.
     * Uses a Mutex to prevent concurrent double-loading.
     */
    @OptIn(ExperimentalSerializationApi::class)
    suspend fun init() {
        if (cachedRecords != null) return
        initMutex.withLock {
            if (cachedRecords != null) return // Double-check after acquiring lock
            withContext(Dispatchers.IO) {
                try {
                    val inputStream: InputStream = context.assets.open("indonesia-postcodes.json")
                    cachedRecords = inputStream.use { stream ->
                        json.decodeFromStream<List<LocationRecord>>(stream)
                    }
                } catch (e: Exception) {
                    Log.e("LocationSearchEngine", "Failed to load/parse indonesia-postcodes.json from assets", e)
                    throw e
                }
            }
        }
    }

    /**
     * Searches location database with multi-term match rules.
     * Cooperative cancellation via ensureActive() allows collectLatest to
     * abort mid-scan when a newer keystroke arrives.
     */
    suspend fun searchLocations(
        query: String,
        maxResults: Int = 10,
        minQueryLength: Int = 3,
        filter: ((LocationRecord) -> Boolean)? = null
    ): List<LocationRecord> = withContext(Dispatchers.Default) {
        if (query.trim().length < minQueryLength) {
            return@withContext emptyList()
        }

        if (cachedRecords == null) {
            init()
        }

        val normalized = query.lowercase().replace(PUNCTUATION_REGEX, " ").trim()
        val searchTerms = normalized.split(WHITESPACE_REGEX).filter { it.isNotEmpty() }
        if (searchTerms.isEmpty()) {
            return@withContext emptyList()
        }

        val records = cachedRecords ?: return@withContext emptyList()
        val results = mutableListOf<LocationRecord>()

        for ((index, item) in records.withIndex()) {
            if (results.size >= maxResults) break

            // Check cancellation every 2000 records to allow collectLatest
            // to abort mid-scan when a newer keystroke arrives
            if (index % 2000 == 0 && index > 0) {
                coroutineContext.ensureActive()
            }

            // Lazily cache the search string directly inside the transient property of the LocationRecord
            var searchStr = item.searchStr
            if (searchStr == null) {
                searchStr = "${item.village}\n${item.district}\n${item.regency}\n${item.province}\n${item.code}".lowercase()
                item.searchStr = searchStr
            }

            val matches = searchTerms.all { term ->
                searchStr.contains(term)
            }

            if (matches) {
                if (filter == null || filter(item)) {
                    results.add(item)
                }
            }
        }

        return@withContext results
    }
}
