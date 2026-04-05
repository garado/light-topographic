import { createContext, type ReactNode, useContext, useMemo } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import type { GpxRoute } from "@/utils/parseGpx";

export type StoredRoute = {
  id: string;
  name: string;
  geojson: GpxRoute["geojson"];
  bounds: GpxRoute["bounds"];
};

interface RoutesContextType {
  routes: StoredRoute[];
  activeRouteId: string | null;
  activeRoute: StoredRoute | null;
  addRoute: (route: GpxRoute) => void;
  removeRoute: (id: string) => void;
  setActiveRouteId: (id: string | null) => void;
}

const RoutesContext = createContext<RoutesContextType>({
  routes: [],
  activeRouteId: null,
  activeRoute: null,
  addRoute: () => { },
  removeRoute: () => { },
  setActiveRouteId: () => { },
});

export const useRoutes = () => useContext(RoutesContext);

export const RoutesProvider = ({ children }: { children: ReactNode }) => {
  const [routes, setRoutes] = usePersistedState<StoredRoute[]>("routes", []);
  const [activeRouteId, setActiveRouteId] = usePersistedState<string | null>("activeRouteId", null);

  const activeRoute = useMemo(
    () => routes.find((r) => r.id === activeRouteId) ?? null,
    [routes, activeRouteId],
  );

  const addRoute = (route: GpxRoute) => {
    const id = Date.now().toString();
    const stored: StoredRoute = {
      id,
      name: route.name ?? "Unnamed Route",
      geojson: route.geojson,
      bounds: route.bounds,
    };
    setRoutes([...routes, stored]);
    setActiveRouteId(id);
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter((r) => r.id !== id));
    if (activeRouteId === id) setActiveRouteId(null);
  };

  return (
    <RoutesContext.Provider value={{ routes, activeRouteId, activeRoute, addRoute, removeRoute, setActiveRouteId }}>
      {children}
    </RoutesContext.Provider>
  );
};
