import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file from main folder
  const envDir = path.resolve(__dirname, "../");

  return {
    root: __dirname,
    plugins: [react()],
    server: {
      port: 3001,
      host: true,
      allowedHosts: ["localhost", ".trycloudflare.com"],
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@Assets": path.resolve(__dirname, "src/Assets"),
        "@Components": path.resolve(__dirname, "src/Components"),
        "@Pages": path.resolve(__dirname, "src/Pages"),
        "@Hooks": path.resolve(__dirname, "src/Hooks"),
        "@Utilities": path.resolve(__dirname, "src/Utilities"),
        "@Services": path.resolve(__dirname, "src/Services"),
        "@Providers": path.resolve(__dirname, "src/Providers")
      }
    },
    envDir: envDir,
    optimizeDeps: {
      include: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"]
    }
  };
});
