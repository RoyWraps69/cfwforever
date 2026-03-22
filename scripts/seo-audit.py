#!/usr/bin/env python3
"""
SEO Audit Script — Chicago Fleet Wraps
Runs as a Netlify build check. Exits with code 1 if any issues are found.

Checks:
  1. Duplicate heading text within a single page (h1-h4)
  2. Excess <strong> tags (>26 per page)
  3. Title keywords missing from H1

Usage:
  python3 scripts/seo-audit.py [--warn-only]

  --warn-only   Print issues but exit 0 (don't fail the build)
"""

import re
import os
import sys
from collections import Counter
from pathlib import Path

# ── Configuration ──────────────────────────────────────────────────────────────

PUBLIC_DIR = Path(__file__).parent.parent / "public"

# Pages to skip entirely (templates, not real crawlable pages)
SKIP_FILES = {
    "site.html",
}

# Pages where title/H1 mismatch is expected/acceptable
SKIP_TITLE_H1 = {
    "site.html",
}

MAX_STRONG_TAGS = 26

# Words too generic to flag as title/H1 mismatches
STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "your", "our", "we", "you", "it", "its", "this", "that", "these",
    "those", "as", "if", "how", "what", "when", "where", "why", "which",
    "do", "does", "did", "will", "can", "may", "should", "would", "could",
    "vs", "amp", "ndash", "mdash", "–", "—", "&", "|",
    # Site-specific generic words that appear in many titles but not H1s
    "chicago", "fleet", "wraps", "wrap", "il",
    # Brand abbreviations and short tokens not meaningful for H1 alignment
    "cfw", "roi", "bay", "day", "400", "250", "100", "200", "300",
}

# ── Helpers ────────────────────────────────────────────────────────────────────

def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", "", html)

def normalize(text: str) -> str:
    """Lowercase, strip tags, collapse whitespace."""
    return re.sub(r"\s+", " ", strip_tags(text)).strip().lower()

def title_keywords(title_text: str) -> set:
    """Extract meaningful words from a title tag."""
    words = re.findall(r"[a-z0-9]+", title_text.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}

def collect_html_files(base: Path) -> list[Path]:
    files = []
    for path in sorted(base.rglob("*.html")):
        rel = path.relative_to(base)
        if rel.parts[0] in SKIP_FILES or str(rel) in SKIP_FILES:
            continue
        files.append(path)
    return files

# ── Checks ─────────────────────────────────────────────────────────────────────

def check_duplicate_headings(content: str) -> list[str]:
    """Return list of heading texts that appear more than once on the page."""
    headings = re.findall(r"<h[1-4][^>]*>(.*?)</h[1-4]>", content, re.DOTALL | re.IGNORECASE)
    normalized = [normalize(h) for h in headings]
    counts = Counter(normalized)
    return [text for text, count in counts.items() if count > 1 and len(text) > 3]


def check_excess_bold(content: str) -> int | None:
    """Return the count if it exceeds MAX_STRONG_TAGS, else None."""
    count = len(re.findall(r"<strong\b", content, re.IGNORECASE))
    return count if count > MAX_STRONG_TAGS else None


def check_title_h1_mismatch(content: str) -> list[str]:
    """Return keywords present in <title> but missing from <h1>."""
    title_match = re.search(r"<title[^>]*>(.*?)</title>", content, re.DOTALL | re.IGNORECASE)
    h1_match = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.DOTALL | re.IGNORECASE)
    if not title_match or not h1_match:
        return []
    title_words = title_keywords(strip_tags(title_match.group(1)))
    h1_words = title_keywords(strip_tags(h1_match.group(1)))
    missing = title_words - h1_words
    return sorted(missing)

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    warn_only = "--warn-only" in sys.argv
    files = collect_html_files(PUBLIC_DIR)

    issues: dict[str, list[str]] = {}

    for path in files:
        rel = str(path.relative_to(PUBLIC_DIR))
        try:
            content = path.read_text(errors="replace")
        except Exception as e:
            print(f"  [SKIP] {rel}: {e}")
            continue

        page_issues = []

        # 1. Duplicate headings
        dupes = check_duplicate_headings(content)
        for dupe in dupes:
            page_issues.append(f"DUPE_HEADING: \"{dupe[:60]}\"")

        # 2. Excess bold
        bold_count = check_excess_bold(content)
        if bold_count:
            page_issues.append(f"EXCESS_BOLD: {bold_count} <strong> tags (max {MAX_STRONG_TAGS})")

        # 3. Title/H1 mismatch
        if rel not in SKIP_TITLE_H1:
            missing = check_title_h1_mismatch(content)
            if missing:
                page_issues.append(f"TITLE_H1_MISMATCH: title keywords missing from H1: {missing}")

        if page_issues:
            issues[rel] = page_issues

    # ── Report ──────────────────────────────────────────────────────────────────
    if not issues:
        print("✅  SEO audit passed — no issues found across all pages.")
        sys.exit(0)

    total = sum(len(v) for v in issues.values())
    print(f"\n❌  SEO audit found {total} issue(s) across {len(issues)} page(s):\n")
    for page, page_issues in sorted(issues.items()):
        print(f"  /{page}")
        for issue in page_issues:
            print(f"    → {issue}")

    print(f"\nTotal: {total} issue(s) in {len(issues)} page(s)")

    if warn_only:
        print("\n⚠️  Running in --warn-only mode. Build will continue.")
        sys.exit(0)
    else:
        print("\nFix these issues before deploying. Run with --warn-only to skip blocking.")
        sys.exit(1)


if __name__ == "__main__":
    main()
