import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { globSync } from "glob";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const BASE_URL = "https://www.chicagofleetwraps.com";

// Redirect stub slugs — these are noindex redirect pages, not full content pages
const REDIRECT_SLUGS = new Set([
  'commercial', 'removal', 'hvac', 'plumber', 'electric', 'contractor',
  'delivery', 'foodtruck', 'landscape', 'boating', 'moving',
  'partial-wraps', 'fleet', 'brandaudit',
]);

// Collect all static HTML files
const htmlFilesRaw = globSync("**/index.html", { cwd: PUBLIC_DIR }).map((f) => ({
  slug: path.dirname(f),
  filePath: path.join(PUBLIC_DIR, f),
  html: fs.readFileSync(path.join(PUBLIC_DIR, f), "utf-8"),
}));

// Separate redirect pages from content pages
const htmlFiles = htmlFilesRaw.filter((p) => !REDIRECT_SLUGS.has(p.slug));
const redirectFiles = htmlFilesRaw.filter((p) => REDIRECT_SLUGS.has(p.slug));

// Also check standalone HTML files
const standaloneFiles = globSync("*.html", { cwd: PUBLIC_DIR })
  .filter((f) => f !== "site.html")
  .map((f) => ({
    slug: f.replace(".html", ""),
    filePath: path.join(PUBLIC_DIR, f),
    html: fs.readFileSync(path.join(PUBLIC_DIR, f), "utf-8"),
  }));

const allPages = [...htmlFiles, ...standaloneFiles];

// Read sitemap
const sitemapPath = path.join(PUBLIC_DIR, "sitemap.xml");
const sitemap = fs.existsSync(sitemapPath)
  ? fs.readFileSync(sitemapPath, "utf-8")
  : "";

// Collect all internal links from all pages
function extractInternalLinks(html: string): string[] {
  const matches = html.matchAll(/href="(\/[^"]*?)"/g);
  return [...matches].map((m) => m[1]);
}

// Collect all image src from all pages
function extractImageSrcs(html: string): string[] {
  const matches = html.matchAll(/src="(\/images\/[^"]*?)"/g);
  return [...matches].map((m) => m[1]);
}

