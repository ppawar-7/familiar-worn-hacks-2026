plugins { id("com.android.application") }

android {
    namespace = "com.familiar.glasses"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.familiar.glasses"
        minSdk = 28
        targetSdk = 28 // Matches the supplied M6 Android 9 template; revisit before wider distribution.
        versionCode = 1
        versionName = "0.1.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
// No third-party runtime dependencies. Intentional for offline hackathon demo.
