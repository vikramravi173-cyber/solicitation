import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from "react";
import type { LobbyCampaign } from "./types";
import { clearLobbyStorage, emptyCampaign } from "./storage";
import { useAuth } from "@/lib/supabase/AuthContext";
import { fetchLobbyCampaign, saveLobbyCampaign } from "@/lib/supabase/user-data";

interface LobbyContextValue {
  campaign: LobbyCampaign;
  updateCampaign: (patch: Partial<LobbyCampaign> | ((prev: LobbyCampaign) => LobbyCampaign)) => void;
  resetCampaign: () => void;
  cloudSync: "loading" | "syncing" | "synced" | "error";
  ready: boolean;
}

const LobbyContext = createContext<LobbyContextValue | null>(null);

export function LobbyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<LobbyCampaign>(() => emptyCampaign());
  const [cloudSync, setCloudSync] = useState<LobbyContextValue["cloudSync"]>("loading");
  const [ready, setReady] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load campaign from cloud on mount (RequireAuth guarantees user is signed in)
  useEffect(() => {
    if (!user) return;

    clearLobbyStorage();
    let cancelled = false;

    (async () => {
      setCloudSync("loading");
      setReady(false);
      try {
        const remote = await fetchLobbyCampaign(user.id);
        if (cancelled) return;
        setCampaign(remote ?? emptyCampaign());
        setCloudSync("synced");
      } catch {
        if (!cancelled) {
          setCampaign(emptyCampaign());
          setCloudSync("error");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !ready) return;

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
  }, [campaign, user, ready]);

  const updateCampaign = useCallback(
    (patch: Partial<LobbyCampaign> | ((prev: LobbyCampaign) => LobbyCampaign)) => {
      setCampaign((prev) => (typeof patch === "function" ? patch(prev) : { ...prev, ...patch }));
    },
    [],
  );

  const resetCampaign = useCallback(() => {
    setCampaign(emptyCampaign());
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-deck px-5 py-20">
        <p className="font-mono text-[13px] text-faint">Loading your campaign…</p>
      </div>
    );
  }

  return (
    <LobbyContext.Provider value={{ campaign, updateCampaign, resetCampaign, cloudSync, ready }}>
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error("useLobby must be used within LobbyProvider");
  return ctx;
}
