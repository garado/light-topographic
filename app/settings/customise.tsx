import { type Href, router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { useMapStyle } from "@/contexts/MapStyleContext";
import { useOptionExample } from "@/contexts/OptionExampleContext";

export default function CustomiseScreen() {
  const { optionExample } = useOptionExample();
  const { mapStyle } = useMapStyle();

  return (
    <ContentContainer headerTitle="Customise">
      <StyledButton
        onPress={() => router.push("/settings/customise-interface" as Href)}
        text="Interface"
      />
    </ContentContainer>
  );
}