describe("Full SEO Audit — All Static HTML Pages", () => {
  describe("Meta Tags", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has <title> tag",
      (_slug, page) => {
        expect(page.html).toMatch(/<title>.+<\/title>/);
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has meta description",
      (_slug, page) => {
        expect(page.html).toContain('name="description"');
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has canonical URL with www",
      (_slug, page) => {
        expect(page.html).toContain('rel="canonical"');
        const canonicalMatch = page.html.match(
          /rel="canonical"\s+href="([^"]+)"/
        );
        if (canonicalMatch) {
          expect(canonicalMatch[1]).toContain("www.chicagofleetwraps.com");
        }
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has og:title",
      (_slug, page) => {
        expect(page.html).toContain('property="og:title"');
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has og:type",
      (_slug, page) => {
        expect(page.html).toContain('property="og:type"');
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has og:url",
      (_slug, page) => {
        expect(page.html).toContain('property="og:url"');
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has twitter:card",
      (_slug, page) => {
        expect(page.html).toContain('name="twitter:card"');
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has lang=en",
      (_slug, page) => {
        expect(page.html).toContain('lang="en"');
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has viewport meta",
      (_slug, page) => {
        expect(page.html).toContain('name="viewport"');
      }
    );
  });

  describe("Schema / JSON-LD", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has at least one JSON-LD block",
      (_slug, page) => {
        expect(page.html).toContain("application/ld+json");
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s JSON-LD is valid JSON",
      (_slug, page) => {
        const jsonLdBlocks = page.html.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
        );
        for (const match of jsonLdBlocks) {
          expect(() => JSON.parse(match[1])).not.toThrow();
        }
      }
    );
  });

  describe("Heading Hierarchy", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has exactly one <h1>",
      (_slug, page) => {
        const h1Count = (page.html.match(/<h1[\s>]/g) || []).length;
        expect(h1Count).toBe(1);
      }
    );
  });

  describe("Canonical URL Consistency", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s canonical matches og:url",
      (_slug, page) => {
        const canonical = page.html.match(
          /rel="canonical"\s+href="([^"]+)"/
        );
        const ogUrl = page.html.match(
          /property="og:url"\s+content="([^"]+)"/
        );
        if (canonical && ogUrl) {
          expect(canonical[1]).toBe(ogUrl[1]);
        }
      }
    );

    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s canonical ends with trailing slash",
      (_slug, page) => {
        const canonical = page.html.match(
          /rel="canonical"\s+href="([^"]+)"/
        );
        if (canonical) {
          expect(canonical[1]).toMatch(/\/$/);
        }
      }
    );
  });

  describe("Image Alt Text", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s all <img> have alt attributes",
      (_slug, page) => {
        const imgs = page.html.matchAll(/<img\s[^>]*>/g);
        for (const img of imgs) {
          expect(img[0]).toContain("alt=");
        }
      }
    );
  });

  describe("Broken Internal Links", () => {
    // Collect all internal link targets
    const allSlugs = new Set<string>();
    for (const page of htmlFiles) {
      allSlugs.add(`/${page.slug}/`);
    }
    // Add root
    allSlugs.add("/");
    // Standalone pages
    for (const page of standaloneFiles) {
      allSlugs.add(`/${page.slug}.html`);
    }

    // Known routes that exist in SPA but not as static files
    const spaOnlyRoutes = new Set(["/transit/"]);

    it("all internal page links resolve to existing static pages or known SPA routes", () => {
      const brokenLinks: { page: string; link: string }[] = [];
      for (const page of htmlFiles) {
        const links = extractInternalLinks(page.html);
        for (const link of links) {
          // Skip anchors, tel:, mailto:, external
          if (
            link.startsWith("/#") ||
            link.startsWith("/images/") ||
            link.startsWith("/css/") ||
            link === "/"
          )
            continue;
          // Strip query parameters before checking
          const cleanLink = link.split('?')[0];
          // Normalize: ensure trailing slash
          const normalized = cleanLink.endsWith("/") ? cleanLink : cleanLink + "/";
          if (
            !allSlugs.has(normalized) &&
            !allSlugs.has(link) &&
            !spaOnlyRoutes.has(normalized)
          ) {
            brokenLinks.push({ page: page.slug, link });
          }
        }
      }
      if (brokenLinks.length > 0) {
        console.warn(
          "Broken internal links found:",
          JSON.stringify(brokenLinks, null, 2)
        );
      }
      // We just log — set threshold at 0 for strict enforcement
      expect(brokenLinks.length).toBe(0);
    });
  });

  describe("Broken Image References", () => {
    it("all image srcs reference existing files", () => {
      const brokenImages: { page: string; src: string }[] = [];
      for (const page of allPages) {
        const srcs = extractImageSrcs(page.html);
        for (const src of srcs) {
          const imgPath = path.join(PUBLIC_DIR, src);
          if (!fs.existsSync(imgPath)) {
            brokenImages.push({ page: page.slug, src });
          }
        }
      }
      if (brokenImages.length > 0) {
        console.warn(
          "Broken image references:",
          JSON.stringify(brokenImages, null, 2)
        );
      }
      expect(brokenImages.length).toBe(0);
    });
  });

  describe("Sitemap Coverage", () => {
    it("all static HTML pages are in sitemap.xml", () => {
      const missingSitemap: string[] = [];
      for (const page of htmlFiles) {
        const expectedUrl = `${BASE_URL}/${page.slug}/`;
        if (!sitemap.includes(expectedUrl)) {
          missingSitemap.push(expectedUrl);
        }
      }
      if (missingSitemap.length > 0) {
        console.warn("Pages missing from sitemap:", missingSitemap);
      }
      expect(missingSitemap.length).toBe(0);
    });
  });

  describe("No noindex on indexable pages", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s does not have noindex",
      (_slug, page) => {
        expect(page.html).not.toContain("noindex");
      }
    );
  });

  describe("OG Image", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s has og:image",
      (_slug, page) => {
        expect(page.html).toContain('property="og:image"');
      }
    );
  });

  describe("Title Length", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s title is under 70 characters",
      (_slug, page) => {
        const titleMatch = page.html.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          expect(titleMatch[1].length).toBeLessThanOrEqual(70);
        }
      }
    );
  });

  describe("Meta Description Length", () => {
    it.each(htmlFiles.map((p) => [p.slug, p]))(
      "%s meta description is under 170 characters",
      (_slug, page) => {
        const descMatch = page.html.match(
          /name="description"\s+content="([^"]+)"/
        );
        if (descMatch) {
          expect(descMatch[1].length).toBeLessThanOrEqual(170);
        }
      }
    );
  });
});
