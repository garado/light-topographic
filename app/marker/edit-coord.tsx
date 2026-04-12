import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import ContentContainer from "@/components/ContentContainer";
import { TextInput } from "@/components/TextInput";
import { newMarkerState } from "@/utils/newMarkerState";

export default function EditCoordScreen() {
  const { field, currentValue } = useLocalSearchParams<{ field: "lat" | "lon"; currentValue: string }>();
  const [value, setValue] = useState(currentValue ?? "");

  const handleSubmit = () => {
    if (isNaN(parseFloat(value))) return;
    if (field === "lat") newMarkerState.pendingLat = value.trim();
    else newMarkerState.pendingLon = value.trim();
    router.back();
  };

  return (
    <ContentContainer headerTitle={field === "lat" ? "Latitude" : "Longitude"}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={field === "lat" ? "Latitude" : "Longitude"}
        keyboardType="numeric"
        onSubmit={handleSubmit}
        autoFocus
      />
    </ContentContainer>
  );
}
