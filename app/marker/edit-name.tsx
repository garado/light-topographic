import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { TextInput } from "@/components/TextInput";
import { editPresetState } from "@/utils/editPresetState";

export default function EditMarkerNameScreen() {
  const { currentName } = useLocalSearchParams<{ currentName: string }>();
  const [name, setName] = useState(currentName ?? "");

  const handleSubmit = () => {
    editPresetState.pendingName = name.trim();
    router.back();
  };

  return (
    <ContentContainer headerTitle="Marker Name">
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Marker name"
        onSubmit={handleSubmit}
        autoFocus
      />
    </ContentContainer>
  );
}
