import * as Application from "expo-application";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Linking, PermissionsAndroid } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { useLayerPresets } from "@/contexts/LayerPresetsContext";
import { confirmState } from "@/utils/confirmState";
import { n } from "@/utils/scaling";

const ENABLE_TEXT = "Enabled";
const DISABLE_TEXT = "Disabled";

export default function SettingsScreen() {
  const [locationPermission, setLocationPermission] = useState<string>("unknown");
  const version = Application.nativeApplicationVersion;
  const { resetToDefaults } = useLayerPresets();

  useFocusEffect(
    useCallback(() => {
      if (confirmState.pendingAction === "resetPresets") {
        confirmState.pendingAction = null;
        resetToDefaults();
      }
    }, [resetToDefaults]),
  );

  useEffect(() => {
    const checkPermission = async () => {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      setLocationPermission(granted ? ENABLE_TEXT : DISABLE_TEXT);
    };
    checkPermission();
  }, []);

  const handleLocationPermission = async () => {
    if (locationPermission === ENABLE_TEXT) {
      Linking.openSettings();
      return;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      setLocationPermission(ENABLE_TEXT);
    } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      setLocationPermission(DISABLE_TEXT);
      Linking.openSettings();
    } else {
      setLocationPermission(DISABLE_TEXT);
    }
  };

  return (
    <ContentContainer headerTitle={`Settings (v${version})`} hideBackButton>
      <View style={styles.settings}>
        <SelectorButton
          label="Location Permissions"
          value={locationPermission}
          onPress={handleLocationPermission}
        />
        <StyledButton onPress={() => router.push("/settings/customise")} text="Customise" />
        <StyledButton onPress={() => router.push("/settings/map-tile-cache")} text="Map Tile Cache" />
        <StyledButton
          onPress={() => router.push({
            pathname: "/confirm",
            params: {
              title: "Reset Presets",
              message: "This will delete all your presets and restore the defaults.",
              confirmText: "Reset",
              action: "resetPresets",
            },
          })}
          text="Reset Presets"
        />
        <StyledButton onPress={() => router.push("/settings/faq")} text="FAQ" />
      </View>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  settings: {
    gap: n(26)
  }
});
