import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/supabase/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const PURPOSE_COPY: Record<string, { title: string; body: string }> = {
  site: {
    title: "Sign in to Capture Deck",
    body: "The solicitation catalog, company match, pursuit dossiers, and lobby toolkit require an account. Your notes and lobby campaign sync to your Supabase project when signed in.",
  },
  default: {
    title: "Sign in required",
    body: "This area requires an account.",
  },
  lobby: {
    title: "Sign in to use the lobby toolkit",
    body: "Lobby campaigns and notes sync to your account when signed in.",
  },
};

export function RequireAuth({
  children,
  purpose = "site",
}: {
  children: ReactNode;
  purpose?: keyof typeof PURPOSE_COPY | string;
}) {
  const { configured, user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const copy = PURPOSE_COPY[purpose] ?? PURPOSE_COPY.default;

  if (!configured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-deck px-5 py-20">
        <p className="font-mono text-[13px] text-faint">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="mx-auto max-w-deck px-5 py-14">
          <div className="eyebrow">Account required</div>
          <h1 className="mt-3 font-display text-3xl font-bold text-mist">{copy.title}</h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">{copy.body}</p>
          <div className="mt-8">
            <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary py-3">
              Sign in or create account →
            </button>
          </div>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return <>{children}</>;
}
