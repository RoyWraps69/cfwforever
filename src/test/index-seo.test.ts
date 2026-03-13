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

  it("does NOT contain SPA shell artifacts", () => {
    expect(indexHtml).not.toContain('id="root"');
    expect(indexHtml).not.toContain('src="/src/main.tsx"');
    expect(indexHtml).not.toContain("var PAGE_META");
    expect(indexHtml).not.toContain("function updateSEO");
    expect(indexHtml).not.toContain("history.pushState");
  });
});

describe("Static HTML Architecture", () => {
  it("subpages exist as independent HTML files", () => {
    const requiredPages = [
      "public/commercial/index.html",
      "public/fleet/index.html",
      "public/contact/index.html",
      "public/blog/index.html",
      "public/estimate/index.html",
      "public/faq/index.html",
      "public/ev-wraps/index.html",
      "public/care/index.html",
    ];
    for (const page of requiredPages) {
      const fullPath = path.resolve(__dirname, "../../", page);
      expect(fs.existsSync(fullPath), `${page} should exist`).toBe(true);
    }
  });

  it("city pages exist as independent HTML files", () => {
    const cityPages = [
      "public/chicago/index.html",
      "public/schaumburg/index.html",
      "public/naperville/index.html",
      "public/evanston/index.html",
      "public/aurora/index.html",
    ];
    for (const page of cityPages) {
      const fullPath = path.resolve(__dirname, "../../", page);
      expect(fs.existsSync(fullPath), `${page} should exist`).toBe(true);
    }
  });

  it("each subpage has its own canonical tag (not homepage)", () => {
    const commercial = fs.readFileSync(path.resolve(__dirname, "../../public/commercial/index.html"), "utf-8");
    expect(commercial).toContain('rel="canonical"');
    expect(commercial).not.toContain('href="https://www.chicagofleetwraps.com/"');
  });

  it("404 page exists with noindex", () => {
    const notFound = fs.readFileSync(path.resolve(__dirname, "../../public/404.html"), "utf-8");
    expect(notFound).toContain("noindex");
    expect(notFound).toContain("404");
  });
});
