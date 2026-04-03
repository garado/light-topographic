import { router } from "expo-router";
import { OptionsSelector } from "@/components/OptionsSelector";
import { type MapStyle, useMapStyle } from "@/contexts/MapStyleContext";

const OPTIONS = [
  { label: "Color", value: "color" },
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
];

export default function MapStyleScreen() {
  const { mapStyle, setMapStyle } = useMapStyle();

  return (
    <OptionsSelector
      onSelect={(value) => {
        setMapStyle(value as MapStyle);
        router.back();
      }}
      options={OPTIONS}
      selectedValue={mapStyle}
      title="Map Style"
    />
  );
}
