#!/usr/bin/env python3
"""
CFW BING REINDEX RUNNER
========================

Run this from Roy's terminal AFTER verifying the site in Bing Webmaster Tools.

What it does:
  1. Pulls all 273 URLs from public/sitemap.xml
  2. Submits sitemap to Bing
  3. Submits URL batches via Bing Webmaster URL Submission API
  4. Submits same batches via IndexNow
  5. Reports results

Usage:
    python3 tools/cfw-scripts/bing_reindex.py            # submit all
    python3 tools/cfw-scripts/bing_reindex.py --recent   # submit pages with lastmod >= today-7
    python3 tools/cfw-scripts/bing_reindex.py --urls=...  # comma-separated specific URLs

Quotas:
    Bing Webmaster API: 10,000 URLs/month, ~1,000/day (per BWT policy)
    IndexNow: ~10,000 URLs/day per host (Microsoft policy)
"""

import sys
import json
import re
import argparse
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timedelta

# ────────────────────────────────────────────────────────────────────────────
# CONFIG — update only if keys rotate
# ────────────────────────────────────────────────────────────────────────────
SITE = "https://chicagofleetwraps.com"
HOST = "chicagofleetwraps.com"
BING_API_KEY = "59b6acb9938a4733a1e234e858c38859"
INDEXNOW_KEY = "b1d95b588bc440689702668f937d2cc5"
INDEXNOW_KEY_LOCATION = f"{SITE}/{INDEXNOW_KEY}.txt"

# Find sitemap relative to repo root
SITEMAP_PATH = Path(__file__).resolve().parents[2] / "public" / "sitemap.xml"

# ────────────────────────────────────────────────────────────────────────────
# HTTP HELPERS
# ────────────────────────────────────────────────────────────────────────────

def post_json(url: str, payload: dict, timeout: int = 30):
    """POST JSON, return (http_status, body_text)."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "CFW-Bing-Reindex/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
    except Exception as e:
        return 0, f"EXCEPTION: {e}"


# ────────────────────────────────────────────────────────────────────────────
# SITEMAP PARSER
# ────────────────────────────────────────────────────────────────────────────

def load_sitemap_urls(only_recent_days: int = 0):
    """Return list of (url, lastmod) tuples from sitemap.xml."""
    if not SITEMAP_PATH.exists():
        print(f"❌ Sitemap not found: {SITEMAP_PATH}")
        sys.exit(1)
    text = SITEMAP_PATH.read_text(encoding="utf-8")
    pattern = re.compile(
        r"<url>\s*<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>",
        re.DOTALL,
    )
    urls = pattern.findall(text)
    if only_recent_days > 0:
        cutoff = datetime.utcnow() - timedelta(days=only_recent_days)
        urls = [(u, lm) for (u, lm) in urls
                if datetime.strptime(lm[:10], "%Y-%m-%d") >= cutoff]
    return urls


# ────────────────────────────────────────────────────────────────────────────
# SUBMISSION ROUTINES
# ────────────────────────────────────────────────────────────────────────────

def check_bing_quota():
    """Check daily/monthly URL submission quota."""
    url = f"https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota?siteUrl={SITE}/&apikey={BING_API_KEY}"
    status, body = post_json(url, {})
    print(f"📊 Bing Quota: HTTP {status}")
    print(f"   {body[:400]}")
    return status == 200


def submit_sitemap_to_bing():
    """Tell Bing to refresh its read of the sitemap."""
    url = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitFeed?apikey={BING_API_KEY}"
    payload = {"siteUrl": SITE + "/", "feedUrl": f"{SITE}/sitemap.xml"}
    status, body = post_json(url, payload)
    print(f"📨 Bing SubmitFeed (sitemap): HTTP {status}")
    print(f"   Response: {body[:300]}")
    return status == 200


def submit_urls_to_bing(urls):
    """Submit batches of up to 500 URLs each via Bing Webmaster URL Submission API."""
    BATCH = 500
    success = 0
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        url = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey={BING_API_KEY}"
        payload = {"siteUrl": SITE + "/", "urlList": chunk}
        status, body = post_json(url, payload)
        print(f"📤 Bing SubmitUrlBatch ({len(chunk)} urls): HTTP {status}")
        if status == 200:
            success += len(chunk)
        else:
            print(f"   Response: {body[:300]}")
    return success


def submit_urls_to_indexnow(urls):
    """Submit batches of up to 10,000 URLs each via IndexNow."""
    BATCH = 10000
    success = 0
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        payload = {
            "host": HOST,
            "key": INDEXNOW_KEY,
            "keyLocation": INDEXNOW_KEY_LOCATION,
            "urlList": chunk,
        }
        # Try Bing's endpoint first, then api.indexnow.org as fallback
        for endpoint in ("https://www.bing.com/indexnow",
                         "https://api.indexnow.org/IndexNow"):
            status, body = post_json(endpoint, payload)
            print(f"📤 IndexNow @ {endpoint}: HTTP {status}")
            if status in (200, 202):
                success += len(chunk)
                break
            else:
                print(f"   Response: {body[:300]}")
    return success


# ────────────────────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="CFW Bing reindex runner")
    parser.add_argument("--recent", action="store_true",
                        help="Submit only URLs updated in last 7 days")
    parser.add_argument("--days", type=int, default=7,
                        help="Day window for --recent (default 7)")
    parser.add_argument("--urls", type=str,
                        help="Comma-separated URLs to submit (overrides sitemap)")
    parser.add_argument("--skip-bing", action="store_true",
                        help="Skip Bing Webmaster API")
    parser.add_argument("--skip-indexnow", action="store_true",
                        help="Skip IndexNow")
    args = parser.parse_args()

    print("=" * 60)
    print("CFW BING REINDEX RUNNER")
    print(f"  Site: {SITE}")
    print(f"  Time: {datetime.utcnow().isoformat()}Z")
    print("=" * 60)

    if args.urls:
        url_list = [u.strip() for u in args.urls.split(",") if u.strip()]
        print(f"📋 Custom URL list: {len(url_list)} URLs\n")
    else:
        days = args.days if args.recent else 0
        sitemap_urls = load_sitemap_urls(only_recent_days=days)
        url_list = [u for (u, _) in sitemap_urls]
        scope = f"recent (last {args.days}d)" if args.recent else "full sitemap"
        print(f"📋 Loaded {len(url_list)} URLs from {scope}\n")

    if not url_list:
        print("❌ No URLs to submit.")
        sys.exit(1)

    # Bing Webmaster API
    if not args.skip_bing:
        print("\n──── BING WEBMASTER API ────")
        check_bing_quota()
        submit_sitemap_to_bing()
        bing_ok = submit_urls_to_bing(url_list)
        print(f"   ✅ Bing: {bing_ok}/{len(url_list)} URLs accepted")

    # IndexNow
    if not args.skip_indexnow:
        print("\n──── INDEXNOW ────")
        in_ok = submit_urls_to_indexnow(url_list)
        print(f"   ✅ IndexNow: {in_ok}/{len(url_list)} URLs accepted")

    print("\n" + "=" * 60)
    print("DONE.")
    print("=" * 60)
    print("\nNEXT: check https://www.bing.com/webmasters → URL Inspection")
    print("      to confirm pages are queued for crawl.")


if __name__ == "__main__":
    main()
