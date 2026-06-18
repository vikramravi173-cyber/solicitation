import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/supabase/AuthContext";
import { addNote, deleteNote, fetchNotes, type Note } from "@/lib/supabase/notes";

export function AccountPage() {
  const { configured, user, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    try {
      setNotes(await fetchNotes());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notes.");
    }
  }, [user]);

  useEffect(() => {
    if (user) loadNotes();
  }, [user, loadNotes]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setBusy(true);
    try {
      await addNote(content);
      setInput("");
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add note.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete note.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-deck px-5 py-12">
        <p className="font-mono text-[13px] text-faint">Loading session…</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-deck px-5 py-12">
        <div className="eyebrow">Account</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-mist">Cloud sync</h1>
        <p className="mt-3 max-w-prose text-[15px] text-muted">
          Add <code className="font-mono text-[13px] text-brass">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-[13px] text-brass">VITE_SUPABASE_ANON_KEY</code> to{" "}
          <code className="font-mono text-[13px] text-brass">.env.local</code>, then run the SQL in{" "}
          <code className="font-mono text-[13px] text-brass">supabase/schema.sql</code>.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-deck px-5 py-12">
        <div className="eyebrow">Account</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-mist">Sign in required</h1>
        <p className="mt-3 text-[15px] text-muted">
          Notes and your lobby campaign sync when signed in. The lobby toolkit requires an
          account — use <strong className="text-mist">Sign in</strong> in the header or visit{" "}
          <Link to="/lobby" className="text-brass hover:text-brass-bright">
            /lobby
          </Link>
          .
        </p>
        <Link to="/" className="btn-ghost mt-6 inline-flex py-2.5">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-deck px-5 py-12">
      <header className="max-w-2xl">
        <div className="eyebrow">Account</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-mist">
          Welcome, {user.email}
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Notes and your lobby campaign sync to your Supabase project. The lobby toolkit is only
          available when signed in.
        </p>
      </header>

      <section className="panel mt-10 max-w-2xl overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold text-mist">Your notes</h2>
        </div>
        <div className="p-5">
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="New note…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary px-4">
              Add
            </button>
          </form>
          {error && <p className="mt-3 text-[13px] text-fit-low">{error}</p>}
          <ul className="mt-6 divide-y divide-line">
            {notes.length === 0 ? (
              <li className="py-3 text-[13px] text-faint">No notes yet.</li>
            ) : (
              notes.map((note) => (
                <li key={note.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-[14px] text-mist">{note.content}</p>
                    <p className="mt-1 font-mono text-[11px] text-faint">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="btn-quiet shrink-0 text-[11px] text-fit-low"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
