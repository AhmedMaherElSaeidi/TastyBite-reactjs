import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // load .env variables
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || 3000,
      proxy: {
        "/api": {
          target: env.VITE_SERVER_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
