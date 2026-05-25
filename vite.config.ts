import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { adminApiPlugin } from "./scripts/vite-admin-api.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), adminApiPlugin(env)],
    server: { port: 5173, host: "127.0.0.1" },
  };
});
