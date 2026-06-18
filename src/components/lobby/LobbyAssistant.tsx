import { useState, useRef, useEffect } from "react";
import { useLobby } from "@/lib/lobby/context";
import { ASSISTANT_SUGGESTIONS, getAssistantReply } from "@/lib/lobby/assistant";
import type { ChatMessage } from "@/lib/lobby/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm your DIY Lobby Assistant. I can walk you through outreach checklists, NDAA timelines, regional talking points, submission tracking, and staff email best practices.\n\nEverything runs in your browser — your campaign data never leaves this device.\n\n_A future version can plug into an LLM API for personalized drafting._",
  timestamp: new Date().toISOString(),
};

export function LobbyAssistant() {
  const { campaign } = useLobby();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate brief processing — swap for API call in future
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getAssistantReply(campaign, trimmed),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
    }, 400);
  }

  return (
    <div className="panel flex h-[min(640px,calc(100vh-280px))] flex-col overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="eyebrow">Interactive assistant</div>
        <h3 className="mt-1 font-display text-lg font-bold text-mist">Lobby agent</h3>
        <p className="mt-1 text-[13px] text-muted">
          Rule-based guidance today — structured for LLM integration tomorrow.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brass/15 text-mist border border-brass/30"
                    : "bg-panel-2 text-muted border border-line"
                }`}
              >
                <p className="whitespace-pre-wrap">{formatAssistantText(msg.content)}</p>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="border border-line bg-panel-2 px-4 py-3">
                <span className="font-mono text-[12px] text-faint animate-pulse">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-line px-5 py-3 sm:px-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {ASSISTANT_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => send(s.prompt)}
              disabled={thinking}
              className="btn-ghost !py-1.5 !px-3 text-[11px] disabled:opacity-40"
            >
              {s.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            className="field flex-1 !py-2.5"
            placeholder="Ask about outreach, timelines, talking points…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={thinking}
          />
          <button type="submit" disabled={thinking || !input.trim()} className="btn-primary !px-4">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

/** Lightweight markdown-ish formatting for assistant replies */
function formatAssistantText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-mist">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <em key={i} className="text-faint">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
