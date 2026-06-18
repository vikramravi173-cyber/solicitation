import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from "react";
import type { LobbyCampaign } from "./types";
import { loadCampaign, saveCampaign } from "./storage";
import { useAuth } from "@/lib/supabase/AuthContext";
import { fetchLobbyCampaign, saveLobbyCampaign } from "@/lib/supabase/user-data";

interface LobbyContextValue {
  campaign: LobbyCampaign;
  updateCampaign: (patch: Partial<LobbyCampaign> | ((prev: LobbyCampaign) => LobbyCampaign)) => void;
  resetCampaign: () => void;
  cloudSync: "local" | "syncing" | "synced" | "error";
}

const LobbyContext = createContext<LobbyContextValue | null>(null);

export function LobbyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<LobbyCampaign>(() => loadCampaign());
  const [cloudSync, setCloudSync] = useState<LobbyContextValue["cloudSync"]>("local");
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedFromCloud = useRef(false);

  // Pull cloud campaign once after sign-in
  useEffect(() => {
    if (!user) {
      hydratedFromCloud.current = false;
      setCloudSync("local");
      return;
    }
    if (hydratedFromCloud.current) return;

    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchLobbyCampaign(user.id);
        if (cancelled) return;
        if (remote) {
          setCampaign(remote);
          saveCampaign(remote);
        }
        hydratedFromCloud.current = true;
        setCloudSync("synced");
      } catch {
        if (!cancelled) setCloudSync("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    saveCampaign(campaign);

    if (!user) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      setCloudSync("syncing");
      try {
        await saveLobbyCampaign(user.id, campaign);
        setCloudSync("synced");
      } catch {
        setCloudSync("error");
      }
    }, 800);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [campaign, user]);

  const updateCampaign = useCallback(
    (patch: Partial<LobbyCampaign> | ((prev: LobbyCampaign) => LobbyCampaign)) => {
      setCampaign((prev) => (typeof patch === "function" ? patch(prev) : { ...prev, ...patch }));
    },
    [],
  );

  const resetCampaign = useCallback(() => {
    localStorage.removeItem("capture-deck-lobby-campaign");
    const fresh = loadCampaign();
    setCampaign({ ...fresh, id: crypto.randomUUID() });
  }, []);

  return (
    <LobbyContext.Provider value={{ campaign, updateCampaign, resetCampaign, cloudSync }}>
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error("useLobby must be used within LobbyProvider");
  return ctx;
}
