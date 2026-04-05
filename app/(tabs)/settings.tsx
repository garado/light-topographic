import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View, Linking, PermissionsAndroid } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { n } from "@/utils/scaling";
import * as Application from "expo-application";

const ENABLE_TEXT = "Enabled";
const DISABLE_TEXT = "Disabled";

export default function SettingsScreen() {
  const [locationPermission, setLocationPermission] = useState<string>("unknown");
  const version = Application.nativeApplicationVersion;

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
          label="Location Permission"
          value={locationPermission}
          onPress={handleLocationPermission}
        />
        <StyledButton onPress={() => router.push("/settings/customise")} text="Customise" />
        <StyledButton onPress={() => router.push("/settings/cached-tiles")} text="Cached Tiles" />
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
