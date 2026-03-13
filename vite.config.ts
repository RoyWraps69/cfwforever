import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import gmbInjectPlugin from "./scripts/vite-gmb-inject";

// Middleware to serve static HTML files from public/ for subpath routes
function staticHtmlMiddleware() {
  return {
    name: "static-html-middleware",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split("?")[0] || "/";
        if (url === "/" || url.includes(".")) return next();
        
        // Try public/<path>/index.html
        const cleanPath = url.endsWith("/") ? url : url + "/";
        const filePath = path.resolve(__dirname, "public" + cleanPath + "index.html");
        
        if (fs.existsSync(filePath)) {
          res.setHeader("Content-Type", "text/html");
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  appType: "mpa",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    staticHtmlMiddleware(),
    gmbInjectPlugin(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
