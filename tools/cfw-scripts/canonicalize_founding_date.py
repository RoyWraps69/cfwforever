"""
Founding-date canonicalization across the CFW site.

Problem: pages have a fragmented founding narrative —
  - 156 pages mention only "Since 2014"
  - 25 pages mention only "since 2001"
  - 69 pages mention both (these are canonical, leave alone)
  - 40 pages mention neither (no founding language, leave alone)
Plus stale year-experience counts: 8+, 10+, 20+, 22, 23 → all should be 24+.

Fix: First-occurrence parenthetical injection so AI engines see a unified narrative
(Vegas 2001 → Chicago 2014) on every page that touches either date. Year-experience
counts get hard-replaced to 24+.

Run with --dry to preview, no flag to write.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "public"

# --- Year-experience standardization (hard replace) ---
YEAR_EXPERIENCE_RULES = [
    # (pattern, replacement) — order matters; specific before generic
    (re.compile(r"\b8\+ years of experience\b"), "24+ years of experience"),
    (re.compile(r"\b8\+ years experience\b"), "24+ years experience"),
    (re.compile(r"\b10\+ years of experience\b"), "24+ years of experience"),
    (re.compile(r"\b10\+ years of wrapping\b"), "24+ years of wrapping"),
    (re.compile(r"\b20\+ years of experience\b"), "24+ years of experience"),
    (re.compile(r"\b20\+ years\b"), "24+ years"),
    (re.compile(r"\b22 years of experience\b"), "24+ years of experience"),
    (re.compile(r"\b23 years of experience\b"), "24+ years of experience"),
]

# --- Pre-existing factual typos to fix BEFORE narrative injection ---
# 69 pages had "Las Vegas in 2014" — should be 2001. This typo was polluting
# Person/Organization schema and feeding AI engines a contradictory founding date.
FACTUAL_FIXES = [
    (re.compile(r"\bLas Vegas in 2014\b"), "Las Vegas in 2001"),
]

# --- Founding-date parenthetical injection ---
# Matches first plain "since 2014" / "Since 2014" not already followed by a paren.
RE_2014_PLAIN = re.compile(r"(?P<lead>[Ss]ince 2014)(?!\s*\()")
RE_2001_PLAIN = re.compile(r"(?P<lead>[Ss]ince 2001)(?!\s*\()")

ADDENDUM_2001 = " (founded 2001)"
ADDENDUM_2014 = " (Chicago operations since 2014)"


# Year-mention detection — any standalone occurrence of the year in body copy.
# Includes "since 2001", "in 2001", "Founded 2001", "Established 2001",
# "operating since 2014", "Vegas in 2001", schema "foundingDate":"2001-..." etc.
RE_HAS_2014 = re.compile(r"\b2014\b")
RE_HAS_2001 = re.compile(r"\b2001\b")


def has_2014(text: str) -> bool:
    return bool(RE_HAS_2014.search(text))


def has_2001(text: str) -> bool:
    return bool(RE_HAS_2001.search(text))


def patch_file(path: Path, dry: bool = True) -> dict:
    original = path.read_text(encoding="utf-8")
    text = original
    changes = {
        "year_exp": 0,
        "factual_fix": 0,
        "founding_2001_added": 0,
        "founding_2014_added": 0,
    }

    # Pass 1: Factual typo fixes — must run before narrative detection
    # so re-corrected pages no longer trigger redundant injection.
    for pattern, replacement in FACTUAL_FIXES:
        text, n = pattern.subn(replacement, text)
        changes["factual_fix"] += n

    # Pass 2: Year-experience standardization
    for pattern, replacement in YEAR_EXPERIENCE_RULES:
        text, n = pattern.subn(replacement, text)
        changes["year_exp"] += n

    # Pass 3: Founding-date narrative injection — only on pages that have ONE not BOTH
    has_a = has_2014(text)
    has_b = has_2001(text)

    if has_a and not has_b:
        # Inject "(founded 2001)" after the first plain "Since 2014"
        text, n = RE_2014_PLAIN.subn(
            lambda m: m.group("lead") + ADDENDUM_2001, text, count=1
        )
        changes["founding_2001_added"] = n
    elif has_b and not has_a:
        # Inject "(Chicago operations since 2014)" after first plain "since 2001"
        text, n = RE_2001_PLAIN.subn(
            lambda m: m.group("lead") + ADDENDUM_2014, text, count=1
        )
        changes["founding_2014_added"] = n

    if text != original and not dry:
        path.write_text(text, encoding="utf-8")

    changes["touched"] = text != original
    return changes


def main(dry: bool):
    files = sorted(ROOT.rglob("*.html"))
    summary = {
        "files_scanned": 0,
        "files_changed": 0,
        "factual_typo_fixes": 0,
        "year_exp_replacements": 0,
        "pages_got_founded_2001": 0,
        "pages_got_chicago_2014": 0,
    }
    for f in files:
        c = patch_file(f, dry=dry)
        summary["files_scanned"] += 1
        if c["touched"]:
            summary["files_changed"] += 1
        summary["factual_typo_fixes"] += c["factual_fix"]
        summary["year_exp_replacements"] += c["year_exp"]
        summary["pages_got_founded_2001"] += c["founding_2001_added"]
        summary["pages_got_chicago_2014"] += c["founding_2014_added"]

    mode = "DRY-RUN" if dry else "WRITE"
    print(f"=== {mode} SUMMARY ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    dry_mode = "--write" not in sys.argv
    main(dry=dry_mode)
