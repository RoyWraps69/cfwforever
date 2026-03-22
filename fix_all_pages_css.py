#!/usr/bin/env python3
"""
Inject the homepage's complete CSS design system into every HTML page
that is missing :root / body{background}. Handles both:
  - directory pages:  public/*/index.html
  - flat .html files: public/*.html  (e.g. public/somepage.html)
"""

import glob, re, os

# ── 1. CANONICAL CSS FROM HOMEPAGE ────────────────────────────────────────────
# This is the complete design-system CSS extracted from the homepage (index.html).
# It defines :root variables, body, header, nav, h1-h3, buttons, content containers,
# pricing tables, FAQ cards, trust bars, footer, and responsive breakpoints.

CANONICAL_CSS = """/* ── DESIGN SYSTEM — matches chicagofleetwraps.com homepage ── */
:root{
  --gold:#F5C518;--gold-dark:#d4a800;--gold-glow:rgba(245,197,24,.18);
  --black:#0A0A0A;--surface:#16181A;--dark:#1C1C1C;--steel:#242424;--card-bg:#1a1c1e;
  --text:rgba(255,255,255,.92);--muted:rgba(255,255,255,.55);--subtle:rgba(255,255,255,.35);
  --border:rgba(255,255,255,.10);--border-hover:rgba(255,255,255,.22);--border-gold:rgba(245,197,24,.25);
  --H:'Barlow Condensed','Barlow Condensed Fallback',sans-serif;
  --B:'Inter','Barlow','Barlow Fallback',sans-serif;
  --D:'Bebas Neue','Barlow Condensed',sans-serif;
  --radius:12px;--radius-lg:20px;--radius-xl:28px;
  --shadow-sm:0 2px 8px rgba(0,0,0,.35);--shadow-md:0 4px 20px rgba(0,0,0,.45);
  --shadow-lg:0 8px 40px rgba(0,0,0,.6);--shadow-gold:0 4px 24px rgba(245,197,24,.25)
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--black);color:var(--text);font-family:var(--B);font-size:16px;line-height:1.6;overflow-x:hidden}

/* ── HEADER / NAV ── */
header{position:sticky;top:0;z-index:1000;background:rgba(10,10,10,.97);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);overflow:visible}
.hbar{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:20px;height:62px;overflow:visible}
.logo{font-family:var(--H);font-size:1.25rem;font-weight:900;color:#fff;cursor:pointer;flex-shrink:0;letter-spacing:.02em}
.logo span{color:var(--gold)}
nav{display:flex;align-items:center;gap:4px;margin-left:10px}
nav a{color:rgba(255,255,255,.7);text-decoration:none;font-family:var(--H);font-size:.88rem;font-weight:700;padding:8px 12px;border-radius:6px;transition:color .2s}
nav a:hover{color:var(--gold)}
.hright{margin-left:auto;display:flex;align-items:center;gap:10px}
.hphone{color:var(--gold);font-family:var(--H);font-weight:800;font-size:.95rem;text-decoration:none;letter-spacing:.12em}
.ni{position:relative}
.ni>button{background:none;border:none;color:rgba(255,255,255,.7);font-family:var(--B);font-size:.84rem;padding:8px 12px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:4px}
.drop{display:none;position:absolute;top:100%;left:0;background:#181818;border:1px solid var(--border);border-radius:10px;padding:6px;min-width:220px;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:200}
.drop::before{content:'';position:absolute;top:-10px;left:0;right:0;height:10px}
.ni:hover .drop,.ni:focus-within .drop{display:block}
.drop a{display:block;padding:8px 12px;color:rgba(255,255,255,.7);font-size:.82rem;border-radius:6px;text-decoration:none}
.drop a:hover{color:var(--gold);background:rgba(255,255,255,.05)}
.gmb-header{display:flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.2);border-radius:20px;text-decoration:none;cursor:pointer}
.gmb-header span{font-size:.74rem;font-weight:700;color:var(--gold);font-family:var(--H);letter-spacing:.04em}
.gmb-header small{font-size:.68rem;color:rgba(255,255,255,.7);display:block;line-height:1}
.gmb-header .gs{color:var(--gold);font-size:.8rem}
.hambtn{display:none;background:none;border:1px solid var(--border);color:#fff;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:.9rem}
.mnav{display:none}
.mnav.open{display:flex;flex-direction:column;gap:2px;padding:12px 16px;background:#111;border-top:1px solid var(--border)}
.btn-est{display:inline-flex;align-items:center;padding:9px 18px;border-radius:8px;font-family:var(--H);font-size:.82rem;font-weight:800;text-decoration:none;background:var(--gold);color:#000}

/* ── TYPOGRAPHY ── */
h1{font-family:var(--D,var(--H));font-size:clamp(2.4rem,5vw,3.6rem);color:#fff;margin-bottom:16px;line-height:1.05}
h2{font-family:var(--H);font-size:1.6rem;color:var(--gold);margin:36px 0 14px;font-weight:800}
h3{font-family:var(--H);font-size:1.2rem;color:var(--gold);margin:24px 0 10px;font-weight:700}
h4{font-family:var(--H);font-size:1rem;color:var(--gold);margin:16px 0 8px;font-weight:700}
p{color:rgba(255,255,255,.72);line-height:1.7;margin-bottom:14px}
a{color:var(--gold);text-decoration:none}
a:hover{text-decoration:underline}
ul,ol{color:rgba(255,255,255,.72);padding-left:1.4em;margin-bottom:14px}
li{margin-bottom:6px;line-height:1.6}
strong{color:rgba(255,255,255,.92)}

/* ── CONTENT WRAPPER ── */
.content{max-width:900px;margin:0 auto;padding:60px 24px}
.lead{font-size:1.1rem;color:rgba(255,255,255,.75);line-height:1.7;margin-bottom:32px}
.body-text{font-size:.97rem;color:rgba(255,255,255,.7);line-height:1.7;margin-bottom:18px}
.speakable{font-size:1.05rem;color:rgba(255,255,255,.78);line-height:1.72}
main{min-height:60vh}

/* ── HERO BANNER (service/suburb pages) ── */
.page-hero-banner{position:relative;width:100%;height:420px;overflow:hidden;background:#0d0d0d;margin-bottom:0}
.page-hero-banner img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.page-hero-banner .hero-text{position:absolute;left:60px;bottom:48px;z-index:2}
.page-hero-banner .hero-eyebrow{font-family:var(--H);font-size:13px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
.page-hero-banner .hero-h1{font-family:var(--D,var(--H));font-size:clamp(36px,6vw,72px);line-height:.95;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.6);margin:0}
.page-hero-banner .hero-h1 span{color:var(--gold)}
.page-hero-banner .hero-accent{position:absolute;left:0;top:0;width:6px;height:100%;background:var(--gold)}
.page-hero-banner .hero-h2{font-family:var(--H);font-size:clamp(1.4rem,3vw,2rem);font-weight:700;color:var(--gold);margin:0;line-height:1.2;text-shadow:0 2px 12px rgba(0,0,0,.5)}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:8px;font-family:var(--H);font-size:.95rem;font-weight:800;text-decoration:none;border:2px solid transparent;transition:.18s;letter-spacing:.02em;cursor:pointer}
.btn-primary,.btn.bg{background:var(--gold);color:#000;border-color:var(--gold)}
.btn-primary:hover,.btn.bg:hover{background:var(--gold-dark);text-decoration:none}
.btn-outline{background:transparent;color:var(--gold);border-color:var(--gold)}
.btn-outline:hover{background:rgba(245,197,24,.1)}
.cta-bar{margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}

/* ── TRUST / STAT BAR ── */
.trust{display:flex;flex-wrap:wrap;gap:24px;margin:32px 0;padding:20px;background:rgba(245,197,24,.04);border:1px solid rgba(245,197,24,.12);border-radius:12px}
.trust span{font-size:.85rem;color:rgba(255,255,255,.6)}
.trust strong{color:var(--gold)}

/* ── SERVICES LIST ── */
.services{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin:16px 0 28px}
.services li{padding:10px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;font-size:.93rem;color:rgba(255,255,255,.75)}
.services li strong{color:var(--gold)}

/* ── PRICING TABLE ── */
.pricing-table{width:100%;border-collapse:collapse;margin:16px 0 28px}
.pricing-table th,.pricing-table td{padding:12px 16px;text-align:left;border-bottom:1px solid var(--border);font-size:.93rem}
.pricing-table th{color:var(--gold);font-family:var(--H);font-weight:700;background:rgba(245,197,24,.04)}
.pricing-table td{color:rgba(255,255,255,.7)}
.pricing-table tr:hover td{background:rgba(255,255,255,.02)}

/* ── FAQ ITEMS ── */
.faq-item{margin:18px 0;padding:18px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:10px}
.faq-item h3{margin:0 0 8px;font-size:1rem;color:var(--gold);font-family:var(--H)}
.faq-item p{font-size:.92rem;color:rgba(255,255,255,.65);margin:0}

/* ── BREADCRUMB ── */
.breadcrumb{padding:12px 0;color:rgba(255,255,255,.4);font-size:.85rem}
.breadcrumb a{color:rgba(255,255,255,.5);text-decoration:none}
.breadcrumb a:hover{color:var(--gold)}

/* ── RELATED LINKS ── */
.related-links{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0 28px}
.related-links a{color:var(--gold);text-decoration:none;font-size:.9rem;padding:6px 14px;border:1px solid rgba(245,197,24,.25);border-radius:6px;transition:.2s}
.related-links a:hover{background:rgba(245,197,24,.1)}

/* ── SUPPLEMENTAL IMAGE ── */
.supp-image-block{margin:2.5rem 0;border-radius:8px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.supp-image-block img{width:100%;height:auto;max-height:420px;object-fit:cover;display:block}
.supp-image-block figcaption{background:#1a1a1a;color:rgba(255,255,255,.6);font-size:13px;padding:10px 16px;letter-spacing:.5px}

/* ── GMB BADGE ── */
.gmb-hdr{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid rgba(245,197,24,.4);border-radius:999px;background:rgba(245,197,24,.08);text-decoration:none}
.gmb-hdr span{color:var(--gold);font-family:var(--H);font-weight:700;font-size:.82rem;line-height:1}

/* ── GMB MAP BLOCK ── */
.gmb-map{margin:40px 0;padding:28px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:14px}
.gmb-map h2{margin:0 0 16px}
.gmb-map iframe{border:0;border-radius:10px;display:block;margin-bottom:16px}

/* ── FOOTER ── */
footer{background:#111;border-top:1px solid var(--border);padding:40px 24px;margin-top:60px}
.footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px}
.footer-inner h4{color:var(--gold);font-family:var(--H);margin-bottom:12px;font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
.footer-inner a{display:block;color:rgba(255,255,255,.5);text-decoration:none;font-size:.88rem;padding:3px 0;transition:.12s}
.footer-inner a:hover{color:var(--gold)}
.footer-inner p{color:rgba(255,255,255,.5);font-size:.88rem;line-height:1.5;margin-bottom:6px}
.footer-bottom{text-align:center;color:rgba(255,255,255,.4);font-size:.78rem;margin-top:32px;padding-top:20px;border-top:1px solid var(--border)}

/* ── RESPONSIVE ── */
@media(max-width:1300px){.hright .hsm{display:none}}
@media(max-width:900px){.hright .gmb-header{display:none}}
@media(max-width:768px){
  nav{display:none}
  .hambtn{display:block}
  .hright .gmb-header,.hright .hsm{display:none}
  .content{padding:40px 16px}
  .pricing-table{font-size:.85rem}
  .cta-bar{flex-direction:column;align-items:flex-start}
  .page-hero-banner{height:260px}
  .page-hero-banner .hero-text{left:24px;bottom:28px}
  .page-hero-banner .hero-h1{font-size:clamp(28px,8vw,48px)}
}
/* ── FONT DISPLAY SWAP ── */
@font-face{font-display:swap}
.hright{min-height:40px}.hbar{min-height:64px}.cv{min-width:4ch;display:inline-block}"""


