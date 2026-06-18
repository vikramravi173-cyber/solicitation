import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { claudeProxyPlugin } from "./vite-plugin-claude-proxy";

// GitHub Pages project sites live under /<repo>/; CI sets VITE_BASE_PATH for that.
// Local `npm run build && npm run preview` defaults to "/" so assets resolve.
const BUILD_BASE = process.env.VITE_BASE_PATH || "/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? BUILD_BASE : "/",
  plugins: [react(), claudeProxyPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
    },
  },
}));
