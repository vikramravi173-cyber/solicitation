import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/supabase/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const PURPOSE_COPY: Record<string, { title: string; body: string }> = {
  lobby: {
    title: "Sign in to use the lobby toolkit",
    body: "Congressional tracker, email templates, outreach resources, and the lobby assistant require an account. Your campaign data syncs to your Supabase project when signed in.",
  },
  default: {
    title: "Sign in required",
    body: "This area requires an account.",
  },
};

export function RequireAuth({
  children,
  purpose = "default",
}: {
  children: ReactNode;
  purpose?: keyof typeof PURPOSE_COPY | string;
}) {
  const { configured, user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const copy = PURPOSE_COPY[purpose] ?? PURPOSE_COPY.default;

  if (loading) {
    return (
      <div className="mx-auto max-w-deck px-5 py-20">
        <p className="font-mono text-[13px] text-faint">Checking session…</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-deck px-5 py-14">
        <div className="eyebrow">Authentication unavailable</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-mist">
          Lobby toolkit requires Supabase
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
          Supabase environment variables are not configured for this deployment. A repo admin
          must add <code className="font-mono text-[13px] text-brass">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-[13px] text-brass">VITE_SUPABASE_ANON_KEY</code> as
          GitHub Actions secrets. See the README for setup steps.
        </p>
        <Link to="/" className="btn-ghost mt-6 inline-flex py-2.5">
          ← Back to home
        </Link>
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
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary py-3">
              Sign in or create account →
            </button>
            <Link to="/" className="btn-ghost py-3">
              ← Back to home
            </Link>
          </div>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return <>{children}</>;
}
