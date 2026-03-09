import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("index.html — Primary Entry Point", () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf-8");

  it("contains full site content (not an iframe wrapper)", () => {
    expect(indexHtml).not.toContain('src="/site.html"');
    expect(indexHtml).toContain('id="out"');
  });

  it("has correct title tag", () => {
    expect(indexHtml).toContain("<title>Chicago Fleet Wraps");
  });

  it("has meta description", () => {
    expect(indexHtml).toContain('name="description"');
    expect(indexHtml).toContain("highest-rated commercial fleet wrap");
  });

  it("has canonical URL", () => {
    expect(indexHtml).toContain('rel="canonical"');
    expect(indexHtml).toContain("https://www.chicagofleetwraps.com/");
  });

  it("has Open Graph tags", () => {
    expect(indexHtml).toContain('property="og:title"');
    expect(indexHtml).toContain('property="og:description"');
    expect(indexHtml).toContain('property="og:type"');
  });

  it("has JSON-LD LocalBusiness schema", () => {
    expect(indexHtml).toContain('"@type": "LocalBusiness"');
    expect(indexHtml).toContain('"telephone": "+1-312-597-1286"');
  });

  it("has JSON-LD FAQPage schema", () => {
    expect(indexHtml).toContain('"@type": "FAQPage"');
  });

  it("has geo meta tags", () => {
    expect(indexHtml).toContain('name="geo.region"');
    expect(indexHtml).toContain("US-IL");
  });

  it("has Vite script tag for build pipeline", () => {
    expect(indexHtml).toContain('src="/src/main.tsx"');
  });

  it("has hidden React root div", () => {
    expect(indexHtml).toContain('id="root"');
  });
});

describe("Dynamic SEO System", () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf-8");

  it("has PAGE_META object with per-page metadata", () => {
    expect(indexHtml).toContain("var PAGE_META");
  });

  it("has updateSEO function", () => {
    expect(indexHtml).toContain("function updateSEO");
  });

  it("has metadata for all service pages", () => {
    expect(indexHtml).toContain("'commercial':");
    expect(indexHtml).toContain("'boxtruck':");
    expect(indexHtml).toContain("'sprinter':");
    expect(indexHtml).toContain("'transit':");
    expect(indexHtml).toContain("'colorchange':");
    expect(indexHtml).toContain("'ev':");
  });

  it("has metadata for blog posts", () => {
    expect(indexHtml).toContain("'post-downside-wrapping':");
    expect(indexHtml).toContain("'post-3m-vs-avery':");
    expect(indexHtml).toContain("'post-wrap-cost':");
  });

  it("has metadata for city pages", () => {
    expect(indexHtml).toContain("'geo-chicago':");
    expect(indexHtml).toContain("'geo-schaumburg':");
    expect(indexHtml).toContain("'geo-naperville':");
  });

  it("updateSEO updates canonical tag", () => {
    expect(indexHtml).toContain('link[rel="canonical"]');
    expect(indexHtml).toContain("link.rel = 'canonical'");
    expect(indexHtml).toContain("https://chicagofleetwraps.com");
  });

  it("updateSEO updates OG tags", () => {
    expect(indexHtml).toContain('meta[property="og:title"]');
    expect(indexHtml).toContain('meta[property="og:description"]');
    expect(indexHtml).toContain('meta[property="og:url"]');
  });

  it("uses pushState for URL routing", () => {
    expect(indexHtml).toContain("history.pushState");
  });

  it("calls updateSEO before pushState", () => {
    // updateSEO should be called in go() before pushState
    const updateIdx = indexHtml.indexOf("updateSEO(slug)");
    const pushIdx = indexHtml.indexOf("history.pushState");
    expect(updateIdx).toBeLessThan(pushIdx);
    expect(updateIdx).toBeGreaterThan(0);
  });
});

describe("URL Routing", () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf-8");

  it("has DOMContentLoaded URL routing", () => {
    expect(indexHtml).toContain("window.location.pathname");
    expect(indexHtml).toContain("DOMContentLoaded");
  });

  it("has popstate handler for back/forward", () => {
    expect(indexHtml).toContain("popstate");
  });

  it("has legacy URL aliases", () => {
    expect(indexHtml).toContain("'colorchangewraps': 'colorchange'");
    expect(indexHtml).toContain("'commercialwraps': 'commercial'");
    expect(indexHtml).toContain("'about-1': 'about'");
    expect(indexHtml).toContain("'faq-s': 'faq'");
  });

  it("has blog post aliases", () => {
    expect(indexHtml).toContain("'post/what-is-the-downside-of-wrapping-a-car': 'post-downside-wrapping'");
    expect(indexHtml).toContain("'post/3m-vs-avery-dennison-vehicle-wraps': 'post-3m-vs-avery'");
  });
});
