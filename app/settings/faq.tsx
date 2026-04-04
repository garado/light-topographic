import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { n } from "@/utils/scaling";

const FAQS = [
  {
    q: "The direction cone is inaccurate",
    a: "The cone uses your phone's magnetometer (compass). Nearby metal objects - metal credit cards, keys, metal screws - can interfere with it and cause incorrect readings. Remove metal objects from near your phone.",
  },
  {
    q: "Location does not appear",
    a: "Make sure location permissions are granted for Topographic. GPS can also take a moment to get a fix, especially indoors or under heavy tree cover.",
  },
  {
    q: "Contour lines or trail names are not showing",
    a: "These only appear at higher zoom levels. Zoom in closer to your area and they should appear. Check the Layers tab to make sure these layers are set to visible.",
  },
  {
    q: "Colors are not working",
    a: "Your phone may be in grayscale mode. Change it in the Android layer accessibility settings. You can also enter the Album app in LightOS to disable grayscale, then use your keypress shortcut to switch to the Android layer.",
  }
];

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <View style={styles.item}>
      <StyledText style={styles.question}>{q}</StyledText>
      <StyledText style={styles.answer}>{a}</StyledText>
    </View>
  );
}

export default function FaqScreen() {
  return (
    <ContentContainer headerTitle="FAQ" contentGap={32}>
      {FAQS.map((faq) => (
        <FaqItem key={faq.q} q={faq.q} a={faq.a} />
      ))}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: n(8),
    width: "100%",
  },
  question: {
    fontSize: n(22),
  },
  answer: {
    fontSize: n(16),
    opacity: 0.6,
    lineHeight: n(24),
  },
});
