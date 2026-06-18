export interface ClaudeRequest {
  system: string;
  prompt: string;
  max_tokens?: number;
  model?: string;
}

function claudeEndpoint(): string {
  const custom = import.meta.env.VITE_CLAUDE_API_URL;
  if (custom) return custom;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/claude`;
  }

  return "/api/claude";
}

/** Call Claude through a server-side proxy so the API key never ships to the browser. */
export async function callClaude({
  system,
  prompt,
  max_tokens = 1000,
  model = "claude-sonnet-4-6",
}: ClaudeRequest): Promise<string> {
  const endpoint = claudeEndpoint();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey && !endpoint.startsWith("/api/")) {
    headers.Authorization = `Bearer ${anonKey}`;
    headers.apikey = anonKey;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ system, prompt, max_tokens, model }),
    });

    const data = (await res.json()) as { text?: string; error?: unknown };
    if (!res.ok) {
      console.error("Claude proxy error:", data.error ?? data);
      return "";
    }

    return data.text?.trim() ?? "";
  } catch (err) {
    console.error("Claude proxy request failed:", err);
    return "";
  }
}
