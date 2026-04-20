# cssl-site

Static site for **cssl.dev** — the home of Sigil (AI-first game engine
language) and CSLv3 (density notation for spec-writing and AI reasoning).

Deployed on Vercel. Two primary routes:

- **`/`** — Sigil / CSSL landing page
- **`/CSLv3`** — full CSLv3 reference (glyph tables, grammar, worked examples)

## Layout

```
index.html              landing page (Sigil)
CSLv3.html              full reference page
js/                     client-side scripts (feedback, kbd-nav, search, etc.)
og/                     OpenGraph social card images
scripts/                build + deploy automation
manifest.webmanifest    PWA manifest
sw.js                   offline-first service worker
sitemap.xml             SEO
robots.txt              SEO
llms.txt                short summary for LLM indexers
llms-full.txt           complete /CSLv3 content in markdown (for AI citation)
vercel.json             deploy config (headers, cache, cleanUrls)
LICENSE                 MIT (covers code)
LICENSE-CONTENT         CC BY 4.0 (covers prose, specs, documentation)
```

## Build

`scripts/build.mjs` is the top-level build orchestrator. Current steps:

- `scripts/build-hash.mjs` — compute SHA-256 of each HTML file and embed it
  in the footer's `.build-hash` element. Re-run on every content change.

Planned (deferred):

- Font subsetting (Cinzel + Newsreader + JetBrains Mono → local woff2)
- OpenGraph image regeneration (`scripts/build-og.py` via Pillow)
- Minification (lightningcss + esbuild)

## Deploy

`vercel --prod` — Vercel auto-detects the static site. After production
deploy, run `node scripts/post-deploy.mjs` to submit the URLs to the
Wayback Machine (archival redundancy).

## Local preview

No build required for normal development. Open `index.html` or `CSLv3.html`
in a browser, or serve the directory with any static server:

```
npx serve .
# or
python -m http.server 8000
```

## Licenses

Code (HTML/CSS/JS/build scripts): MIT (`LICENSE`).
Content (prose, specs, documentation): CC BY 4.0 (`LICENSE-CONTENT`).

## Source of truth

The `/CSLv3` reference derives from the CSLv3 repository
(`github.com/ApockyCSSL/CSLv3`), specifically the `specs/` tree and
`CSLv3_ONBOARDING.md`. Changes to notation or spec content should land in
the upstream repo first, then flow into this site.

## Prime Directive

See `LICENSE-CONTENT` and the footer of every page. One-line version:
**consent = OS · density = sovereignty · violation = bug**.
