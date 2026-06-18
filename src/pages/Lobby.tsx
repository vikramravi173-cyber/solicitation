import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { LobbyProvider, useLobby } from "@/lib/lobby/context";
import { exportCampaignJson } from "@/lib/lobby/storage";
import type { LobbyTab } from "@/lib/lobby/types";
import { CongressionalTracker } from "@/components/lobby/CongressionalTracker";
import { CongressionalOutreach } from "@/components/lobby/CongressionalOutreach";
import { EmailTemplatesPanel } from "@/components/lobby/EmailTemplatesPanel";
import { LobbyResourcesPanel } from "@/components/lobby/LobbyResourcesPanel";
import { LobbyAssistant } from "@/components/lobby/LobbyAssistant";
import { IMG } from "@/lib/ui/images";

const TABS: { id: LobbyTab; label: string; description: string }[] = [
  {
    id: "tracker",
    label: "Congressional tracker",
    description: "Draft & track NDAA authorization requests",
  },
  {
    id: "outreach",
    label: "Outreach",
    description: "Find members and follow the outreach workflow",
  },
  {
    id: "templates",
    label: "Email templates",
    description: "Generate staff emails from campaign data",
  },
  {
    id: "resources",
    label: "Resources",
    description: "Official lookup tools and guidance",
  },
  {
    id: "assistant",
    label: "Lobby assistant",
    description: "Interactive DIY lobbying guidance",
  },
];

const VALID_TABS = new Set<string>(TABS.map((t) => t.id));

export function LobbyPage() {
  return (
    <RequireAuth purpose="lobby">
      <LobbyProvider>
        <LobbyPageInner />
      </LobbyProvider>
    </RequireAuth>
  );
}

function LobbyPageInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "tracker";
  const activeTab: LobbyTab = VALID_TABS.has(tabParam) ? (tabParam as LobbyTab) : "tracker";
  const { campaign, cloudSync } = useLobby();
  const [exported, setExported] = useState(false);

  function setTab(tab: LobbyTab) {
    setSearchParams({ tab }, { replace: true });
  }

  async function exportJson() {
    const blob = new Blob([exportCampaignJson(campaign)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lobby-campaign-${campaign.fiscalYear.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  return (
    <>
      {/* Masthead — mirrors home / match visual language */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <img
            src={IMG.orbit}
            alt=""
            className="h-full w-full object-cover duotone opacity-35"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/60 to-ink" />
          <div className="absolute inset-0 deck-grid-bg opacity-25" />
        </div>

        <div className="relative mx-auto max-w-deck px-5 pb-10 pt-14 sm:pt-20">
          <div className="max-w-3xl animate-fade-up">
            <div className="eyebrow">DIY lobby toolkit</div>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Congressional authorization,
              <br />
              tracked end to end.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist/80">
              Draft NDAA requests, log staff outreach, generate emails, and work through the DIY
              Lobbyist workflow — aligned with the Strogen authorization template. Sign in to save
              your campaign to the cloud.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={exportJson} className="btn-ghost py-2.5">
                {exported ? "Exported!" : "Export campaign JSON"}
              </button>
              <span className="font-mono text-[11px] text-faint">
                {cloudSync === "syncing" && "Syncing…"}
                {cloudSync === "synced" && "Cloud synced"}
                {cloudSync === "error" && "Sync error — retry by editing a field"}
                {cloudSync === "loading" && "Loading…"}
              </span>
              <Link to="/match" className="btn-quiet py-2.5">
                ← Back to company match
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-deck px-5 py-10">
        {/* Tab rail */}
        <nav className="no-print -mx-1 mb-8 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 font-mono text-[12px] transition-colors ${
                activeTab === tab.id
                  ? "bg-brass/15 text-brass border border-brass/40"
                  : "text-muted hover:text-mist border border-transparent hover:border-line"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <p className="mb-6 text-[13px] text-faint">
          {TABS.find((t) => t.id === activeTab)?.description}
        </p>

        {activeTab === "tracker" && <CongressionalTracker />}
        {activeTab === "outreach" && <CongressionalOutreach />}
        {activeTab === "templates" && <EmailTemplatesPanel />}
        {activeTab === "resources" && <LobbyResourcesPanel />}
        {activeTab === "assistant" && <LobbyAssistant />}
      </div>
    </>
  );
}
