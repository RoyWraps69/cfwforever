# CFW Scripts — Reusable Tooling

Tooling for rapid site-wide operations on RoyWraps69/cfwforever.  
**Always fetch and reuse. Don't rebuild.**

---

## Infrastructure Constants (embed in every script)

```python
TOKEN       = "<GITHUB_TOKEN_FROM_MEMORY>"   # no expiry
REPO        = "RoyWraps69/cfwforever"
BRANCH      = "main"
NETLIFY_HOOK = "https://api.netlify.com/build_hooks/69d4bc7aadc9eee597add807"
NETLIFY_PAT = "<NETLIFY_PAT_FROM_MEMORY>"
GA4_ID      = "G-54BP1GMYJ1"
GTM_ID      = "GTM-TJVKD4QZ"
```

## Files in This Directory

| File | Purpose |
|---|---|
| `page_factory.py` | `build_page(cfg)` — generates a full Type A CFW HTML page with 7-schema stack, hero, byline, FAQ, CTA, form hooks. Imports `chrome_header.html` + `chrome_footer.html`. |
| `chrome_header.html` | Extracted ticker + header nav block from fleet-wraps-chicago canonical template. Used as Type A header injection source. |
| `chrome_footer.html` | Extracted footer block (CFW address, phone, social links). |
| `chrome_scripts.html` | Closing JS scripts block. |
| `wrap_orphans.py` | Finds orphaned text between last `</footer>`/`</section>`/`</article>` and `</main>`, wraps in `<div class="content-wrap" style="max-width:960px;margin:0 auto;padding:0 24px">`. Call with `python3 wrap_orphans.py A` for Type A batch. |
| `cfw_swap.py` | Context-aware image swap — replaces CFW-branded van/truck photos with relevant client work based on page URL (hvac→SBC/Precision, electric→Arnold, rivian→rivian work, boat→Patron/1800 Tequila, etc.). |
| `remove_cfw_images.py` | Earlier pure-removal version (deprecated — use `cfw_swap.py`). |
| `build_marine_pages.py` | Builds the marine wraps hub page (sample usage of `page_factory.build_page`). |
| `build_subpages.py` | Builds the 4 marine sub-pages (yacht/jet-ski/pontoon/fishing-boat). |
| `build_consortium.py` | Builds the boat sponsorship marketplace page. |
| `build_design_labs.py` | Builds the /design-labs/ creative services hub. |

## Standard Workflow Pattern

```python
import urllib.request, json, base64, pickle, time

def gh(method, path, payload=None, retries=3):
    body = json.dumps(payload).encode() if payload else None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(f"https://api.github.com{path}", data=body, method=method,
                headers={"Authorization": f"token {TOKEN}", "User-Agent": "CFW",
                         "Accept":"application/vnd.github.v3+json", "Content-Type":"application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except Exception as e:
            if attempt == retries-1: raise
            time.sleep(1 + attempt)

def fetch_raw(path):
    url = f"https://raw.githubusercontent.com/{REPO}/main/{path}"
    req = urllib.request.Request(url, headers={"User-Agent":"CFW"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode('utf-8','ignore')
```

## CFW Page Type Classifier (from cfw-page-types skill)

```python
def diagnose(html):
    return {
        'has_head_close':  '</head>'       in html,
        'has_body':        '<body'         in html,
        'has_trib':        'class="trib"'  in html,
        'has_header':      '<header'       in html,
        'has_footer':      '<footer'       in html,
        'has_ga4':         'G-54BP1GMYJ1'  in html,
        'h1_count':        len(re.findall(r'<h1[^>]*>', html)),
        'size':            len(html),
    }

# Type A = full chrome + h1=1
# Type B = full chrome + h1>1 (duplicate H1)
# Type C = stub, size<20k, no chrome
# Type D = broken head (no </head>)
```

## Git Tree Batch Commit (handles 200+ files)

```python
def batch_commit(updates_dict, message, resume_cache='blob_cache.pkl'):
    """updates_dict: {repo_path: content_str}"""
    blob_map = {}
    if os.path.exists(resume_cache):
        with open(resume_cache,'rb') as f: blob_map = pickle.load(f)
    
    for path, content in updates_dict.items():
        if path in blob_map: continue
        blob = gh("POST", f"/repos/{REPO}/git/blobs", {
            "content": base64.b64encode(content.encode()).decode(), "encoding":"base64"})
        blob_map[path] = blob['sha']
        if len(blob_map) % 25 == 0:
            with open(resume_cache,'wb') as f: pickle.dump(blob_map, f)
        time.sleep(0.02)
    
    ref = gh("GET", f"/repos/{REPO}/git/ref/heads/{BRANCH}")
    base_sha = ref['object']['sha']
    base_commit = gh("GET", f"/repos/{REPO}/git/commits/{base_sha}")
    tree = gh("POST", f"/repos/{REPO}/git/trees", {
        "base_tree": base_commit['tree']['sha'],
        "tree": [{"path":p,"mode":"100644","type":"blob","sha":s} for p,s in blob_map.items()]
    })
    commit = gh("POST", f"/repos/{REPO}/git/commits", {
        "message": message, "tree": tree['sha'], "parents":[base_sha]
    })
    gh("PATCH", f"/repos/{REPO}/git/refs/heads/{BRANCH}", {"sha": commit['sha']})
    urllib.request.urlopen(urllib.request.Request(NETLIFY_HOOK, method="POST", data=b""), timeout=15)
    if os.path.exists(resume_cache): os.remove(resume_cache)
    return commit['sha']
```

## Hard Rules
- **Never use WeasyPrint.** Playwright/Chromium for HTML→PDF/JPG.
- **Blog author:** Always "Roy Wraps" (never "Roy Acosta").
- **Every post:** Full schema stack (Article+FAQPage+BreadcrumbList+Speakable+GEO+HowTo where applicable).
- **Append to CSS, never modify:** `public/css/site.v4.css` gets fix blocks appended only.
- **Batch commits 10+ files:** Git Tree API only. No individual PUT calls.
- **IndexNow key:** `b1d95b588bc440689702668f937d2cc5` (verified live).
