import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Site Navigation Structure", () => {
  const siteHtml = fs.readFileSync(
    path.resolve(__dirname, "../../public/site.html"),
    "utf-8"
  );

  it("has sticky header", () => {
    expect(siteHtml).toContain("position:sticky");
  });

  it("header allows dropdown overflow", () => {
    // Both header and hbar should have overflow:visible for dropdowns
    expect(siteHtml).toMatch(/header\{[^}]*overflow:visible/);
    expect(siteHtml).toMatch(/\.hbar\{[^}]*overflow:visible/);
  });

  it("has all service dropdown links", () => {
    expect(siteHtml).toContain("go('commercial')");
    expect(siteHtml).toContain("go('boxtruck')");
    expect(siteHtml).toContain("go('sprinter')");
    expect(siteHtml).toContain("go('transit')");
    expect(siteHtml).toContain("go('colorchange')");
  });

  it("has all industry dropdown links", () => {
    expect(siteHtml).toContain("go('hvac')");
    expect(siteHtml).toContain("go('plumber')");
    expect(siteHtml).toContain("go('electric')");
    expect(siteHtml).toContain("go('contractor')");
    expect(siteHtml).toContain("go('delivery')");
  });

  it("has tool dropdown links", () => {
    expect(siteHtml).toContain("go('visualizer')");
    expect(siteHtml).toContain("go('brandaudit')");
    expect(siteHtml).toContain("go('calculator')");
    expect(siteHtml).toContain("go('beforeafter')");
  });

  it("has city dropdown links", () => {
    expect(siteHtml).toContain("go('geo-chicago')");
    expect(siteHtml).toContain("go('geo-schaumburg')");
    expect(siteHtml).toContain("go('geo-naperville')");
  });

  it("logo navigates to home", () => {
    expect(siteHtml).toContain("go('home')");
  });

  it("has mobile hamburger menu", () => {
    expect(siteHtml).toContain("hambtn");
    expect(siteHtml).toContain("mnav");
  });

  it("has phone number in header", () => {
    expect(siteHtml).toContain("tel:+13125971286");
    expect(siteHtml).toContain("(312) 597-1286");
  });

  it("has Get Estimate CTA button", () => {
    expect(siteHtml).toContain("go('estimate')");
    expect(siteHtml).toContain("Get Estimate");
  });
});

describe("Page Content Integrity", () => {
  const siteHtml = fs.readFileSync(
    path.resolve(__dirname, "../../public/site.html"),
    "utf-8"
  );

  it("has hero section", () => {
    expect(siteHtml).toContain('class="hero"');
    expect(siteHtml).toContain("Revenue Machine");
  });

  it("has trust ribbon", () => {
    expect(siteHtml).toContain('class="trib"');
    expect(siteHtml).toContain("CERTIFIED INSTALLER");
  });

  it("has footer with NAP", () => {
    expect(siteHtml).toContain("4711 N. Lamon Ave");
    expect(siteHtml).toContain("Chicago, IL 60630");
  });

  it("has social media links", () => {
    expect(siteHtml).toContain("facebook.com/chicagofleetwraps");
    expect(siteHtml).toContain("instagram.com/chicagofleetwraps");
  });

  it("home navigation reloads page", () => {
    expect(siteHtml).toContain("if(slug === 'home'){ window.location.reload()");
  });

  it("has PAGES object with service pages", () => {
    expect(siteHtml).toContain('var PAGES');
    expect(siteHtml).toContain('"commercial"');
    expect(siteHtml).toContain('"boxtruck"');
  });

  it("has Coming Soon fallback for undefined pages", () => {
    expect(siteHtml).toContain("Coming Soon");
  });
});