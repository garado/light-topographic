import { type Href, router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { useMapStyle } from "@/contexts/MapStyleContext";
import { useOptionExample } from "@/contexts/OptionExampleContext";

const OPTION_LABELS: Record<string, string> = {
  "option-1": "Option 1",
  "option-2": "Option 2",
  "option-3": "Option 3",
};

const MAP_STYLE_LABELS: Record<string, string> = {
  color: "Color",
  white: "White",
  black: "Black",
};

export default function CustomiseScreen() {
  const { optionExample } = useOptionExample();
  const { mapStyle } = useMapStyle();

  return (
    <ContentContainer headerTitle="Customise">
      <StyledButton
        onPress={() => router.push("/settings/customise-interface" as Href)}
        text="Interface"
      />
      <SelectorButton
        href="/settings/map-style"
        label="Map Style"
        value={MAP_STYLE_LABELS[mapStyle]}
      />
      <SelectorButton
        href="/settings/option-example"
        label="Option Example"
        value={OPTION_LABELS[optionExample]}
      />
    </ContentContainer>
  );
}
