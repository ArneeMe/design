plugins {
    id("com.android.application")
}

android {
    namespace = "me.arnee.design.ikoner.waddle"
    compileSdk = 35

    defaultConfig {
        applicationId = "me.arnee.design.ikoner.waddle"
        minSdk = 26
        targetSdk = 35
        versionCode = 21000
        versionName = "2.10.0"
    }

    signingConfigs {
        create("pack") {
            storeFile = file("iconpack.keystore")
            storePassword = "waddle-ikoner"
            keyAlias = "ikoner"
            keyPassword = "waddle-ikoner"
        }
    }

    buildTypes {
        getByName("debug") { signingConfig = signingConfigs.getByName("pack") }
    }
}
