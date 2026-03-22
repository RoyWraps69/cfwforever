#!/usr/bin/env python3
"""Append missing service-page CSS classes to site.css"""

css_path = '/home/ubuntu/cfwforever/public/css/site.css'

with open(css_path, encoding='utf-8') as f:
    existing = f.read()

if '.footer-inner' in existing:
    print('Already present — skipping')
    exit(0)

addition = """
/* ── SERVICE PAGE LAYOUT ────────────────────────────────────── */
.content{max-width:900px;margin:0 auto;padding:60px 24px}
.body-text{font-size:.97rem;color:rgba(255,255,255,.7);line-height:1.7;margin-bottom:18px}
.speakable{font-size:1.05rem;color:rgba(255,255,255,.78);line-height:1.72}
/* ── TRUST / STAT BAR ───────────────────────────────────────── */
.trust{display:flex;flex-wrap:wrap;gap:24px;margin:32px 0;padding:20px;background:rgba(245,197,24,.04);border:1px solid rgba(245,197,24,.12);border-radius:12px}
.trust span{font-size:.85rem;color:rgba(255,255,255,.6)}
.trust strong{color:var(--gold)}
/* ── SERVICES LIST ──────────────────────────────────────────── */
.services{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin:16px 0 28px}
.services li{padding:10px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;font-size:.93rem;color:rgba(255,255,255,.75)}
.services li strong{color:var(--gold)}
/* ── PRICING TABLE ──────────────────────────────────────────── */
.pricing-table{width:100%;border-collapse:collapse;margin:16px 0 28px}
.pricing-table th,.pricing-table td{padding:12px 16px;text-align:left;border-bottom:1px solid var(--border);font-size:.93rem}
.pricing-table th{color:var(--gold);font-family:var(--H);font-weight:700;background:rgba(245,197,24,.04)}
.pricing-table td{color:rgba(255,255,255,.7)}
.pricing-table tr:hover td{background:rgba(255,255,255,.02)}
/* ── FAQ ITEMS ──────────────────────────────────────────────── */
.faq-item{margin:18px 0;padding:18px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:10px}
.faq-item h3{margin:0 0 8px;font-size:1rem;color:var(--gold,#F5C518);font-family:var(--H)}
.faq-item p{font-size:.92rem;color:rgba(255,255,255,.65);margin:0}
/* ── SERVICE PAGE BUTTONS ───────────────────────────────────── */
.btn-primary{background:var(--gold);color:#000;border-color:var(--gold)}
.btn-primary:hover{background:#e0b000}
.btn-est{display:inline-flex;align-items:center;padding:9px 18px;border-radius:8px;font-family:var(--H);font-size:.82rem;font-weight:800;text-decoration:none;background:var(--gold);color:#000}
.cta-bar{margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
/* ── BREADCRUMB ─────────────────────────────────────────────── */
.breadcrumb{padding:12px 0;color:rgba(255,255,255,.4);font-size:.85rem}
.breadcrumb a{color:rgba(255,255,255,.5);text-decoration:none}
.breadcrumb a:hover{color:var(--gold)}
/* ── RELATED LINKS ──────────────────────────────────────────── */
.related-links{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0 28px}
.related-links a{color:var(--gold);text-decoration:none;font-size:.9rem;padding:6px 14px;border:1px solid rgba(245,197,24,.25);border-radius:6px;transition:.2s}
.related-links a:hover{background:rgba(245,197,24,.1)}
/* ── SUPPLEMENTAL IMAGE BLOCK ───────────────────────────────── */
.supp-image-block{margin:2.5rem 0;border-radius:8px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.supp-image-block img{width:100%;height:auto;max-height:420px;object-fit:cover;display:block}
.supp-image-block figcaption{background:#1a1a1a;color:rgba(255,255,255,.6);font-size:13px;padding:10px 16px;letter-spacing:.5px}
/* ── FOOTER SERVICE PAGE VARIANT ───────────────────────────── */
.footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px}
.footer-inner h4{color:var(--gold);font-family:var(--H);margin-bottom:12px;font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
.footer-inner a{display:block;color:rgba(255,255,255,.5);text-decoration:none;font-size:.88rem;padding:3px 0;transition:.12s}
.footer-inner a:hover{color:var(--gold)}
.footer-inner p{color:rgba(255,255,255,.5);font-size:.88rem;line-height:1.5;margin-bottom:6px}
.footer-bottom{text-align:center;color:rgba(255,255,255,.4);font-size:.78rem;margin-top:32px;padding-top:20px;border-top:1px solid var(--border)}
/* ── GMB HEADER BADGE (service pages) ──────────────────────── */
.gmb-hdr{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid rgba(245,197,24,.4);border-radius:999px;background:rgba(245,197,24,.08);text-decoration:none}
.gmb-hdr span{color:var(--gold);font-family:var(--H);font-weight:700;font-size:.82rem;line-height:1}
/* ── GMB MAP BLOCK ──────────────────────────────────────────── */
.gmb-map{margin:40px 0;padding:28px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:14px}
.gmb-map h2{margin:0 0 16px}
.gmb-map iframe{border:0;border-radius:10px;display:block;margin-bottom:16px}
/* ── SERVICE PAGE RESPONSIVE ────────────────────────────────── */
@media(max-width:768px){.content{padding:40px 16px}.pricing-table{font-size:.85rem}.cta-bar{flex-direction:column;align-items:flex-start}}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write(addition)

import subprocess
result = subprocess.run(['wc', '-l', css_path], capture_output=True, text=True)
print('Done. Lines now:', result.stdout.strip())
