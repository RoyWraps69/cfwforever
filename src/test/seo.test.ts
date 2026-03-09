import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("SEO Static Files", () => {
  const publicDir = path.resolve(__dirname, "../../public");

  describe("sitemap.xml", () => {
    const sitemap = fs.readFileSync(path.join(publicDir, "sitemap.xml"), "utf-8");

    it("exists and is valid XML", () => {
      expect(sitemap).toContain('<?xml version="1.0"');
      expect(sitemap).toContain("<urlset");
    });

    it("contains homepage URL", () => {
      expect(sitemap).toContain("https://www.chicagofleetwraps.com/");
    });

    it("contains service pages", () => {
      expect(sitemap).toContain("/commercial/");
      expect(sitemap).toContain("/boxtruck/");
      expect(sitemap).toContain("/sprinter/");
    });

    it("contains city/geo pages", () => {
      expect(sitemap).toContain("/chicago/");
      expect(sitemap).toContain("/schaumburg/");
      expect(sitemap).toContain("/naperville/");
    });

    it("contains tool pages", () => {
      expect(sitemap).toContain("/visualizer/");
      expect(sitemap).toContain("/calculator/");
      expect(sitemap).toContain("/brandaudit/");
    });

    it("has lastmod dates", () => {
      expect(sitemap).toContain("<lastmod>");
    });

    it("has image sitemap namespace", () => {
      expect(sitemap).toContain("xmlns:image");
    });

    it("contains expanded city pages", () => {
      expect(sitemap).toContain("/arlington-heights/");
      expect(sitemap).toContain("/bolingbrook/");
      expect(sitemap).toContain("/tinley-park/");
    });
  });

  describe("robots.txt", () => {
    const robots = fs.readFileSync(path.join(publicDir, "robots.txt"), "utf-8");

    it("allows Googlebot", () => {
      expect(robots).toContain("User-agent: Googlebot");
      expect(robots).toContain("Allow: /");
    });

    it("allows AI crawlers", () => {
      expect(robots).toContain("GPTBot");
      expect(robots).toContain("ClaudeBot");
      expect(robots).toContain("PerplexityBot");
      expect(robots).toContain("Applebot");
      expect(robots).toContain("cohere-ai");
      expect(robots).toContain("Meta-ExternalAgent");
    });

    it("allows social crawlers", () => {
      expect(robots).toContain("LinkedInBot");
      expect(robots).toContain("Discordbot");
      expect(robots).toContain("WhatsApp");
    });

    it("references sitemap", () => {
      expect(robots).toContain("Sitemap: https://www.chicagofleetwraps.com/sitemap.xml");
    });

    it("references llms.txt", () => {
      expect(robots).toContain("llms.txt");
    });

    it("blocks sensitive paths", () => {
      expect(robots).toContain("Disallow: /api/");
      expect(robots).toContain("Disallow: /admin/");
    });
  });

  describe("llms.txt", () => {
    const llms = fs.readFileSync(path.join(publicDir, "llms.txt"), "utf-8");

    it("contains business name", () => {
      expect(llms).toContain("Chicago Fleet Wraps");
    });

    it("contains contact info", () => {
      expect(llms).toContain("(312) 597-1286");
      expect(llms).toContain("roy@chicagofleetwraps.com");
    });

    it("contains services list", () => {
      expect(llms).toContain("Commercial Fleet Wraps");
      expect(llms).toContain("Box Truck Wraps");
      expect(llms).toContain("Sprinter Van Wraps");
    });

    it("contains pricing info", () => {
      expect(llms).toContain("$3,150");
      expect(llms).toContain("$3,700");
    });

    it("contains service area info", () => {
      expect(llms).toContain("75+ cities");
      expect(llms).toContain("Chicagoland");
    });
  });
});

