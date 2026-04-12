package expo.modules.grayscale

import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GrayscaleModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Grayscale")

    Function("setGrayscale") { enabled: Boolean ->
      val context = appContext.reactContext ?: return@Function
      try {
        if (enabled) {
          Settings.Secure.putInt(context.contentResolver, "accessibility_display_daltonizer_enabled", 1)
          Settings.Secure.putInt(context.contentResolver, "accessibility_display_daltonizer", 0)
        } else {
          Settings.Secure.putInt(context.contentResolver, "accessibility_display_daltonizer_enabled", 0)
        }
      } catch (_: SecurityException) {
        // WRITE_SECURE_SETTINGS not granted; silently ignore
      }
    }
  }
}
