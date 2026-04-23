"""
CFW Marine Page Factory — generates full HTML pages matching CFW architecture.
Outputs Type A pages (full chrome, single H1, all schemas, GA4).
"""

HEADER = open('chrome_header.html').read()
FOOTER = open('chrome_footer.html').read()
SCRIPTS = open('chrome_scripts.html').read()

GA4 = '''<script async src="https://www.googletagmanager.com/gtag/js?id=G-54BP1GMYJ1"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-54BP1GMYJ1');</script>'''

GTM_HEAD = '''<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TJVKD4QZ');</script>'''

GTM_BODY = '''<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TJVKD4QZ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>'''

def build_page(cfg):
    """
    cfg keys:
      slug, title, meta_desc, h1, lead_html, hero_img, hero_alt,
      breadcrumbs: [(label, url), ...],
      sections_html: str,  (main body content)
      faqs: [(q, a), ...],
      howto_steps: [(name, text), ...] | None,
      price_summary: str,
      keywords: str,
      date_published, date_modified,
      article_keywords: str,
      article_section: str,
      servicesDescription: str,
    """
    s = cfg
    canonical = f"https://chicagofleetwraps.com/{s['slug']}/"
    
    # Build schema blocks
    schemas = []
    
    # 1. Article
    schemas.append({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": f"{canonical}#article",
        "headline": s['h1'],
        "description": s['meta_desc'],
        "image": {
            "@type": "ImageObject",
            "url": f"https://chicagofleetwraps.com{s['hero_img']}",
            "width": 1200,
            "height": 420
        },
        "author": {
            "@type": "Person",
            "@id": "https://chicagofleetwraps.com/#roy-wraps",
            "name": "Roy Wraps",
            "jobTitle": "Founder & Master Installer",
            "worksFor": {"@type": "Organization", "name": "Chicago Fleet Wraps"},
            "url": "https://chicagofleetwraps.com/about/"
        },
        "publisher": {
            "@type": "Organization",
            "@id": "https://chicagofleetwraps.com/#organization",
            "name": "Chicago Fleet Wraps",
            "logo": {"@type": "ImageObject", "url": "https://chicagofleetwraps.com/images/logo-horizontal.webp"}
        },
        "datePublished": s['date_published'],
        "dateModified": s['date_modified'],
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "articleSection": s['article_section'],
        "keywords": s['article_keywords']
    })
    
    # 2. WebPage with Speakable
    schemas.append({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{canonical}#webpage",
        "url": canonical,
        "name": s['title'],
        "description": s['meta_desc'],
        "inLanguage": "en-US",
        "isPartOf": {"@type": "WebSite", "@id": "https://chicagofleetwraps.com/#website"},
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".lead.speakable", ".aeo-answer", "h1"]
        }
    })
    
    # 3. BreadcrumbList
    schemas.append({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i+1, "name": label, "item": f"https://chicagofleetwraps.com{url}"}
            for i, (label, url) in enumerate(s['breadcrumbs'])
        ]
    })
    
    # 4. LocalBusiness (CFW)
    schemas.append({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://chicagofleetwraps.com/#organization",
        "name": "Chicago Fleet Wraps",
        "image": "https://chicagofleetwraps.com/images/logo-horizontal.webp",
        "telephone": "(312) 597-1286",
        "priceRange": "$$-$$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "4711 N Lamon Ave #7",
            "addressLocality": "Chicago",
            "addressRegion": "IL",
            "postalCode": "60630",
            "addressCountry": "US"
        },
        "geo": {"@type": "GeoCoordinates", "latitude": 41.9617, "longitude": -87.7411},
        "url": "https://chicagofleetwraps.com/",
        "openingHours": ["Mo-Fr 08:00-17:00", "Sa 09:00-14:00"],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "49"
        }
    })
    
    # 5. FAQPage
    if s.get('faqs'):
        schemas.append({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {"@type": "Answer", "text": a}
                }
                for q, a in s['faqs']
            ]
        })
    
    # 6. HowTo (optional)
    if s.get('howto_steps'):
        schemas.append({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "@id": f"{canonical}#howto",
            "name": s.get('howto_name', f"How to Choose {s['h1']}"),
            "description": s.get('howto_desc', ''),
            "step": [
                {
                    "@type": "HowToStep",
                    "position": i+1,
                    "name": name,
                    "text": text
                }
                for i, (name, text) in enumerate(s['howto_steps'])
            ]
        })
    
    # 7. Service
    schemas.append({
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": f"{canonical}#service",
        "serviceType": s['article_section'],
        "provider": {"@type": "LocalBusiness", "@id": "https://chicagofleetwraps.com/#organization"},
        "areaServed": [
            {"@type": "City", "name": "Chicago"},
            {"@type": "AdministrativeArea", "name": "Cook County"},
            {"@type": "AdministrativeArea", "name": "DuPage County"},
            {"@type": "AdministrativeArea", "name": "Lake County"}
        ],
        "description": s.get('servicesDescription', s['meta_desc']),
        "url": canonical
    })
    
    import json
    schema_html = '\n'.join(
        f'<script type="application/ld+json">\n{json.dumps(sc, indent=2)}\n</script>'
        for sc in schemas
    )
    
    # Build FAQ visible section
    faq_html = ''
    if s.get('faqs'):
        faq_items = '\n'.join(
            f'''<div class="faq-item" itemscope itemtype="https://schema.org/Question" style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,.08)">
<h3 itemprop="name" style="font-size:1.1rem;color:#FFD700;margin-bottom:10px">{q}</h3>
<div itemscope itemtype="https://schema.org/Answer" itemprop="acceptedAnswer">
<p itemprop="text" class="aeo-answer" style="color:rgba(255,255,255,.75);line-height:1.65">{a}</p>
</div>
</div>'''
            for q, a in s['faqs']
        )
        faq_html = f'''
<section class="faq-section" style="margin:60px auto;max-width:900px;padding:40px 24px;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06)">
<h2 style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:2rem;color:#FFD700;margin-bottom:24px">Frequently Asked Questions</h2>
{faq_items}
</section>'''
    
    # Author byline
    byline = f'''
<div class="author-byline" style="margin:20px auto 32px;max-width:900px;padding:16px 24px;border-left:3px solid #FFD700;background:rgba(255,215,0,.04);border-radius:4px">
  <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    <div style="flex:1;min-width:260px">
      <div style="font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:4px">Written by</div>
      <div style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:1.25rem;color:#FFD700;line-height:1.2">Roy Wraps</div>
      <div style="font-size:.85rem;color:rgba(255,255,255,.7);margin-top:2px">Founder &amp; Master Installer · Chicago Fleet Wraps</div>
    </div>
    <div style="font-size:.82rem;color:rgba(255,255,255,.55);line-height:1.5">
      24+ years wrapping · 9,400+ installs · 200+ marine vessels · 3M &amp; Avery Dennison certified<br>
      <span style="color:rgba(255,255,255,.4)">Published {s['date_published']} · Updated {s['date_modified']}</span>
    </div>
  </div>
</div>'''
    
    # Build hero banner
    hero_html = f'''<section class="page-hero-banner" style="position:relative;width:100%;height:420px;overflow:hidden">
<img alt="{s['hero_alt']}" fetchpriority="high" height="420" loading="eager" src="{s['hero_img']}" style="width:100%;height:420px;object-fit:cover" width="1200"/>
<div class="phb-overlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,rgba(0,0,0,.75),rgba(0,0,0,.35));padding:0 24px">
<h1 style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:clamp(1.8rem,4vw,3rem);color:#FFD700;text-align:center;line-height:1.1;max-width:1000px;text-shadow:0 2px 8px rgba(0,0,0,.6)">{s['h1']}</h1>
</div>
</section>'''
    
    # Assemble full HTML
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<meta content="nosniff" http-equiv="X-Content-Type-Options"/>
<meta content="strict-origin-when-cross-origin" name="referrer"/>
<title>{s['title']}</title>
<meta name="description" content="{s['meta_desc']}"/>
<meta name="keywords" content="{s['keywords']}"/>
<meta name="author" content="Roy Wraps"/>
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/>
<link rel="canonical" href="{canonical}"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="apple-touch-icon" href="/favicon.png"/>

