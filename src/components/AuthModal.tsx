import { useState } from "react";
import { useAuth } from "@/lib/supabase/AuthContext";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { configured, user, signUp, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleSignUp() {
    setBusy(true);
    setMsg(null);
    const err = await signUp(email, password);
    setMsg(err ?? "Check your email to confirm, then sign in.");
    setBusy(false);
  }

  async function handleSignIn() {
    setBusy(true);
    setMsg(null);
    const err = await signIn(email, password);
    if (!err) {
      onClose();
      setEmail("");
      setPassword("");
    } else {
      setMsg(err);
    }
    setBusy(false);
  }

  async function handleSignOut() {
    await signOut();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel w-full max-w-md shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="auth-title"
      >
        <div className="border-b border-line px-5 py-4">
          <div className="eyebrow">Account</div>
          <h2 id="auth-title" className="mt-1 font-display text-xl font-bold text-mist">
            {user ? "Signed in" : "Sign in"}
          </h2>
        </div>

        <div className="p-5">
          {!configured ? (
            <p className="text-[14px] leading-relaxed text-muted">
              Supabase is not configured. Copy{" "}
              <code className="font-mono text-[12px] text-brass">.env.example</code> to{" "}
              <code className="font-mono text-[12px] text-brass">.env.local</code> and add your
              project URL and anon key.
            </p>
          ) : user ? (
            <div className="space-y-4">
              <p className="text-[14px] text-mist">
                Welcome, <span className="text-brass">{user.email}</span>
              </p>
              <p className="text-[13px] text-muted">
                Your lobby campaign syncs to the cloud. Capture notes on the Account page.
              </p>
              <button type="button" onClick={handleSignOut} className="btn-ghost w-full py-2.5">
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-eyebrow text-faint">
                  Email
                </span>
                <input
                  type="email"
                  className="field"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-eyebrow text-faint">
                  Password
                </span>
                <input
                  type="password"
                  className="field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
              {msg && (
                <p className="text-[13px] text-muted">{msg}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy || !email || !password}
                  onClick={handleSignUp}
                  className="btn-ghost flex-1 py-2.5"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  disabled={busy || !email || !password}
                  onClick={handleSignIn}
                  className="btn-primary flex-1 py-2.5"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line px-5 py-3">
          <button type="button" onClick={onClose} className="btn-quiet text-[12px]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
