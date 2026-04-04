import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { TextInput } from "@/components/TextInput";
import { editPresetState } from "@/utils/editPresetState";

export default function EditPresetNameScreen() {
  const { currentName } = useLocalSearchParams<{ currentName: string }>();
  const [name, setName] = useState(currentName ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    editPresetState.pendingName = name.trim();
    router.back();
  };

  return (
    <ContentContainer headerTitle="Preset Name">
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Preset name"
        onSubmit={handleSubmit}
        autoFocus
      />
    </ContentContainer>
  );
}
