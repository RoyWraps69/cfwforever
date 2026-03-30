#!/usr/bin/env python3
"""
COMPREHENSIVE SITE AUDIT v2
Checks EVERY page for EVERY known issue. No shortcuts.
"""

import os
import re
import json
import hashlib
from collections import defaultdict, Counter
from html.parser import HTMLParser

PUBLIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
REPORT = '/home/ubuntu/full-audit-v2.md'

# ============================================================
# HELPERS
# ============================================================

class TagParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []  # (tag, attrs_dict, content)
        self._stack = []
        self._content = []
    
    def handle_starttag(self, tag, attrs):
        self._stack.append((tag, dict(attrs), []))
    
    def handle_endtag(self, tag):
        if self._stack and self._stack[-1][0] == tag:
            t, a, c = self._stack.pop()
            content = ''.join(c)
            self.tags.append((t, a, content))
            if self._stack:
                self._stack[-1][2].append(content)
    
    def handle_data(self, data):
        if self._stack:
            self._stack[-1][2].append(data)

def strip_html(html):
    """Remove scripts, styles, and tags to get plain text"""
    text = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', html, flags=re.I)
    text = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', text, flags=re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def word_count(html):
    return len(strip_html(html).split())

def get_tag_content(html, tag, attrs=None):
    """Extract content of specific tags"""
    results = []
    if attrs:
        attr_str = ''.join(f'[^>]*{k}=["\'][^"\']*{v}[^"\']*["\']' for k, v in attrs.items())
        pattern = f'<{tag}{attr_str}[^>]*>([\s\S]*?)</{tag}>'
    else:
        pattern = f'<{tag}[^>]*>([\s\S]*?)</{tag}>'
    for m in re.finditer(pattern, html, re.I):
        results.append(re.sub(r'<[^>]+>', '', m.group(1)).strip())
    return results

def get_meta(html, name=None, prop=None):
    """Extract meta tag content"""
    if name:
        m = re.search(f'<meta\\s+name=["\']?{name}["\']?\\s+content=["\']([^"\']*)["\']', html, re.I)
        if not m:
            m = re.search(f'<meta\\s+content=["\']([^"\']*)["\']\\s+name=["\']?{name}["\']?', html, re.I)
    elif prop:
        m = re.search(f'<meta\\s+property=["\']?{prop}["\']?\\s+content=["\']([^"\']*)["\']', html, re.I)
        if not m:
            m = re.search(f'<meta\\s+content=["\']([^"\']*)["\']\\s+property=["\']?{prop}["\']?', html, re.I)
    else:
        return None
    return m.group(1) if m else None

def get_canonical(html):
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', html, re.I)
    if not m:
        m = re.search(r'<link[^>]*href=["\']([^"\']*)["\'][^>]*rel=["\']canonical["\']', html, re.I)
    return m.group(1) if m else None

def count_tag(html, tag, attrs_pattern=None):
    if attrs_pattern:
        return len(re.findall(f'<{tag}[^>]*{attrs_pattern}[^>]*>', html, re.I))
    return len(re.findall(f'<{tag}[\\s>]', html, re.I))

