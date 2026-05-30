/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

package id.my.hizari.indonesianlocation.autocomplete.ui

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import id.my.hizari.indonesianlocation.autocomplete.engine.LocationSearchEngine
import id.my.hizari.indonesianlocation.autocomplete.model.LocationRecord
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import androidx.compose.ui.window.PopupProperties
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager

data class AutocompleteTexts(
    val placeholder: String = "Search location...",
    val noResults: String = "No locations found"
)

@OptIn(FlowPreview::class, ExperimentalMaterial3Api::class)
@Composable
fun IndonesianLocationAutocomplete(
    modifier: Modifier = Modifier,
    value: String,
    onQueryChange: (String) -> Unit,
    onLocationSelect: (LocationRecord) -> Unit,
    searchEngine: LocationSearchEngine? = null,
    maxResults: Int = 10,
    minQueryLength: Int = 3,
    debounceMs: Long = 300L,
    texts: AutocompleteTexts = AutocompleteTexts(),
    enabled: Boolean = true,
    shape: androidx.compose.ui.graphics.Shape = OutlinedTextFieldDefaults.shape,
    colors: TextFieldColors = OutlinedTextFieldDefaults.colors(),
    textStyle: TextStyle = TextStyle.Default,
    dropdownModifier: Modifier = Modifier,
    itemPrimaryTextStyle: TextStyle = TextStyle.Default,
    itemPrimaryTextColor: Color = Color.Unspecified,
    itemSecondaryTextStyle: TextStyle = TextStyle.Default,
    itemSecondaryTextColor: Color = Color.Unspecified,
    itemIconTint: Color = Color.Unspecified,
    leadingIcon: @Composable (() -> Unit)? = {
        Icon(
            imageVector = Icons.Default.Place,
            contentDescription = "Location Pin"
        )
    },
    loaderContent: @Composable (() -> Unit)? = {
        CircularProgressIndicator(
            modifier = Modifier.size(20.dp),
            strokeWidth = 2.dp
        )
    },
    itemContent: @Composable (ColumnScope.(LocationRecord) -> Unit)? = null,
    formatSelectedLocation: (LocationRecord) -> String = { "${it.village}, ${it.district}, ${it.regency}, ${it.province} - ${it.code}" },
    emptyContent: @Composable (ColumnScope.(query: String) -> Unit)? = null,
    filter: ((LocationRecord) -> Boolean)? = null,
    searchProvider: (suspend (String) -> List<LocationRecord>)? = null
) {
    var query by remember { mutableStateOf(value) }
    var results by remember { mutableStateOf<List<LocationRecord>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }
    var isOpen by remember { mutableStateOf(false) }

    val focusManager = LocalFocusManager.current

    // Sync external value changes only when dropdown is closed (mirrors React behavior)
    LaunchedEffect(value) {
        if (!isOpen) {
            query = value
        }
    }

    // Flow representing manual keystroke search queries
    val searchFlow = remember {
        MutableSharedFlow<String>(
            extraBufferCapacity = 1,
            onBufferOverflow = BufferOverflow.DROP_OLDEST
        )
    }

    // Wrap dynamic lambdas and parameters in rememberUpdatedState to prevent LaunchedEffect from restarting on recompositions
    val currentSearchEngine by rememberUpdatedState(searchEngine)
    val currentSearchProvider by rememberUpdatedState(searchProvider)
    val currentFilter by rememberUpdatedState(filter)
    val currentMaxResults by rememberUpdatedState(maxResults)
    val currentMinQueryLength by rememberUpdatedState(minQueryLength)

    // Stable selection handler to avoid lambda re-allocation on every recomposition
    val currentFormatSelectedLocation by rememberUpdatedState(formatSelectedLocation)
    val currentOnQueryChange by rememberUpdatedState(onQueryChange)
    val currentOnLocationSelect by rememberUpdatedState(onLocationSelect)

    val handleSelect = remember<(LocationRecord) -> Unit> {
        { loc ->
            val formatted = currentFormatSelectedLocation(loc)
            query = formatted
            currentOnQueryChange(formatted)
            isOpen = false
            isSearching = false
            focusManager.clearFocus()
            currentOnLocationSelect(loc)
        }
    }

    // Debounced search trigger via Coroutine Flow
    LaunchedEffect(debounceMs) {
        searchFlow
            .debounce(debounceMs)
            .collectLatest { searchQuery ->
                if (searchQuery.trim().length >= currentMinQueryLength) {
                    isSearching = true
                    try {
                        val searchResults = currentSearchProvider?.invoke(searchQuery)
                            ?: currentSearchEngine?.searchLocations(
                                searchQuery,
                                currentMaxResults,
                                currentMinQueryLength,
                                currentFilter
                            ) ?: run {
                                Log.w(
                                    "IndonesianLocationAutocomplete",
                                    "No searchEngine or searchProvider provided."
                                )
                                emptyList()
                            }

                        // Only apply results if the query hasn't changed and dropdown is still open
                        if (searchQuery == query && isOpen) {
                            results = searchResults
                        }
                    } catch (e: Exception) {
                        Log.e("IndonesianLocationAutocomplete", "Autocomplete search error", e)
                        if (searchQuery == query && isOpen) {
                            results = emptyList()
                        }
                    } finally {
                        isSearching = false
                    }
                } else {
                    results = emptyList()
                    isOpen = false
                    isSearching = false
                }
            }
    }

    val isExpanded = isOpen && (!isSearching || results.isNotEmpty())

    ExposedDropdownMenuBox(
        expanded = isExpanded,
        onExpandedChange = {},
        modifier = modifier
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = {
                query = it
                onQueryChange(it)
                searchFlow.tryEmit(it)
                if (it.trim().length >= minQueryLength) {
                    isOpen = true
                    isSearching = true
                } else {
                    isOpen = false
                    isSearching = false
                }
            },
            enabled = enabled,
            textStyle = textStyle,
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(),
            placeholder = { Text(texts.placeholder) },
            leadingIcon = leadingIcon,
            trailingIcon = if (isSearching && loaderContent != null) {
                { loaderContent() }
            } else null,
            singleLine = true,
            shape = shape,
            colors = colors
        )

        DropdownMenu(
            expanded = isExpanded,
            onDismissRequest = { isOpen = false },
            properties = PopupProperties(focusable = false),
            modifier = Modifier
                .exposedDropdownSize()
                .then(dropdownModifier)
        ) {
            if (results.isEmpty()) {
                if (emptyContent != null) {
                    Column { emptyContent(query) }
                } else {
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = texts.noResults,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        onClick = {},
                        enabled = false
                    )
                }
            } else {
                results.forEach { loc ->
                    if (itemContent != null) {
                        DropdownMenuItem(
                            text = { itemContent(loc) },
                            onClick = { handleSelect(loc) },
                            leadingIcon = null,
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                        )
                    } else {
                        DropdownMenuItem(
                            text = {
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        text = "${loc.village}, ${loc.district}",
                                        style = if (itemPrimaryTextStyle != TextStyle.Default) itemPrimaryTextStyle else MaterialTheme.typography.bodyLarge,
                                        color = if (itemPrimaryTextColor != Color.Unspecified) itemPrimaryTextColor else MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "${loc.regency}, ${loc.province} - ${loc.code}",
                                        style = if (itemSecondaryTextStyle != TextStyle.Default) itemSecondaryTextStyle else MaterialTheme.typography.bodyMedium,
                                        color = if (itemSecondaryTextColor != Color.Unspecified) itemSecondaryTextColor else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            },
                            onClick = { handleSelect(loc) },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Place,
                                    contentDescription = null,
                                    tint = if (itemIconTint != Color.Unspecified) itemIconTint else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(20.dp)
                                )
                            },
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }
    }
}
