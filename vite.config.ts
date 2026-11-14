import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Keep framework and backend SDK code in stable hashed chunks across deployments.
// Route pages, media galleries and training modules stay automatically split by React.lazy.
export default defineConfig(() => ({
  server: { host: "::", port: 8080 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const file = id.replaceAll("\\", "/");
          if (!file.includes("/node_modules/")) return;
          if (/\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react|react-dom|scheduler)\//.test(file)) return "framework";
          if (/\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?@supabase\//.test(file)) return "backend-sdk";
        },
      },
    },
  },
}));
