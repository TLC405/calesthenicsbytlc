import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "node:fs";

// Keep framework and backend SDK code in stable hashed chunks across deployments.
// Route pages, media galleries and training modules stay automatically split by React.lazy.
export default defineConfig(() => ({
  server: { host: "::", port: 8080 },
  plugins: [react(),{
    name:'tlc-independent-boot-recovery',
    transformIndexHtml:{order:'pre',handler(html){return html.replace('<!-- TLC_BOOTSTRAP -->','<script>'+readFileSync('public/power-boot.js','utf8').replace(/<\/script/gi,'<\\/script')+'</script>');}},
  }],
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