def get_schemas(html):
    schemas = []
    for m in re.finditer(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>', html, re.I):
        try:
            data = json.loads(m.group(1))
            schemas.append(data)
        except:
            schemas.append({'_parse_error': True, '_raw': m.group(1)[:200]})
    return schemas

def get_h_tags(html):
    """Get all heading tags with their content"""
    headings = []
    for level in range(1, 7):
        for m in re.finditer(f'<h{level}[^>]*>([\s\S]*?)</h{level}>', html, re.I):
            text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
            headings.append((f'h{level}', text))
    return headings

def get_images(html):
    """Get all img tags with src and alt"""
    imgs = []
    for m in re.finditer(r'<img[^>]*>', html, re.I):
        tag = m.group(0)
        src_m = re.search(r'src=["\']([^"\']*)["\']', tag)
        alt_m = re.search(r'alt=["\']([^"\']*)["\']', tag)
        src = src_m.group(1) if src_m else ''
        alt = alt_m.group(1) if alt_m else None
        imgs.append({'src': src, 'alt': alt, 'has_alt': alt is not None})
    return imgs

def get_links(html):
    """Get all anchor tags"""
    links = []
    for m in re.finditer(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>([\s\S]*?)</a>', html, re.I):
        href = m.group(1)
        text = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        links.append({'href': href, 'text': text})
    return links

def hash_paragraphs(html):
    """Hash paragraph content for duplicate detection"""
    hashes = []
    for m in re.finditer(r'<p[^>]*>([\s\S]*?)</p>', html, re.I):
        text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        if len(text) > 50:  # Only check substantial paragraphs
            hashes.append(hashlib.md5(text.encode()).hexdigest())
    return hashes

# ============================================================
# DISCOVERY
# ============================================================

pages = []
skip_dirs = {'images', 'js', 'css', 'fonts', 'icons', 'node_modules', '.git', 'public-backup'}

for root, dirs, files in os.walk(PUBLIC):
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    if 'index.html' in files:
        filepath = os.path.join(root, 'index.html')
        rel = os.path.relpath(root, PUBLIC)
        slug = '/' if rel == '.' else '/' + rel + '/'
        pages.append({'slug': slug, 'filepath': filepath})

pages.sort(key=lambda x: x['slug'])
print(f"Found {len(pages)} pages to audit")

# ============================================================
# AUDIT EACH PAGE
# ============================================================

issues = defaultdict(list)  # issue_type -> [(slug, detail)]
page_data = []  # Store per-page data for cross-page checks
all_paragraph_hashes = defaultdict(list)  # hash -> [slugs]
meta_descriptions = defaultdict(list)  # description -> [slugs]
titles = defaultdict(list)  # title -> [slugs]
h1_texts = defaultdict(list)  # h1 -> [slugs]

for i, page in enumerate(pages):
    slug = page['slug']
    filepath = page['filepath']
    html = open(filepath, 'r', errors='replace').read()
    
    s = slug.strip('/')
    is_skip = s in ('404', 'googleac4190c5fb66b0fb')
    
    # ---- BASIC METRICS ----
    wc = word_count(html)
    title_tag = re.search(r'<title>([^<]*)</title>', html, re.I)
    title_text = title_tag.group(1).strip() if title_tag else ''
    meta_desc = get_meta(html, name='description') or ''
    canonical = get_canonical(html)
    h_tags = get_h_tags(html)
    h1s = [h for h in h_tags if h[0] == 'h1']
    h2s = [h for h in h_tags if h[0] == 'h2']
    h3s = [h for h in h_tags if h[0] == 'h3']
    imgs = get_images(html)
    schemas = get_schemas(html)
    schema_types = set()
    for s_data in schemas:
        if isinstance(s_data, dict):
            if '@type' in s_data:
                t = s_data['@type']
                if isinstance(t, list):
                    for tt in t:
                        schema_types.add(str(tt))
                else:
                    schema_types.add(str(t))
            if '_parse_error' in s_data:
                issues['broken_schema'].append((slug, s_data.get('_raw', '')[:100]))
    
    # Store for cross-page checks
    if title_text:
        titles[title_text].append(slug)
    if meta_desc:
        meta_descriptions[meta_desc].append(slug)
    for h in h1s:
        h1_texts[h[1]].append(slug)
    
    p_hashes = hash_paragraphs(html)
    for h in p_hashes:
        all_paragraph_hashes[h].append(slug)
    
    page_info = {
        'slug': slug, 'words': wc, 'title': title_text, 'meta_desc': meta_desc,
        'canonical': canonical, 'h1_count': len(h1s), 'h2_count': len(h2s),
        'h1_texts': [h[1] for h in h1s], 'h2_texts': [h[1] for h in h2s],
        'schema_types': schema_types, 'img_count': len(imgs),
        'is_skip': is_skip,
    }
    page_data.append(page_info)
    
    if is_skip:
        continue
    
    # ---- ISSUE CHECKS ----
    
    # 1. Word count
    if wc < 1800:
        issues['under_1800_words'].append((slug, f'{wc} words'))
    
    # 2. Missing/empty title
    if not title_text:
        issues['missing_title'].append((slug, ''))
    elif len(title_text) < 20:
        issues['short_title'].append((slug, f'"{title_text}" ({len(title_text)} chars)'))
    elif len(title_text) > 70:
        issues['long_title'].append((slug, f'"{title_text}" ({len(title_text)} chars)'))
    
    # 3. Missing/empty meta description
    if not meta_desc:
        issues['missing_meta_desc'].append((slug, ''))
    elif len(meta_desc) < 70:
        issues['short_meta_desc'].append((slug, f'{len(meta_desc)} chars'))
    elif len(meta_desc) > 170:
        issues['long_meta_desc'].append((slug, f'{len(meta_desc)} chars'))
    
    # 4. Canonical issues
    if not canonical:
        issues['missing_canonical'].append((slug, ''))
    elif 'www.' in canonical:
        issues['www_canonical'].append((slug, canonical))
    elif not canonical.startswith('https://chicagofleetwraps.com'):
        issues['wrong_domain_canonical'].append((slug, canonical))
    
    # 5. Duplicate canonical tags
    canonical_count = len(re.findall(r'rel=["\']canonical["\']', html, re.I))
    if canonical_count > 1:
        issues['duplicate_canonical'].append((slug, f'{canonical_count} canonical tags'))
    
    # 6. H1 issues
    if len(h1s) == 0:
        issues['missing_h1'].append((slug, ''))
    elif len(h1s) > 1:
        issues['multiple_h1'].append((slug, f'{len(h1s)} H1s: {[h[1][:50] for h in h1s]}'))
    
    # 7. H1 matches title exactly (should be different for SEO)
    if h1s and title_text and h1s[0][1].lower().strip() == title_text.lower().strip():
        issues['h1_equals_title'].append((slug, h1s[0][1][:60]))
    
    # 8. No H2s
    if len(h2s) == 0 and wc > 300:
        issues['no_h2s'].append((slug, ''))
    
    # 9. Empty headings
    for h in h_tags:
        if not h[1].strip():
            issues['empty_heading'].append((slug, h[0]))
    
    # 10. Heading contains slug/path text
    for h in h_tags:
        if '/' in h[1] and h[1].count('/') > 1:
            issues['slug_in_heading'].append((slug, f'{h[0]}: "{h[1][:80]}"'))
    
    # 11. Images without alt text
    for img in imgs:
        if not img['has_alt']:
            issues['img_missing_alt'].append((slug, img['src'][:80]))
        elif img['alt'] == '':
            issues['img_empty_alt'].append((slug, img['src'][:80]))
    
    # 12. Broken internal links (pointing to non-existent pages)
    links = get_links(html)
    for link in links:
        href = link['href']
        if href.startswith('/') and not href.startswith('//'):
            # Internal link
            target = href.split('?')[0].split('#')[0]
            if target and target != '/':
                target_path = os.path.join(PUBLIC, target.strip('/'), 'index.html')
                if not os.path.exists(target_path) and not target.endswith('.js') and not target.endswith('.css') and not target.endswith('.png') and not target.endswith('.jpg') and not target.endswith('.svg') and not target.endswith('.ico') and not target.endswith('.xml') and not target.endswith('.txt') and not target.endswith('.pdf') and not target.endswith('.webp'):
                    issues['broken_internal_link'].append((slug, f'→ {href}'))
    
    # 13. Schema checks
    if 'LocalBusiness' not in schema_types:
        issues['missing_localbusiness_schema'].append((slug, ''))
    if 'FAQPage' not in schema_types:
        issues['missing_faq_schema'].append((slug, ''))
    if 'BreadcrumbList' not in schema_types and slug != '/':
        issues['missing_breadcrumb_schema'].append((slug, ''))
    
    # 14. Duplicate robots meta
    robots_count = len(re.findall(r'<meta\s+name=["\']robots["\']', html, re.I))
    if robots_count > 1:
        issues['duplicate_robots_meta'].append((slug, f'{robots_count} robots meta tags'))
    
    # 15. Duplicate og:url
    og_url_count = len(re.findall(r'property=["\']og:url["\']', html, re.I))
    if og_url_count > 1:
        issues['duplicate_og_url'].append((slug, f'{og_url_count} og:url tags'))
    
    # 16. Missing og:title, og:description, og:image
    if not get_meta(html, prop='og:title'):
        issues['missing_og_title'].append((slug, ''))
    if not get_meta(html, prop='og:description'):
        issues['missing_og_description'].append((slug, ''))
    if not get_meta(html, prop='og:image'):
        issues['missing_og_image'].append((slug, ''))
    
    # 17. www references in content
    www_refs = re.findall(r'https?://www\.chicagofleetwraps\.com', html)
    if www_refs:
        issues['www_references'].append((slug, f'{len(www_refs)} www references'))
    
    # 18. "Loading full article" placeholder
    if 'Loading full article' in html:
        issues['loading_placeholder'].append((slug, ''))
    
    # 19. Supabase references (except GMB)
    supabase_refs = re.findall(r'supabase\.co', html, re.I)
    if supabase_refs and 'gmb' not in html.lower()[:5000]:
        issues['supabase_reference'].append((slug, f'{len(supabase_refs)} refs'))
    
    # 20. Hidden content (display:none on large blocks)
    hidden_blocks = re.findall(r'display:\s*none[^"]*"[^>]*>[\s\S]{200,}?</(?:div|section|article)', html, re.I)
    if hidden_blocks:
        issues['hidden_content'].append((slug, f'{len(hidden_blocks)} hidden blocks'))
    
    # 21. Check for "REPLACED:" comments left over
    replaced_comments = re.findall(r'<!-- REPLACED:', html)
    if replaced_comments:
        issues['leftover_replace_comments'].append((slug, f'{len(replaced_comments)} comments'))
    
    # 22. JSON parse errors in schema
    for s_data in schemas:
        if isinstance(s_data, dict) and '_parse_error' in s_data:
            issues['broken_json_ld'].append((slug, s_data.get('_raw', '')[:100]))
    
    # 23. Missing viewport meta
    if not re.search(r'<meta[^>]*name=["\']viewport["\']', html, re.I):
        issues['missing_viewport'].append((slug, ''))
    
    # 24. Missing charset
    if not re.search(r'<meta[^>]*charset', html, re.I):
        issues['missing_charset'].append((slug, ''))
    
    # 25. Review count check (should be 49)
    review_counts = re.findall(r'"reviewCount"[:\s]*"?(\d+)"?', html)
    for rc in review_counts:
        if rc != '49' and rc != '42':
            issues['wrong_review_count'].append((slug, f'reviewCount: {rc}'))
    
    # 26. Heading hierarchy (h3 without h2, etc.)
    h_levels = [int(h[0][1]) for h in h_tags]
    for j in range(1, len(h_levels)):
        if h_levels[j] > h_levels[j-1] + 1:
            issues['heading_hierarchy_skip'].append((slug, f'{h_tags[j-1][0]}→{h_tags[j][0]}'))
            break  # Only report first skip per page
    
    # 27. Empty FAQ items
    faq_items = re.findall(r'class=["\']faq-item["\'][^>]*>([\s\S]*?)</div>', html, re.I)
    for fi in faq_items:
        text = re.sub(r'<[^>]+>', '', fi).strip()
        if len(text) < 20:
            issues['empty_faq_item'].append((slug, text[:50]))
    
    # 28. Duplicate same-page images
    img_srcs = [img['src'] for img in imgs if img['src'] and not img['src'].startswith('data:')]
    src_counts = Counter(img_srcs)
    for src, count in src_counts.items():
        if count > 1:
            issues['duplicate_image_on_page'].append((slug, f'{src[:60]} appears {count}x'))

    if (i + 1) % 50 == 0:
        print(f"  Audited {i+1}/{len(pages)} pages...")

print(f"Audited all {len(pages)} pages")

# ============================================================
# CROSS-PAGE CHECKS
# ============================================================

# Duplicate titles
for title, slugs in titles.items():
    if len(slugs) > 1:
        issues['duplicate_title'].append(('CROSS-PAGE', f'"{title[:60]}" on {len(slugs)} pages: {slugs[:5]}'))

# Duplicate meta descriptions
for desc, slugs in meta_descriptions.items():
    if len(slugs) > 1:
        issues['duplicate_meta_desc'].append(('CROSS-PAGE', f'"{desc[:60]}..." on {len(slugs)} pages: {slugs[:5]}'))

# Duplicate H1s
for h1, slugs in h1_texts.items():
    if len(slugs) > 1 and h1:
        issues['duplicate_h1'].append(('CROSS-PAGE', f'"{h1[:60]}" on {len(slugs)} pages: {slugs[:5]}'))

# Duplicate paragraphs across pages
dup_para_count = 0
dup_para_pairs = set()
for h, slugs in all_paragraph_hashes.items():
    if len(slugs) > 1:
        unique_slugs = list(set(slugs))
        if len(unique_slugs) > 1:
            dup_para_count += 1
            for s in unique_slugs[:3]:
                dup_para_pairs.add(s)

if dup_para_count > 0:
    issues['duplicate_paragraphs_across_pages'].append(('CROSS-PAGE', f'{dup_para_count} unique paragraphs duplicated across {len(dup_para_pairs)} pages'))

# ============================================================
# GENERATE REPORT
# ============================================================

report = []
report.append("# Full Site Audit Report v2\n")
report.append(f"**Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
report.append(f"**Total pages:** {len(pages)}\n")

# Summary stats
total_issues = sum(len(v) for v in issues.values())
report.append(f"**Total issues found:** {total_issues}\n")

# Issue categories sorted by severity
severity_order = [
    # CRITICAL
    'duplicate_canonical', 'www_canonical', 'wrong_domain_canonical', 'broken_json_ld',
    'loading_placeholder', 'leftover_replace_comments', 'hidden_content',
    # HIGH
    'missing_h1', 'multiple_h1', 'missing_title', 'missing_meta_desc', 'missing_canonical',
    'duplicate_title', 'duplicate_meta_desc', 'duplicate_h1', 'duplicate_paragraphs_across_pages',
    'under_1800_words', 'www_references', 'duplicate_robots_meta', 'duplicate_og_url',
    # MEDIUM
    'missing_localbusiness_schema', 'missing_faq_schema', 'missing_breadcrumb_schema',
    'broken_schema', 'broken_internal_link', 'img_missing_alt', 'img_empty_alt',
    'duplicate_image_on_page', 'empty_heading', 'slug_in_heading', 'heading_hierarchy_skip',
    'h1_equals_title', 'empty_faq_item', 'wrong_review_count', 'supabase_reference',
    # LOW
    'no_h2s', 'short_title', 'long_title', 'short_meta_desc', 'long_meta_desc',
    'missing_og_title', 'missing_og_description', 'missing_og_image',
    'missing_viewport', 'missing_charset',
]

# Add any issues not in the order
for key in issues:
    if key not in severity_order:
        severity_order.append(key)

report.append("\n## Issue Summary\n")
report.append("| # | Issue | Count | Severity |")
report.append("|---|-------|-------|----------|")

critical = ['duplicate_canonical', 'www_canonical', 'wrong_domain_canonical', 'broken_json_ld',
            'loading_placeholder', 'leftover_replace_comments', 'hidden_content']
high = ['missing_h1', 'multiple_h1', 'missing_title', 'missing_meta_desc', 'missing_canonical',
        'duplicate_title', 'duplicate_meta_desc', 'duplicate_h1', 'duplicate_paragraphs_across_pages',
        'under_1800_words', 'www_references', 'duplicate_robots_meta', 'duplicate_og_url']

n = 1
for key in severity_order:
    if key in issues and len(issues[key]) > 0:
        sev = 'CRITICAL' if key in critical else 'HIGH' if key in high else 'MEDIUM'
        report.append(f"| {n} | {key.replace('_', ' ').title()} | {len(issues[key])} | {sev} |")
        n += 1

# Detailed sections
for key in severity_order:
    if key not in issues or len(issues[key]) == 0:
        continue
    
    report.append(f"\n## {key.replace('_', ' ').title()} ({len(issues[key])})\n")
    
    for slug, detail in issues[key][:100]:  # Cap at 100 per issue type
        if detail:
            report.append(f"- `{slug}` — {detail}")
        else:
            report.append(f"- `{slug}`")
    
    if len(issues[key]) > 100:
        report.append(f"\n*... and {len(issues[key]) - 100} more*\n")

# Word count distribution
report.append("\n## Word Count Distribution\n")
report.append("| Range | Count |")
report.append("|-------|-------|")
ranges = [(0, 500), (500, 1000), (1000, 1500), (1500, 1800), (1800, 2500), (2500, 3500), (3500, 99999)]
for lo, hi in ranges:
    count = sum(1 for p in page_data if lo <= p['words'] < hi and not p['is_skip'])
    label = f"{lo}-{hi}" if hi < 99999 else f"{lo}+"
    report.append(f"| {label} | {count} |")

# Pages still under 1800
report.append("\n## Pages Under 1800 Words (Detail)\n")
under = [(p['slug'], p['words']) for p in page_data if p['words'] < 1800 and not p['is_skip']]
under.sort(key=lambda x: x[1])
if under:
    report.append("| Page | Words |")
    report.append("|------|-------|")
    for slug, wc in under:
        report.append(f"| `{slug}` | {wc} |")
else:
    report.append("All content pages are at 1800+ words.\n")

with open(REPORT, 'w') as f:
    f.write('\n'.join(report))

print(f"\nReport written to {REPORT}")
print(f"Total issues: {total_issues}")
print(f"\nTop issues:")
for key in severity_order:
    if key in issues and len(issues[key]) > 0:
        print(f"  {key}: {len(issues[key])}")