<!-- OG -->
<meta property="og:type" content="article"/>
<meta property="og:title" content="{s['title']}"/>
<meta property="og:description" content="{s['meta_desc']}"/>
<meta property="og:url" content="{canonical}"/>
<meta property="og:image" content="https://chicagofleetwraps.com{s['hero_img']}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:site_name" content="Chicago Fleet Wraps"/>
<meta property="og:locale" content="en_US"/>
<meta property="article:published_time" content="{s['date_published']}"/>
<meta property="article:modified_time" content="{s['date_modified']}"/>
<meta property="article:author" content="Roy Wraps"/>
<meta property="article:section" content="{s['article_section']}"/>

<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{s['title']}"/>
<meta name="twitter:description" content="{s['meta_desc']}"/>
<meta name="twitter:image" content="https://chicagofleetwraps.com{s['hero_img']}"/>

<!-- Geo -->
<meta name="geo.region" content="US-IL"/>
<meta name="geo.placename" content="Chicago"/>
<meta name="geo.position" content="41.9617;-87.7411"/>
<meta name="ICBM" content="41.9617, -87.7411"/>

<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="/css/site.v4.css"/>

{GTM_HEAD}

<!-- SCHEMA STACK -->
{schema_html}

{GA4}
</head>
<body style="background:#0A0A0A;color:#fff">
{GTM_BODY}
{HEADER}
<main>
{hero_html}
<div class="container" style="max-width:1200px;margin:0 auto;padding:40px 24px">
<nav aria-label="Breadcrumb" class="breadcrumb" style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:20px">
{' › '.join(f'<a href="{url}" style="color:rgba(255,255,255,.7)">{label}</a>' if i < len(s['breadcrumbs'])-1 else f'<span>{label}</span>' for i, (label, url) in enumerate(s['breadcrumbs']))}
</nav>

{s['lead_html']}

{byline}

{s['sections_html']}

{faq_html}

<section class="cta-block" style="margin:60px auto;max-width:900px;padding:40px 32px;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.02));border:1px solid rgba(255,215,0,.25);border-radius:12px;text-align:center">
<h2 style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:2rem;color:#FFD700;margin-bottom:16px">Ready to Get Your Boat Wrapped?</h2>
<p style="color:rgba(255,255,255,.8);margin-bottom:24px;max-width:600px;margin-left:auto;margin-right:auto">Text or call <strong>(312) 597-1286</strong> for a same-day estimate. Free pickup from Chicago harbors. Design included. 2-year warranty.</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
<a href="tel:3125971286" style="display:inline-block;padding:14px 32px;background:#FFD700;color:#000;font-family:var(--H,'Bebas Neue',sans-serif);font-weight:900;font-size:1rem;letter-spacing:.05em;text-decoration:none;border-radius:4px">Call (312) 597-1286</a>
<a href="/estimate/" style="display:inline-block;padding:14px 32px;background:transparent;color:#FFD700;border:2px solid #FFD700;font-family:var(--H,'Bebas Neue',sans-serif);font-weight:900;font-size:1rem;letter-spacing:.05em;text-decoration:none;border-radius:4px">Get Free Estimate</a>
</div>
</section>

</div>
</main>
{FOOTER}
{SCRIPTS}
</body>
</html>'''
    
    return html

print("Factory loaded")
