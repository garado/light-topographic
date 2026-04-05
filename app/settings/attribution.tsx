import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { n } from "@/utils/scaling";

export default function AttributionScreen() {
  return (
    <ContentContainer headerTitle="Attribution">
      <StyledText style={{ fontSize: n(18) }}>Tiles by OSM US{"\n"}tiles.openstreetmap.us</StyledText>
      <StyledText style={{ fontSize: n(18) }}>© OpenStreetMap contributors{"\n"}openstreetmap.org/copyright</StyledText>
      <StyledText style={{ fontSize: n(18) }}>© OpenMapTiles{"\n"}openmaptiles.org</StyledText>
    </ContentContainer>
  );
}
