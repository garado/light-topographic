import type { MaterialIcons } from "@expo/vector-icons";

export type MarkerIconKey = keyof typeof MaterialIcons.glyphMap;

export const MARKER_ICONS: { key: MarkerIconKey; label: string }[] = [
  { key: "place",          label: "Pin" },
  { key: "flag",           label: "Flag" },
  { key: "star",           label: "Star" },
  { key: "home",           label: "Home" },
  { key: "directions-car", label: "Car" },
  { key: "local-parking",  label: "Parking" },
  { key: "restaurant",     label: "Food" },
  { key: "hotel",          label: "Lodging" },
  { key: "photo-camera",   label: "Photo" },
  { key: "terrain",        label: "Peak" },
  { key: "warning",        label: "Warning" },
  { key: "water",          label: "Water" },
];

export const DEFAULT_MARKER_ICON: MarkerIconKey = "place";
