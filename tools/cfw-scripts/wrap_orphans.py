"""
For each page: find any content orphaned between the last structural close tag
(</footer>, </section>, </article>) and </main>, and wrap in a max-width container.
Skip if already constrained.
"""
import re

WRAPPER_OPEN = '<div class="content-wrap" style="max-width:960px;margin:0 auto;padding:0 24px">'
WRAPPER_CLOSE = '</div>'

def needs_wrap(orphan_html):
    """Return True if orphan block contains unconstrained body text."""
    # Strip whitespace and HTML comments
    s = re.sub(r'<!--.*?-->', '', orphan_html, flags=re.DOTALL).strip()
    if not s:
        return False
    
    # Already wrapped in content-wrap (we've done it before — idempotent)
    if s.startswith('<div class="content-wrap"') or s.startswith('<div class="container"'):
        return False
    
    # Check if the VERY FIRST visible element is already a max-width wrapper
    first_tag = re.match(r'<(div|section|article|main|aside)[^>]*(?:style="[^"]*max-width|class="[^"]*(?:container|content|wrap))', s)
    if first_tag:
        return False
    
    # If first visible element is a bare <p>, <h1>-<h6>, <ul>, <ol>, <nav>, <figure>, or a <div>/<section> without max-width → needs wrap
    return bool(re.match(r'<(p|h[1-6]|ul|ol|nav|figure|blockquote|div|section)', s))


def fix_page(html):
    """Wrap orphaned bottom-of-page content in a max-width container."""
    main_close = html.rfind('</main>')
    if main_close < 0:
        return html, False, 'no </main>'
    
    # Find the last structural close tag before </main>
    boundaries = []
    for close_tag in ['</footer>', '</section>', '</article>']:
        pos = html.rfind(close_tag, 0, main_close)
        if pos > 0:
            boundaries.append((pos + len(close_tag), close_tag))
    
    if not boundaries:
        return html, False, 'no boundary tag'
    
    boundaries.sort()
    orphan_start, via_tag = boundaries[-1]
    orphan = html[orphan_start:main_close]
    
    if not needs_wrap(orphan):
        return html, False, 'already constrained'
    
    # Wrap
    new_html = html[:orphan_start] + '\n' + WRAPPER_OPEN + '\n' + orphan.strip() + '\n' + WRAPPER_CLOSE + '\n' + html[main_close:]
    return new_html, True, f'wrapped {len(orphan.strip())} bytes (after {via_tag})'


if __name__ == '__main__':
    import sys
    import pickle
    import urllib.request
    import time
    
    TARGET_TYPE = sys.argv[1] if len(sys.argv) > 1 else 'A'
    print(f"Running wrap-orphans pass for page Type {TARGET_TYPE}\n")
    
    with open('page_classifications.pkl','rb') as f:
        classifications = pickle.load(f)
    
    target_pages = sorted(p for p, c in classifications.items() if c['type'] == TARGET_TYPE)
    print(f"Pages of type {TARGET_TYPE}: {len(target_pages)}")
    
    def fetch_raw(path):
        url = f"https://raw.githubusercontent.com/RoyWraps69/cfwforever/main/{path}"
        req = urllib.request.Request(url, headers={"User-Agent":"CFW"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                return r.read().decode('utf-8','ignore')
        except:
            return None
    
    updates = {}
    skipped = 0
    no_main = 0
    no_boundary = 0
    for i, path in enumerate(target_pages, 1):
        html = fetch_raw(path)
        if not html:
            continue
        new_html, changed, reason = fix_page(html)
        if changed:
            updates[path] = new_html
        else:
            if 'no </main>' in reason: no_main += 1
            elif 'no boundary' in reason: no_boundary += 1
            else: skipped += 1
        if i % 40 == 0:
            print(f"  [{i}/{len(target_pages)}] — {len(updates)} wrapped, {skipped} already-constrained, {no_main+no_boundary} skipped (no anchor)")
        time.sleep(0.004)
    
    print(f"\n=== TYPE {TARGET_TYPE} RESULTS ===")
    print(f"  Pages wrapped:          {len(updates)}")
    print(f"  Already constrained:    {skipped}")
    print(f"  No </main>:             {no_main}")
    print(f"  No boundary tag:        {no_boundary}")
    print(f"  Total processed:        {len(target_pages)}")
    
    with open(f'wrap_updates_type_{TARGET_TYPE}.pkl','wb') as f:
        pickle.dump(updates, f)
    print(f"\n✓ Saved to wrap_updates_type_{TARGET_TYPE}.pkl")
