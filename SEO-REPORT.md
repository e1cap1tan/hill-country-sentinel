# Hill Country Sentinel — SEO Optimization Report
*Generated: February 20, 2026*

---

## ✅ Already Implemented (deployed to GitHub Pages)

### Critical Foundations
- **sitemap.xml** — Complete XML sitemap with all 32 pages (homepage, find-my-officials, 30 candidate profiles). Proper priority settings and change frequencies. Submitted path: `https://e1cap1tan.github.io/hill-country-sentinel/sitemap.xml`
- **robots.txt** — Allows all search engines, points to sitemap
- **Canonical URLs** — Added to homepage, find-my-officials, and profile pages (prevents duplicate content indexing)
- **Meta descriptions enhanced** — Local SEO keywords ("New Braunfels, TX", "Comal County") added to key pages
- **Page titles improved** — Homepage now includes "New Braunfels & Comal County Political News"

### Structured Data (Schema.org)
- **NewsMediaOrganization** — Identifies site as a local news source to Google
- **WebSite schema** — Enables sitelinks search box in Google results
- **NewsArticle schema** — Auto-injected via JS for all feed articles (makes articles eligible for Google News Top Stories carousel)
- **Person schema** — On Toni Carter and Kristen Hoyt profile pages (rich snippets for candidates in search results)
- **BreadcrumbList schema** — On profile pages (helps Google understand site structure)

### Social / Open Graph
- **Open Graph tags** — Complete OG implementation for Facebook sharing on all pages
- **Twitter Card tags** — Optimized previews for X/Twitter sharing
- **Profile-specific social tags** — Each candidate page gets its own unique preview

### Performance (Core Web Vitals)
- **defer attributes** added to JS files — Improves Largest Contentful Paint (LCP) score
- **loading="lazy"** added to candidate images below fold — Reduces initial page weight
- Estimated **15–25% improvement** in PageSpeed score

---

## 🟡 Remaining — Requires Clayton's Action

### 1. Google Search Console Setup ⭐ HIGHEST PRIORITY
**What it is:** Free Google tool — lets you see exactly how you rank, what keywords drive traffic, index coverage, and fix crawl errors.

**Steps:**
1. Go to https://search.google.com/search-console
2. Add property → URL prefix → `https://e1cap1tan.github.io/hill-country-sentinel/`
3. Verify via HTML meta tag (placeholder already in index.html — just replace `GOOGLE_VERIFICATION_CODE` with the code Google gives you)
4. Submit sitemap: paste `https://e1cap1tan.github.io/hill-country-sentinel/sitemap.xml`

**Why it matters:** Without this, you're flying blind. GSC shows you if Google can index your pages, which queries bring people to your site, and any technical errors.

### 2. Google Business Profile (Local SEO)
**What it is:** Creates a presence in Google Maps and the local knowledge panel for searches like "New Braunfels politics news."

**Steps:**
1. Go to https://business.google.com
2. Create profile for "Hill Country Sentinel"
3. Category: "News & Media Website" or "Local News"
4. Add address (can use PO Box or general New Braunfels, TX)
5. Link to the website

**Why it matters:** Signals local relevance to Google. Can appear in "near me" searches.

### 3. Remaining Profile Pages Need Schema
The SEO sub-agent fully updated only 2 profile pages (Toni Carter, Kristen Hoyt) with Person schema + breadcrumbs. A script was created at `scripts/seo-update-profiles.sh` to apply the same treatment to all remaining profiles.

**Fred can run this when ready:** `bash scripts/seo-update-profiles.sh`

### 4. Custom Domain (Medium-term)
**Current URL:** `e1cap1tan.github.io/hill-country-sentinel/` — GitHub subdomain, not ideal for branding or SEO authority.

**Recommendation:** Register `hillcountrysentinel.com` (~$12/yr on Namecheap/Cloudflare) and point it to GitHub Pages. This:
- Builds domain authority over time (GitHub subdomain shares authority with all GitHub Pages sites)
- Makes the site look credible to readers and sources
- Improves brand recognition in search results

**Fred can handle the GitHub Pages config once you have a domain.**

### 5. Content Velocity (Ongoing — Most Important Long-Term)
**The single biggest SEO factor:** Fresh, original, locally-relevant content published consistently.

Google rewards sites that:
- Publish frequently (even 2–3 articles/week)
- Cover hyper-local topics nobody else covers
- Use specific names, places, dates (Comal County, New Braunfels City Council, specific candidate names)

**The Sentinel pipeline is already set up for this** — the 8am/5pm cron runs. The more original articles we publish, the faster rankings grow.

---

## 📊 Estimated SEO Impact by Category

| Item | Impact | Effort | Status |
|------|--------|--------|--------|
| sitemap.xml + robots.txt | 🔴 Critical | Low | ✅ Done |
| Canonical URLs | 🔴 Critical | Low | ✅ Done |
| Schema structured data | 🟠 High | Medium | ✅ Partial (2 profiles done) |
| Open Graph / Twitter Cards | 🟡 Medium | Low | ✅ Done |
| Core Web Vitals (defer/lazy) | 🟡 Medium | Low | ✅ Done |
| Google Search Console | 🔴 Critical | Low (10 min) | ❌ Needs Clayton |
| Google Business Profile | 🟠 High | Low (20 min) | ❌ Needs Clayton |
| Remaining profile schemas | 🟡 Medium | Low (script ready) | ❌ Fred runs script |
| Custom domain | 🟡 Medium | Medium | ❌ Needs domain purchase |
| Content velocity | 🔴 Critical | Ongoing | 🔄 Pipeline running |

---

## 🎯 Target Keywords
- "New Braunfels politics"
- "Comal County elections 2026"
- "New Braunfels city council"
- "Comal County commissioner"
- Individual candidate names (Neal Linnartz, Toni Carter, etc.)
- "Hill Country Sentinel"
- "New Braunfels news"

---

*Save this file. All implemented changes are live. Remaining items flagged for next week.*
