import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { TextInput } from "@/components/TextInput";
import { tileCacheSizeState } from "@/utils/tileCacheSizeState";

export default function TileCacheSizeScreen() {
  const { currentMb } = useLocalSearchParams<{ currentMb: string }>();
  const [value, setValue] = useState(currentMb ?? "");

  const handleSubmit = () => {
    const mb = parseInt(value, 10);
    if (!mb || mb <= 0) return;
    tileCacheSizeState.pendingMb = mb;
    router.back();
  };

  return (
    <ContentContainer headerTitle="Tile Cache Size">
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Size in MB"
        keyboardType="numeric"
        onSubmit={handleSubmit}
        autoFocus
      />
    </ContentContainer>
  );
}
