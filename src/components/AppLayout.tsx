import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CATALOG_META } from "@/data/solicitations";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/lib/supabase/AuthContext";

function Wordmark() {
  return (
    <Link to="/" className="group flex flex-col leading-none">
      <span className="font-display text-[15px] font-bold tracking-tight text-mist">
        SOLICITATIONS
      </span>
      <span className="font-mono text-[9px] uppercase tracking-eyebrow text-brass">
        Capture&nbsp;Deck
      </span>
    </Link>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const onReport = pathname === "/report";
  const { configured, user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-deck items-center justify-between px-5">
          <Wordmark />
          <nav className="flex items-center gap-1">
            <a
              href="/#book-with-bret"
              className="font-mono text-[12px] px-3 py-2 text-brass transition-colors hover:text-brass-bright"
            >
              Schedule a Meeting
            </a>
            <HeaderLink to="/lobby" label="Lobby toolkit" />
            <HeaderLink to="/match" label="Company match" />
            {onReport && <HeaderLink to="/report" label="Dossier" />}
            {configured &&
              (user ? (
                <HeaderLink to="/account" label="Account" />
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  disabled={loading}
                  className="font-mono text-[12px] px-3 py-2 text-muted transition-colors hover:text-mist disabled:opacity-50"
                >
                  {loading ? "…" : "Sign in"}
                </button>
              ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="no-print border-t border-line">
        <div className="mx-auto flex max-w-deck flex-col items-start justify-between gap-2 px-5 py-5 text-[12px] text-faint sm:flex-row sm:items-center">
          <span className="font-mono">
            {CATALOG_META.count} solicitations · Capture Deck · Catalog &amp; lobby toolkit
          </span>
          <span className="font-mono">
            Catalog parsed {new Date(CATALOG_META.parsedAt).toLocaleDateString()}
          </span>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function HeaderLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `font-mono text-[12px] px-3 py-2 transition-colors ${
          isActive ? "text-brass" : "text-muted hover:text-mist"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
