import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import ContentContainer from "@/components/ContentContainer";
import { StyledButton } from "@/components/StyledButton";

export default function SettingsScreen() {
  const params = useLocalSearchParams<{
    confirmed?: string;
    action?: string;
  }>();

  useEffect(() => {
    if (params.confirmed === "true") {
      router.setParams({ confirmed: undefined, action: undefined });
      if (params.action === "exampleAction") {
        console.log("Example action confirmed!");
      }
    }
  }, [params.confirmed, params.action]);

  return (
    <ContentContainer headerTitle="Settings" hideBackButton>
      <StyledButton onPress={() => router.push("/settings/customise")} text="Customise" />
      <StyledButton onPress={() => router.push("/settings/cached-tiles")} text="Cached Tiles" />
      <StyledButton onPress={() => router.push("/settings/faq")} text="FAQ" />
    </ContentContainer>
  );
}
