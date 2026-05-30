/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

package id.my.hizari.indonesianlocation.autocomplete.demo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import id.my.hizari.indonesianlocation.autocomplete.engine.LocationSearchEngine
import id.my.hizari.indonesianlocation.autocomplete.model.LocationRecord
import id.my.hizari.indonesianlocation.autocomplete.ui.IndonesianLocationAutocomplete
import id.my.hizari.indonesianlocation.autocomplete.ui.AutocompleteTexts
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val searchEngine = LocationSearchEngine(applicationContext)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var defaultQuery by remember { mutableStateOf("") }
                    var emeraldQuery by remember { mutableStateOf("") }
                    var darkQuery by remember { mutableStateOf("") }
                    var filterQuery by remember { mutableStateOf("") }
                    var providerQuery by remember { mutableStateOf("") }
                    
                    var selectedLocation by remember { mutableStateOf<LocationRecord?>(null) }
                    val scrollState = rememberScrollState()

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(scrollState)
                            .padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        Column {
                            Text(
                                text = "Indonesian Location Autocomplete",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Jetpack Compose Customization Playground",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }

                        // 1. Default Style
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "1. Default Clean",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                                IndonesianLocationAutocomplete(
                                    value = defaultQuery,
                                    onQueryChange = { defaultQuery = it },
                                    onLocationSelect = { selectedLocation = it },
                                    searchEngine = searchEngine
                                )
                            }
                        }

                        // 2. Emerald Mint Pill Style
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "2. Emerald Mint (Pill shape & Green theme)",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                                IndonesianLocationAutocomplete(
                                    value = emeraldQuery,
                                    onQueryChange = { emeraldQuery = it },
                                    onLocationSelect = { selectedLocation = it },
                                    searchEngine = searchEngine,
                                    shape = RoundedCornerShape(28.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Color(0xFF10B981),
                                        unfocusedBorderColor = Color(0xFFCBD5E1),
                                        focusedLeadingIconColor = Color(0xFF10B981),
                                        unfocusedLeadingIconColor = Color(0xFF10B981),
                                        focusedContainerColor = Color(0xFFF0FDF4),
                                        unfocusedContainerColor = Color(0xFFF8FAFC)
                                    )
                                )
                            }
                        }

                        // 3. Slate Dark Mode Style
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFF1E293B)
                            )
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "3. Slate Dark Mode",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFF8FAFC),
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                                IndonesianLocationAutocomplete(
                                    value = darkQuery,
                                    onQueryChange = { darkQuery = it },
                                    onLocationSelect = { selectedLocation = it },
                                    searchEngine = searchEngine,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Color(0xFF818CF8),
                                        unfocusedBorderColor = Color(0xFF475569),
                                        focusedTextColor = Color(0xFFF8FAFC),
                                        unfocusedTextColor = Color(0xFFF8FAFC),
                                        focusedContainerColor = Color(0xFF0F172A),
                                        unfocusedContainerColor = Color(0xFF1E293B),
                                        focusedLeadingIconColor = Color(0xFF818CF8),
                                        unfocusedLeadingIconColor = Color(0xFF64748B)
                                    )
                                )
                            }
                        }

                        // 4. Custom Empty State Style
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "4. Custom Empty State",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                                var customEmptyQuery by remember { mutableStateOf("") }
                                IndonesianLocationAutocomplete(
                                    value = customEmptyQuery,
                                    onQueryChange = { customEmptyQuery = it },
                                    onLocationSelect = { selectedLocation = it },
                                    searchEngine = searchEngine,
                                    texts = AutocompleteTexts(placeholder = "Cari dengan nama acak..."),
                                    emptyContent = { query ->
                                        DropdownMenuItem(
                                            text = {
                                                Column(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Default.Info,
                                                        contentDescription = "Not Found",
                                                        tint = Color.Red,
                                                        modifier = Modifier.size(24.dp)
                                                    )
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = "No Location Found",
                                                        fontWeight = FontWeight.Bold,
                                                        style = MaterialTheme.typography.bodyMedium,
                                                        color = MaterialTheme.colorScheme.onSurface
                                                    )
                                                    Text(
                                                        text = "We couldn't find \"$query\"",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                                    )
                                                }
                                            },
                                            onClick = {},
                                            enabled = false
                                        )
                                    }
                                )
                            }
                        }

                        // 5. Dynamic Parent Filter Style
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "5. Dynamic Province Filter",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                var selectedProvince by remember { mutableStateOf("Jawa Barat") }
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.padding(bottom = 12.dp)
                                ) {
                                    listOf("Jawa Barat", "DKI Jakarta", "Jawa Tengah").forEach { prov ->
                                        @OptIn(ExperimentalMaterial3Api::class)
                                        FilterChip(
                                            selected = selectedProvince == prov,
                                            onClick = { selectedProvince = prov },
                                            label = { Text(prov) }
                                        )
                                    }
                                }
                                IndonesianLocationAutocomplete(
                                    value = filterQuery,
                                    onQueryChange = { filterQuery = it },
                                    onLocationSelect = { selectedLocation = it },
                                    searchEngine = searchEngine,
                                    filter = { it.province == selectedProvince },
                                    texts = AutocompleteTexts(placeholder = "Cari di $selectedProvince...")
                                )
                            }
                        }

                        // 6. Custom Search Provider / Remote Simulator
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "6. Custom Search Provider (API Simulator)",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                                IndonesianLocationAutocomplete(
                                    value = providerQuery,
                                    onQueryChange = { providerQuery = it },
                                    onLocationSelect = { selectedLocation = it },
                                    searchProvider = { q ->
                                        // Simulate slow remote API latency
                                        kotlinx.coroutines.delay(600)
                                        searchEngine.searchLocations(q)
                                    },
                                    texts = AutocompleteTexts(placeholder = "Cari via Custom Provider..."),
                                    loaderContent = {
                                        Row(
                                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            CircularProgressIndicator(
                                                modifier = Modifier.size(16.dp),
                                                strokeWidth = 2.dp,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                            Text(
                                                text = "Fetching API...",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                    }
                                )
                            }
                        }

                        // Selected Location Details Card
                        selectedLocation?.let { loc ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = "Selected Location Details",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                    Divider(color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f))
                                    Text("Postcode: ${loc.code}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("Village: ${loc.village}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("District: ${loc.district}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("Regency: ${loc.regency}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("Province: ${loc.province}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("Coordinates: ${loc.latitude}, ${loc.longitude}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("Timezone: ${loc.timezone}", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                    Text("Elevation: ${loc.elevation}m", color = MaterialTheme.colorScheme.onPrimaryContainer)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