describe("site.html SEO Elements", () => {
  const siteHtml = fs.readFileSync(path.resolve(__dirname, "../../public/site.html"), "utf-8");

  it("has correct title tag", () => {
    expect(siteHtml).toContain("<title>Chicago Fleet Wraps");
  });

  it("has meta description", () => {
    expect(siteHtml).toContain('name="description"');
    expect(siteHtml).toContain("highest-rated commercial fleet wrap");
  });

  it("has Open Graph tags", () => {
    expect(siteHtml).toContain('property="og:title"');
    expect(siteHtml).toContain('property="og:description"');
    expect(siteHtml).toContain('property="og:type"');
  });

  it("has canonical URL", () => {
    expect(siteHtml).toContain('rel="canonical"');
    expect(siteHtml).toContain("https://www.chicagofleetwraps.com/");
  });

  it("has JSON-LD LocalBusiness schema", () => {
    expect(siteHtml).toContain('"@type": "LocalBusiness"');
    expect(siteHtml).toContain('"telephone": "+1-312-597-1286"');
  });

  it("has JSON-LD FAQPage schema", () => {
    expect(siteHtml).toContain('"@type": "FAQPage"');
  });

  it("has geo meta tags", () => {
    expect(siteHtml).toContain('name="geo.region"');
    expect(siteHtml).toContain("US-IL");
  });

  it("has Twitter card meta", () => {
    expect(siteHtml).toContain('name="twitter:card"');
  });

  it("has AEO blocks on homepage", () => {
    expect(siteHtml).toContain("How much does a fleet wrap cost in Chicago?");
    expect(siteHtml).toContain("Are vehicle wraps worth it for small businesses?");
  });

  it("has E-E-A-T founder section", () => {
    expect(siteHtml).toContain("Meet the Owner");
    expect(siteHtml).toContain("Roy — Founder");
  });
});

describe("Accessibility", () => {
  const siteHtml = fs.readFileSync(path.resolve(__dirname, "../../public/site.html"), "utf-8");
  const css = fs.readFileSync(path.resolve(__dirname, "../../public/css/site.css"), "utf-8");

  it("has skip navigation link", () => {
    expect(siteHtml).toContain("skip-nav");
    expect(siteHtml).toContain("Skip to main content");
  });

  it("has ARIA landmarks", () => {
    expect(siteHtml).toContain('role="banner"');
    expect(siteHtml).toContain('role="main"');
    expect(siteHtml).toContain('role="contentinfo"');
    expect(siteHtml).toContain('role="navigation"');
  });

  it("has ARIA labels on hamburger menu", () => {
    expect(siteHtml).toContain('aria-label="Open menu"');
    expect(siteHtml).toContain('aria-expanded=');
    expect(siteHtml).toContain('aria-controls="mnav"');
  });

  it("has focus-visible styles in CSS", () => {
    expect(css).toContain("focus-visible");
  });

  it("has reduced motion support", () => {
    expect(css).toContain("prefers-reduced-motion");
  });

  it("has touch target sizing for mobile", () => {
    expect(css).toContain("pointer:coarse");
    expect(css).toContain("min-height:44px");
  });

  it("has print styles", () => {
    expect(css).toContain("@media print");
  });

  it("has lang attribute on html", () => {
    expect(siteHtml).toContain('lang="en"');
  });
});

describe("Font Loading Optimization", () => {
  const siteHtml = fs.readFileSync(path.resolve(__dirname, "../../public/site.html"), "utf-8");

  it("preloads critical font weights", () => {
    expect(siteHtml).toContain('rel="preload"');
    expect(siteHtml).toContain('as="style"');
  });

  it("has font-display swap", () => {
    expect(siteHtml).toContain("display=swap");
  });

  it("has preconnect to font origins", () => {
    expect(siteHtml).toContain('rel="preconnect"');
    expect(siteHtml).toContain("fonts.googleapis.com");
    expect(siteHtml).toContain("fonts.gstatic.com");
  });

  it("has noscript fallback for fonts", () => {
    expect(siteHtml).toContain("<noscript>");
  });
});