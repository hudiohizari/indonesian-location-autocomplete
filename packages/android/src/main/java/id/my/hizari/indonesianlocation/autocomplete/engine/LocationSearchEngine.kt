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
import kotlinx.coroutines.withContext
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import java.io.InputStream

class LocationSearchEngine(private val context: Context) {

    private var cachedRecords: List<LocationRecord>? = null

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    /**
     * Loads the postcode database from assets using streaming. Runs on Dispatchers.IO.
     * Direct streaming avoids reading the entire 15MB file into an intermediate String buffer.
     */
    @OptIn(ExperimentalSerializationApi::class)
    suspend fun init() = withContext(Dispatchers.IO) {
        if (cachedRecords == null) {
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

    /**
     * Searches location database with debounced multi-term match rules.
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
            init() // Only context-switch to IO when data actually needs loading
        }

        val normalized = query.lowercase().replace(Regex("[,.\\-]"), " ").trim()
        val searchTerms = normalized.split(Regex("\\s+")).filter { it.isNotEmpty() }
        if (searchTerms.isEmpty()) {
            return@withContext emptyList()
        }

        val records = cachedRecords ?: return@withContext emptyList()
        val results = mutableListOf<LocationRecord>()

        for (item in records) {
            if (results.size >= maxResults) break
            
            // Lazily cache the search string directly inside the transient property of the LocationRecord
            var searchStr = item.searchStr
            if (searchStr == null) {
                val village = item.village
                val district = item.district
                val regency = item.regency
                val province = item.province
                val code = item.code
                searchStr = "$village\n$district\n$regency\n$province\n$code".lowercase()
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
