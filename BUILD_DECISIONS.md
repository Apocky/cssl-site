# cssl-site build decisions

Locked architectural decisions for cssl.dev. Source of truth for future sessions.

## Identity

- **Sigil ≡ CSSL** (same language, two names). CSSL = Caveman Sigil Substrate Language (full). Sigil = shorthand, proper-noun cased.
- **Sigil v1** was the legacy transpiler (`.si` → Odin + WGSL) used in LoA V11/V12. The current CSSL/Sigil compiler is its successor, emitting native x86-64 + SPIR-V directly.
- **CSLv3** is a separate notation system. Not a compiler language. Lives in its own repo.
- Never expand CSSL as "Spec/Signal Language" — common misdecode, wrong.
- Never write SIGIL in all-caps.

## Routes (2026-04-17 → CSSLv3 crystallization window)

- `/` — **temporary 307 redirect** → `/CSLv3` (flip off when CSSLv3 ships)
- `/CSLv3` — CSLv3 notation reference (`CSLv3.html`, primary content)
- `/sigil` — Sigil forward-design page (`sigil.html`, WIP banner visible)
- `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` — standard
- `/llms.txt`, `/llms-full.txt` — AI discoverability (llmstxt.org convention)
- `/sw.js` — service worker (scope `/`)

## TO UNDO THE TEMPORARY REDIRECT

When CSSLv3 ships and `/sigil` is ready to be the root again:

1. **`vercel.json`** — delete the `redirects` block entirely. Change the `/(sigil|CSLv3)` header source back to `/(|CSLv3)` if you want `/` to get the no-cache header (or keep it on `/sigil`).
2. **`index.html`** — replace the redirect stub with the contents of `sigil.html` (or `git mv sigil.html index.html && rm sigil.html`).
3. **`sitemap.xml`** — add `/` back at priority 1.0. Either demote or keep `/sigil` depending on whether you want both URLs indexed.
4. **`manifest.webmanifest`** — change `start_url` back to `/`.
5. **`llms.txt`** — remove the "temporary redirect" note and promote `/` back to primary.
6. **`sw.js`** — bump `CACHE` version string; replace `/sigil` with `/` in PRECACHE; restore `/` as the `networkFirst` fallback.
7. **`sigil.html`** — delete (or keep with a noindex meta if you want history preserved at that URL).
8. Remove the WIP banner from the restored root HTML (`<div class="wip-banner">` block + `.wip-banner` CSS rule).

## Redirect type: 307 vs 308

The `/` redirect uses `"permanent": false` → HTTP 307 Temporary Redirect. Chosen over 308 because:

- Search engines preserve `/sigil` PageRank at `/sigil` rather than forwarding it all to `/CSLv3`. When we flip it off, SEO recovery is instant.
- Clients that receive 308 may cache the redirect indefinitely — users would literally never be able to reach `/` again until their browser cache cleared.
- 307 is correctly understood by all modern clients and SEO tooling as "the real page is elsewhere right now, check again later."

If we ever commit to `/` being CSLv3 forever, flip `"permanent": false` → `"permanent": true`.

## Feedback

- **Target:** `feedback@cssl.dev` (dedicated address; forwarded at domain registrar)
- **Mechanism:** mailto with ROT13+base64 obfuscation in `data-c` attribute
- **Activation:** on first user interaction only (mouseenter / focus / touchstart / click)
- **LAYER 2 (optional):** Cloudflare Scrape Shield → Email Address Obfuscation if site fronted by CF
- **Fallback:** `<noscript>` points at GitHub issues + `SECURITY.md`
- **Future migration:** once GitHub repo public, swap `data-c` for direct `href` to `https://github.com/<org>/cssl-site/issues/new`

## License

- **Content:** CC-BY-4.0 (footer + `LICENSE-CONTENT`)
- **Code:** MIT (project `LICENSE`)

## Fonts

- Self-hosted WOFF2 in `/fonts/` planned (Cinzel, Newsreader, JetBrains Mono).
- Currently still loading from Google Fonts CDN — next maintenance window.
- Reason to self-host: offline + GDPR-clean + archive.org + immortalization.

## Offline / PWA

- Service worker precaches `/CSLv3`, `/sigil`, `/js/*`, `/manifest.webmanifest`.
- `/` is not cached — always a redirect.
- HTML strategy: network-first, fall back to cache with `/CSLv3` as the default.
- Asset strategy: stale-while-revalidate.
- Cache versioned via name (`cssl-v3-2026-04-17`); bump on deploy to force refresh.

## Immortalization artifacts

- Wayback Machine submission on every production deploy (GitHub Action, pending).
- SHA-256 build hash embedded in footer for snapshot verification. (current: pinned, needs build-hook automation.)
- OpenGraph cards at `/og/CSLv3.*` and `/og/home.*` (SVG source ready, PNG render pending).
- llms.txt + llms-full.txt for AI indexability. ✓ present
- CC-BY-4.0 for legal portability. ✓ present

## Deferred (Phase G)

- PDF reference build via CSLv3 LaTeX emit → XeLaTeX → `/downloads/CSLv3-reference-v1.1.0.pdf`.
- Vercel serverless feedback form (`/feedback` + `api/feedback.js` via Resend).
- Cloudflare front-of-Vercel DNS migration.
- Search palette (Ctrl-K) — `js/search-palette.js` artifact ready, not yet added.
- OG SVG cards — artifacts ready, not yet placed in `/og/`.
- Self-hosted fonts — `scripts/fetch-fonts.sh` recipe ready, not yet executed.

## Decisions NOT made by this session (Apocky to pick)

- Exact GitHub org/repo slugs for cssl-site + CSLv3 public repos.
- Twitter/X handle for `twitter:site` + `twitter:creator` meta (currently omitted).
- Email forwarding setup at domain registrar for `feedback@cssl.dev`.

## Prime Directive enforcement

- Full directive block rendered verbatim on `/CSLv3` and `/sigil`.
- Build never strips or weakens the prohibitions list.
- No analytics, no tracking, no cookie banner, no third-party scripts.
- Consent = OS applies to the site itself.
