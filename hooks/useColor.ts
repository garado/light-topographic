import { setGrayscale } from "@/modules/grayscale";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

export function useColor() {
  const isFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      setGrayscale(false);
      return () => {
        isFocused.current = false;
        setGrayscale(true);
      };
    }, [])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isFocused.current) {
        setGrayscale(false);
      }
    });
    return () => sub.remove();
  }, []);
}