# ── 2. FIND ALL HTML FILES ─────────────────────────────────────────────────────
base = '/home/ubuntu/cfwforever/public'

# directory-based pages
dir_pages = glob.glob(f'{base}/**/index.html', recursive=True)
# flat .html files (not index.html in root)
flat_pages = glob.glob(f'{base}/**/*.html', recursive=True)
flat_pages += glob.glob(f'{base}/*.html')

all_pages = list(set(dir_pages + flat_pages))
print(f'Total HTML files found: {len(all_pages)}')


# ── 3. DETERMINE WHICH PAGES NEED THE CSS INJECTED ────────────────────────────
def needs_fix(content):
    has_root = ':root{' in content or ':root {' in content
    has_body_bg = 'body{background' in content or 'body {background' in content
    # If the page already has the full design system, skip it
    if has_root and has_body_bg:
        return False
    return True


# ── 4. REPAIR FUNCTION ────────────────────────────────────────────────────────
def repair_page(path, content):
    """
    Strategy:
    1. Remove any existing incomplete inline <style> blocks that only contain
       hero-banner or font-face stubs (but NOT the full design system).
    2. Remove the site.css <link> tag (we're embedding everything inline now).
    3. Inject the canonical CSS as the FIRST <style> block right after <head>.
    """
    # Remove the site.css link tag (no longer needed — CSS is inline)
    content = re.sub(r'\s*<link[^>]+href=["\'][^"\']*site\.css["\'][^>]*>', '', content)

    # Remove any existing <style> blocks that are clearly stubs / incomplete
    # (they don't contain :root but do contain hero-banner or font-display or hright)
    def is_stub_style(block):
        has_root = ':root{' in block or ':root {' in block
        if has_root:
            return False  # keep full blocks
        stub_markers = ['.page-hero-banner', '@font-face{font-display', '.hright{min-height', '.hbar{min-height']
        return any(m in block for m in stub_markers)

    def remove_stub_styles(c):
        result = []
        pos = 0
        for m in re.finditer(r'<style[^>]*>(.*?)</style>', c, re.DOTALL):
            if is_stub_style(m.group(1)):
                result.append(c[pos:m.start()])
                pos = m.end()
            # else keep it
        result.append(c[pos:])
        return ''.join(result)

    content = remove_stub_styles(content)

    # Inject canonical CSS right after <head>
    canonical_block = f'<style>{CANONICAL_CSS}</style>\n'
    content = content.replace('<head>', f'<head>\n{canonical_block}', 1)

    return content


# ── 5. PROCESS ALL PAGES ──────────────────────────────────────────────────────
fixed = 0
skipped = 0
errors = []

for path in sorted(all_pages):
    try:
        with open(path, encoding='utf-8') as f:
            content = f.read()

        if not needs_fix(content):
            skipped += 1
            continue

        new_content = repair_page(path, content)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        fixed += 1
        rel = path.replace(base + '/', '')
        print(f'  FIXED: {rel}')

    except Exception as e:
        errors.append((path, str(e)))

print(f'\n✅ Fixed: {fixed}  |  Skipped (already good): {skipped}  |  Errors: {len(errors)}')
for p, e in errors:
    print(f'  ERROR {p}: {e}')
