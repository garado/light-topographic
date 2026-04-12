import { requireOptionalNativeModule } from 'expo-modules-core'

const GrayscaleModule = requireOptionalNativeModule('Grayscale')

export function setGrayscale(enabled: boolean): void {
  GrayscaleModule?.setGrayscale(enabled)
}
