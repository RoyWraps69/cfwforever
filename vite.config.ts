import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { globSync } from "glob";

// Strip redirect scripts from all static HTML files on startup
// These redirects cause Google to see cloaking and refuse to index pages
function stripRedirectsPlugin() {
  return {
    name: 'strip-redirects',
    buildStart() {
      const publicDir = path.resolve(__dirname, 'public');
      const htmlFiles = globSync('**/*.html', { cwd: publicDir });
      let stripped = 0;
      for (const file of htmlFiles) {
        const fp = path.join(publicDir, file);
        let html = fs.readFileSync(fp, 'utf-8');
        const original = html;
        // Pattern A: multi-line with replaceState
        html = html.replace(/<script>\s*if\s*\(\s*window\.history[\s\S]*?route[\s\S]*?<\/script>/gi, '');
        // Pattern B: single-line with bot detection
        html = html.replace(/<script>[^<]*?(?:bot|crawl|spider)[^<]*?route[^<]*?<\/script>/gi, '');
        if (html !== original) {
          fs.writeFileSync(fp, html, 'utf-8');
          stripped++;
        }
      }
      if (stripped > 0) {
        console.log(`🧹 Stripped redirect scripts from ${stripped} HTML files`);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    stripRedirectsPlugin(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
