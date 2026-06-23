import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: import.meta.env.VITE_SERVER_PORT,
    proxy: {
      "/api": {
        target: import.meta.env.VITE_SERVER_URL,
        changeOrigin: true,
      },
    },
  },
});
