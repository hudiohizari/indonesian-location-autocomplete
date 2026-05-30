/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    plugins {
        id("com.android.application") version "8.2.2"
        id("com.android.library") version "8.2.2"
        id("org.jetbrains.kotlin.android") version "1.9.20"
        id("org.jetbrains.kotlin.plugin.serialization") version "1.9.20"
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "IndonesianLocationAutocompleteDemo"
include(":app")
include(":library")
project(":library").projectDir = file("../../packages/android")
