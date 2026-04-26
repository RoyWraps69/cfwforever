# CFW Bing Reindex — Action Manual

## What's broken

Bing isn't indexing the site. Three blockers:

1. **Site is not verified in Bing Webmaster Tools.** No `msvalidate.01` meta, no `BingSiteAuth.xml`. Without verification, BWT shows zero data and IndexNow rejects submissions with `403 UserForbiddedToAccessSite`.
2. **No URL submissions** ever made to Bing's URL Submission API.
3. **Stale Wix-era URLs in Bing's index** from the pre-Netlify site (`/site.html`, `/about-1`, `/post/...`). They 301 correctly now but Bing hasn't recrawled.

The site is technically clean otherwise: robots.txt OK, sitemap reachable, www→non-www redirects, HTTPS, valid HTML, all schemas parse.

---

## What's already done in this commit

- ✅ `<meta name="msvalidate.01" content="BING_VERIFICATION_TOKEN_PLACEHOLDER"/>` injected into all 286 HTML pages, ready for one find/replace once Roy has the real token
- ✅ Defensive `<meta name="bingbot">` and `<meta name="msnbot">` directives on every page
- ✅ `BingSiteAuth.xml` stub at `public/BingSiteAuth.xml` — replace with real one from BWT
- ✅ `tools/cfw-scripts/bing_reindex.py` — local CLI to submit all 273 URLs

---

## Roy's action steps (15 minutes, must do in this order)

### 1. Verify the site in Bing Webmaster Tools

Pick ONE method. XML file is fastest.

**XML file method (recommended):**
1. Sign in: <https://www.bing.com/webmasters>
2. Click "Add a Site" → enter `https://chicagofleetwraps.com/`
3. Choose verification method: **XML file**
4. Download `BingSiteAuth.xml`
5. In repo: replace `public/BingSiteAuth.xml` with the downloaded file
6. Commit + push (Netlify will deploy in ~90 seconds)
7. Verify the file is live: `curl -I https://chicagofleetwraps.com/BingSiteAuth.xml`
8. Click "Verify" in BWT

**Meta tag method (alternative):**
1. Sign in to BWT, add site, choose "HTML Meta Tag"
2. Copy the 16-char token (looks like `A1B2C3D4E5F6G7H8`)
3. In repo, find/replace across all HTML:
   ```
   BING_VERIFICATION_TOKEN_PLACEHOLDER → <token>
   ```
4. Commit + push, then click "Verify"

### 2. Submit sitemap

In BWT after verification:
- Sitemaps → Submit Sitemap → `https://chicagofleetwraps.com/sitemap.xml`

### 3. Run the bulk URL submission

```bash
cd ~/Code/cfwforever  # or wherever the repo is
python3 tools/cfw-scripts/bing_reindex.py
```

This submits all 273 URLs via Bing Webmaster API + IndexNow. Quota is 10,000/month — plenty.

### 4. (Optional) Re-submit only recently-changed URLs

```bash
python3 tools/cfw-scripts/bing_reindex.py --recent --days=7
```

### 5. (Optional) Re-submit specific URLs

```bash
python3 tools/cfw-scripts/bing_reindex.py --urls=https://chicagofleetwraps.com/elk-grove-village/,https://chicagofleetwraps.com/oak-brook/
```

---

## Verifying it worked

24–48 hours after step 3:

1. **BWT → URL Inspection** — paste any URL, should show "Discovered" or "Crawled"
2. **BWT → Performance** — impressions should start showing
3. **`site:chicagofleetwraps.com` on bing.com** — page count should climb past current ~10 pages

---

## Why IndexNow was failing

IndexNow's `403 UserForbiddedToAccessSite` happens when:
- The host isn't yet verified at any participating engine, OR
- The key file is unreachable, OR
- The host has a reputation flag from prior issues (Wix duplicate domain era)

Step 1 above fixes #1. Step 3 cleans up #3 by giving Bing a fresh, complete sitemap of the new static site.

---

## Background: where the keys live

| Resource | Value | Where used |
|---|---|---|
| Bing Webmaster API key | `59b6acb9938a4733a1e234e858c38859` | `bing_reindex.py` |
| IndexNow key | `b1d95b588bc440689702668f937d2cc5` | `bing_reindex.py` + `public/b1d95b588bc440689702668f937d2cc5.txt` |
| IndexNow key file | `https://chicagofleetwraps.com/b1d95b588bc440689702668f937d2cc5.txt` | served at root |

---

## If verification still fails after 24h

Two backup options:

1. **DNS TXT verification** (more durable than file):
   - In Cloudflare or DNS host: add TXT record at `chicagofleetwraps.com` with value provided by BWT
   - Wait 5–30 minutes for propagation
   - Click verify

2. **Import from Google Search Console** (BWT supports this directly):
   - In BWT, choose "Import sites from Google Search Console"
   - Sign in with the same Google account that owns GSC for this domain (`newcfwwebsite@gmail.com`)
   - Sites verified in GSC import as verified to BWT automatically
