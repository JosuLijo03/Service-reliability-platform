import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/services": "http://127.0.0.1:8000",
      "/incidents": "http://127.0.0.1:8000",
      "/alerts": "http://127.0.0.1:8000",
      "/data": "http://127.0.0.1:8000",
    },
  },
});