import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";
import { MapLayersProvider } from "@/contexts/MapLayersContext";
import { MapStyleProvider } from "@/contexts/MapStyleContext";
import { OptionExampleProvider } from "@/contexts/OptionExampleContext";
import { RoutesProvider } from "@/contexts/RoutesContext";

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
      <InvertColorsProvider>
        <MapLayersProvider>
        <RoutesProvider>
        <MapStyleProvider>
        <OptionExampleProvider>
          <StatusBar hidden />
          <RootLayout />
        </OptionExampleProvider>
        </MapStyleProvider>
        </RoutesProvider>
        </MapLayersProvider>
      </InvertColorsProvider>
    </GestureHandlerRootView>
  );
}
