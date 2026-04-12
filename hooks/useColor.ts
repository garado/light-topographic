import { setGrayscale } from "@/modules/grayscale";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useColor() {
  useFocusEffect(
    useCallback(() => {
      setGrayscale(false);
      return () => {
        setGrayscale(true);
      };
    }, [])
  );
}
