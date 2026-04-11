import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();
SplashScreen.hideAsync();
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";
import { MapLayersProvider } from "@/contexts/MapLayersContext";
import { LayerPresetsProvider } from "@/contexts/LayerPresetsContext";
import { MapStyleProvider } from "@/contexts/MapStyleContext";
import { OptionExampleProvider } from "@/contexts/OptionExampleContext";
import { MarkersProvider } from "@/contexts/MarkersContext";
import { RoutesProvider } from "@/contexts/RoutesContext";
import { UnitsProvider } from "@/contexts/UnitsContext";

function RootLayout() {
  const { invertColors } = useInvertColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: {
          backgroundColor: invertColors ? "white" : "black",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UnitsProvider>
      <InvertColorsProvider>
        <MapLayersProvider>
          <LayerPresetsProvider>
            <MarkersProvider>
            <RoutesProvider>
              <MapStyleProvider>
                <OptionExampleProvider>
                  <StatusBar hidden />
                  <RootLayout />
                </OptionExampleProvider>
              </MapStyleProvider>
            </RoutesProvider>
            </MarkersProvider>
          </LayerPresetsProvider>
        </MapLayersProvider>
      </InvertColorsProvider>
      </UnitsProvider>
    </GestureHandlerRootView>
  );
}
