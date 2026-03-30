#!/usr/bin/env python3
"""
Full site audit: crawl all pages and report on:
- Word count (target: 1800+)
- H1 tags (exactly 1 per page)
- H2/H3 structure
- Meta description (unique, page-specific)
- Schema markup (LocalBusiness, FAQ, BreadcrumbList)
- Duplicate content detection (paragraph-level fingerprinting)
- Canonical tags
"""
import os, re, json, hashlib
from collections import defaultdict
from html.parser import HTMLParser

PUBLIC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

class PageAuditor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_tag = None
        self.h1s = []
        self.h2s = []
        self.h3s = []
        self.meta_desc = ''
        self.title = ''
        self.schemas = []
        self.has_canonical = False
        self.text_chunks = []
        self.current_text = ''
        self.in_script = False
        self.script_content = ''
        self.in_style = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag in ('h1','h2','h3'):
            self.in_tag = tag
            self.current_text = ''
        elif tag == 'meta':
            if attrs_dict.get('name','').lower() == 'description':
                self.meta_desc = attrs_dict.get('content','')
        elif tag == 'link':
            if attrs_dict.get('rel','') == 'canonical':
                self.has_canonical = True
        elif tag == 'title':
            self.in_tag = 'title'
            self.current_text = ''
        elif tag == 'script':
            self.in_script = True
            self.script_content = ''
            if attrs_dict.get('type','') == 'application/ld+json':
                self.in_tag = 'json-ld'
                self.current_text = ''
        elif tag == 'style':
            self.in_style = True
            
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
            if self.in_tag == 'json-ld':
                try:
                    data = json.loads(self.current_text)
                    if isinstance(data, dict):
                        self.schemas.append(data.get('@type','unknown'))
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict):
                                self.schemas.append(item.get('@type','unknown'))
                except:
                    pass
                self.in_tag = None
            return
        if tag == 'style':
            self.in_style = False
            return
        if self.in_tag == tag:
            text = self.current_text.strip()
            if tag == 'h1': self.h1s.append(text)
            elif tag == 'h2': self.h2s.append(text)
            elif tag == 'h3': self.h3s.append(text)
            elif tag == 'title': self.title = text
            self.in_tag = None
            
    def handle_data(self, data):
        if self.in_style or (self.in_script and self.in_tag != 'json-ld'):
            return
        if self.in_tag:
            self.current_text += data
        if not self.in_script and not self.in_style:
            self.text_chunks.append(data)

def get_text_content(html):
    """Strip tags and get plain text"""
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_content_fingerprints(html):
    """Extract paragraph-level fingerprints for duplicate detection"""
    # Get text from main content sections (skip nav, footer, schema)
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<nav[^>]*>.*?</nav>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<footer[^>]*>.*?</footer>', '', text, flags=re.DOTALL|re.IGNORECASE)
    
    # Extract paragraphs
    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', text, re.DOTALL|re.IGNORECASE)
    fingerprints = set()
    for p in paragraphs:
        clean = re.sub(r'<[^>]+>', '', p).strip()
        if len(clean) > 80:  # Only fingerprint substantial paragraphs
            fp = hashlib.md5(clean.lower().encode()).hexdigest()
            fingerprints.add((fp, clean[:100]))
    return fingerprints

# Crawl all pages
pages = []
all_fingerprints = defaultdict(list)  # fp -> [(slug, text_preview)]
meta_descriptions = defaultdict(list)  # desc -> [slugs]

for root, dirs, files in os.walk(PUBLIC):
    for f in files:
        if f == 'index.html':
            filepath = os.path.join(root, f)
            rel = os.path.relpath(root, PUBLIC)
            if rel == '.':
                slug = '/'
            else:
                slug = '/' + rel + '/'
            
            # Skip non-content pages
            skip_dirs = ['images', 'js', 'css', 'fonts', 'icons']
            if any(slug.startswith('/' + d + '/') for d in skip_dirs):
                continue
                
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
                html = fh.read()
            
            auditor = PageAuditor()
            try:
                auditor.feed(html)
            except:
                pass
            
            text = get_text_content(html)
            word_count = len(text.split())
            
            fingerprints = get_content_fingerprints(html)
            for fp, preview in fingerprints:
                all_fingerprints[fp].append((slug, preview))
            
            if auditor.meta_desc:
                meta_descriptions[auditor.meta_desc.strip()].append(slug)
            
            pages.append({
                'slug': slug,
                'filepath': filepath,
                'word_count': word_count,
                'h1s': auditor.h1s,
                'h2s': auditor.h2s,
                'h3s': auditor.h3s,
                'meta_desc': auditor.meta_desc,
                'title': auditor.title,
                'schemas': auditor.schemas,
                'has_canonical': auditor.has_canonical,
                'fingerprints': fingerprints,
            })

pages.sort(key=lambda p: p['slug'])

# Generate report
report = []
report.append(f"# Full Site Audit Report")
report.append(f"## Total Pages: {len(pages)}\n")

# 1. Word count issues
thin_pages = [p for p in pages if p['word_count'] < 1800]
report.append(f"## 1. Pages Under 1800 Words: {len(thin_pages)}/{len(pages)}")
report.append(f"| Slug | Words | Gap |")
report.append(f"|------|-------|-----|")
for p in sorted(thin_pages, key=lambda x: x['word_count']):
    gap = 1800 - p['word_count']
    report.append(f"| {p['slug']} | {p['word_count']} | +{gap} needed |")
report.append("")

