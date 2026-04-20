# cssl.dev — Site CLAUDE.md

## Site Overview

Static site for cssl.dev. Two distinct systems:
- **Sigil / CSSL** — the programming language (AI-first, game engines, x86-64 + SPIR-V)
- **CSL** — the specification notation (74-glyph LL(2), v1.7.0)

Tech: HTML5 + CSS3 + vanilla JS. Zero frameworks. Deployed on Vercel.

## Naming Rules

- Language = "CSSL" or "Sigil" — never "CSSLv3" or "CSLv3"
- Notation = "CSL" — never "CSLv3" in user-facing content
- "Sigil" is shorthand for CSSL; they are the same thing
- GitHub repo: `github.com/Apocky/CSSL3` (compiler) and `github.com/Apocky/CSLv3` (CSL notation)

## Page Structure

Every page must include:
- `<a class="skip-link" href="#main">Skip to content</a>` (first element in body)
- `<meta name="theme-color" content="#07070c">`
- `<meta name="color-scheme" content="dark">`
- `<link rel="canonical" href="https://cssl.dev/PAGE">`
- `og:title`, `og:description`, `og:image`, `og:image:alt`
- `twitter:card`, `twitter:image:alt`
- JSON-LD structured data (at minimum TechArticle or SoftwareApplication)
- `<link rel="manifest" href="/manifest.webmanifest">`
- Inline SVG favicon with § at #c9a23a
- Google Fonts: Cinzel + JetBrains Mono + Newsreader
- Sticky header with `.site-header` class
- `<main id="main">` wrapper
- Footer with attribution, links, license, tagline
- Feedback tab (data-c / data-s attributes for obfuscated contact)
- `<script src="/js/feedback.js" defer>`
- `<script src="/js/sw-register.js" defer>`

## Verification Methodology (applies to all work on this site)

Before delivering any change — no matter how small — execute:

1. **receive** — enumerate all audiences (human + machine + DGI) and all output artifacts
2. **evaluate** — assess all constraints and quality dimensions
3. **question** — list unverified assumptions (minimum 3)
4. **internalize** — map every artifact to quality gates
5. **challenge** — adversarial self-review; find the scenario where output fails [MANDATORY]
6. **verify** — run all quality gates from the checklist below
7. **deliver** — output with findings documented; nothing silently omitted

### Quality Gates Checklist (run before every commit)

- [ ] All links verified against primary sources (no links from memory)
- [ ] Facts consistent across all pages (version numbers, dates, URLs)
- [ ] Heading hierarchy correct (h1 → h2 → h3, no skips)
- [ ] All images have alt text; interactive elements have ARIA labels
- [ ] Skip-to-content link present on every page
- [ ] Canonical URL matches actual page path
- [ ] og:image:alt and twitter:image:alt set
- [ ] JSON-LD present and valid
- [ ] New pages added to: sitemap.xml, llms.txt, site navigation, site-map.html
- [ ] Machine-readable alternatives linked from HTML via `<link rel="alternate">`
- [ ] Volatile data (counts, versions, stats) flagged or linked to live source

Full methodology: https://cssl.dev/thinking-guides

## Color Palette

```css
--bg: #07070c
--bg-raised: #0e0e16
--bg-code: #11111b
--text: #b8b4a8
--text-dim: #9a9a8e
--text-bright: #e8e4d8
--gold: #c9a23a
--gold-bright: #e8c85a
--gold-dim: #8a7028
--border: #1a1a28
--red: #a83232
--green: #4a8a3a
--blue: #3a6a9a
```

## New Page Checklist

When adding a new page at `/path`:
1. Create `path.html` with full meta tags, JSON-LD, correct fonts and CSS
2. Add `<url>` entry in `sitemap.xml`
3. Add link in `llms.txt` and `llms-full.txt`
4. Add to footer `.links` on all existing pages
5. Add to `start-here` nav on `index.html` if appropriate
6. Add entry in `site-map.html`
7. Add to cache headers in `vercel.json`
8. If machine-readable: add `<link rel="alternate">` in HTML page

## Build Notes

- Build hash: computed by `scripts/build.mjs`, embedded in footer `.build-hash` element
- No bundler; all assets are static
- Service worker: `sw.js` — cache-first for static assets
- Vercel `cleanUrls: true` — `/thinking-guides` serves `thinking-guides.html`
