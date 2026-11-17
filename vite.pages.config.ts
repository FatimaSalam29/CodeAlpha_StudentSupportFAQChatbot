// Static single-page build of the chatbot for GitHub Pages (no server needed).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "pages"),
  base: "/CodeAlpha_StudentSupportFAQChatbot/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { outDir: path.resolve(__dirname, "dist-pages"), emptyOutDir: true },
});
