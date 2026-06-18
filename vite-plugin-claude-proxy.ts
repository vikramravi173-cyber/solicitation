import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { loadEnv } from "vite";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function proxyToAnthropic(
  apiKey: string,
  body: string,
  res: ServerResponse,
): Promise<void> {
  const { system, prompt, max_tokens = 1000, model = "claude-sonnet-4-6" } = JSON.parse(body) as {
    system: string;
    prompt: string;
    max_tokens?: number;
    model?: string;
  };

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = (await upstream.json()) as {
    content?: Array<{ type: string; text?: string }>;
    error?: unknown;
  };

  if (!upstream.ok) {
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: data.error ?? data }));
    return;
  }

  const text =
    data.content?.find((block) => block.type === "text")?.text?.trim() ?? "";

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ text }));
}

/** Dev-only proxy: POST /api/claude → Anthropic (uses ANTHROPIC_API_KEY from .env.local). */
export function claudeProxyPlugin(): Plugin {
  return {
    name: "claude-proxy",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/claude")) {
          next();
          return;
        }

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }

        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error:
                "ANTHROPIC_API_KEY is not set. Add it to .env.local for local dev.",
            }),
          );
          return;
        }

        try {
          const body = await readBody(req);
          await proxyToAnthropic(apiKey, body, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}
