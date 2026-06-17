import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages serves project sites under /<repo>/. The base is applied only
// for production builds so local dev stays at "/".
const REPO_BASE = "/solicitation/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? REPO_BASE : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
    },
  },
}));
