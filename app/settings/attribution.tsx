import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { n } from "@/utils/scaling";

export default function AttributionScreen() {
  return (
    <ContentContainer headerTitle="Attribution">
      <StyledText style={{ fontSize: n(17) }}>Map tiles are provided by OpenStreetMap/OpenMapTiles.</StyledText>
      <StyledText style={{ fontSize: n(17) }}>https://tiles.openstreetmap.us/</StyledText>
    </ContentContainer>
  );
}
