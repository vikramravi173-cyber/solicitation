import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    client = new Anthropic({ apiKey });
  }

  return client;
}

export async function askClaudeJson<T>(prompt: string, maxTokens = 4096): Promise<T> {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }

  const trimmed = textBlock.text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  return JSON.parse(jsonText) as T;
}

export async function askClaudeText(prompt: string, maxTokens = 4096): Promise<string> {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }

  return textBlock.text.trim();
}