# 2. H1 issues
h1_issues = [p for p in pages if len(p['h1s']) != 1]
report.append(f"## 2. H1 Tag Issues: {len(h1_issues)} pages")
for p in h1_issues:
    count = len(p['h1s'])
    report.append(f"- {p['slug']}: {count} H1 tags {'(MISSING)' if count == 0 else '(MULTIPLE: ' + ', '.join(p['h1s'][:3]) + ')'}")
report.append("")

# 3. Duplicate meta descriptions
dup_metas = {desc: slugs for desc, slugs in meta_descriptions.items() if len(slugs) > 1}
report.append(f"## 3. Duplicate Meta Descriptions: {len(dup_metas)} groups")
for desc, slugs in sorted(dup_metas.items(), key=lambda x: -len(x[1])):
    report.append(f"\n**\"{desc[:100]}...\"** ({len(slugs)} pages)")
    for s in slugs:
        report.append(f"  - {s}")
report.append("")

# 4. Missing/empty meta descriptions
no_meta = [p for p in pages if not p['meta_desc'].strip()]
report.append(f"## 4. Missing Meta Descriptions: {len(no_meta)} pages")
for p in no_meta:
    report.append(f"- {p['slug']}")
report.append("")

# 5. Schema issues
report.append(f"## 5. Schema Markup Audit")
no_local = [p for p in pages if 'LocalBusiness' not in p['schemas']]
no_faq = [p for p in pages if 'FAQPage' not in p['schemas']]
no_breadcrumb = [p for p in pages if 'BreadcrumbList' not in p['schemas']]
report.append(f"- Missing LocalBusiness: {len(no_local)} pages")
report.append(f"- Missing FAQPage: {len(no_faq)} pages")
report.append(f"- Missing BreadcrumbList: {len(no_breadcrumb)} pages")
report.append("")

# 6. Duplicate content (paragraph-level)
dup_content = {fp: slugs for fp, slugs in all_fingerprints.items() if len(slugs) > 1}
# Group by slug pairs
dup_pairs = defaultdict(int)
dup_examples = defaultdict(list)
for fp, slug_list in dup_content.items():
    unique_slugs = list(set(s for s, _ in slug_list))
    if len(unique_slugs) > 1:
        for i in range(len(unique_slugs)):
            for j in range(i+1, len(unique_slugs)):
                pair = tuple(sorted([unique_slugs[i], unique_slugs[j]]))
                dup_pairs[pair] += 1
                if len(dup_examples[pair]) < 2:
                    dup_examples[pair].append(slug_list[0][1])

report.append(f"## 6. Duplicate Content Between Pages: {len(dup_pairs)} page pairs share content")
for pair, count in sorted(dup_pairs.items(), key=lambda x: -x[1])[:50]:
    report.append(f"\n**{pair[0]}** ↔ **{pair[1]}**: {count} shared paragraphs")
    for ex in dup_examples[pair][:1]:
        report.append(f"  Example: \"{ex}...\"")
report.append("")

# 7. Pages missing canonical
no_canonical = [p for p in pages if not p['has_canonical']]
report.append(f"## 7. Missing Canonical Tag: {len(no_canonical)} pages")
for p in no_canonical:
    report.append(f"- {p['slug']}")
report.append("")

# 8. Summary stats
report.append(f"## 8. Summary Statistics")
avg_words = sum(p['word_count'] for p in pages) / len(pages) if pages else 0
report.append(f"- Average word count: {avg_words:.0f}")
report.append(f"- Pages at 1800+ words: {len(pages) - len(thin_pages)}/{len(pages)}")
report.append(f"- Pages with proper H1: {len(pages) - len(h1_issues)}/{len(pages)}")
report.append(f"- Pages with unique meta desc: {len(pages) - len(no_meta) - sum(len(s)-1 for s in dup_metas.values())}/{len(pages)}")
report.append(f"- Pages with FAQ schema: {len(pages) - len(no_faq)}/{len(pages)}")
report.append(f"- Pages with LocalBusiness schema: {len(pages) - len(no_local)}/{len(pages)}")

# Write report
report_text = '\n'.join(report)
with open('/home/ubuntu/full-site-audit.md', 'w') as f:
    f.write(report_text)

# Write machine-readable data for fixing
page_data = []
for p in pages:
    page_data.append({
        'slug': p['slug'],
        'word_count': p['word_count'],
        'h1_count': len(p['h1s']),
        'h1_text': p['h1s'][0] if p['h1s'] else '',
        'h2_count': len(p['h2s']),
        'h3_count': len(p['h3s']),
        'meta_desc': p['meta_desc'],
        'title': p['title'],
        'schemas': p['schemas'],
        'has_canonical': p['has_canonical'],
        'needs_words': max(0, 1800 - p['word_count']),
    })

with open('/home/ubuntu/page-audit-data.json', 'w') as f:
    json.dump(page_data, f, indent=2)

print(f"\nAudit complete: {len(pages)} pages analyzed")
print(f"Report: /home/ubuntu/full-site-audit.md")
print(f"Data: /home/ubuntu/page-audit-data.json")

# Print key stats
print(f"\n=== KEY ISSUES ===")
print(f"Pages under 1800 words: {len(thin_pages)}/{len(pages)}")
print(f"Duplicate meta descriptions: {len(dup_metas)} groups affecting {sum(len(s) for s in dup_metas.values())} pages")
print(f"H1 issues: {len(h1_issues)} pages")
print(f"Missing FAQ schema: {len(no_faq)} pages")
print(f"Missing LocalBusiness schema: {len(no_local)} pages")
print(f"Duplicate content pairs: {len(dup_pairs)}")
