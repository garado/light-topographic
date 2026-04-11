import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export type Units = "imperial" | "metric";

interface UnitsContextType {
  units: Units;
  setUnits: (value: Units) => Promise<void>;
}

const UnitsContext = createContext<UnitsContextType>({
  units: "imperial",
  setUnits: async () => {},
});

export const useUnits = () => useContext(UnitsContext);

export const UnitsProvider = ({ children }: { children: ReactNode }) => {
  const [units, setUnits] = usePersistedState<Units>("units", "imperial");

  return (
    <UnitsContext.Provider value={{ units, setUnits }}>
      {children}
    </UnitsContext.Provider>
  );
};
