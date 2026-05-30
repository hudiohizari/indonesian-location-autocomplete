/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

package id.my.hizari.indonesianlocation.autocomplete.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
data class LocationRecord(
    val code: Int,
    val village: String = "",
    val district: String = "",
    val regency: String = "",
    val province: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val elevation: Int = 0,
    val timezone: String = ""
) {
    @Transient
    var searchStr: String? = null
}
