#!/usr/bin/env node
/* post-deploy.mjs — submit deployed URLs to the Wayback Machine for
 * archival redundancy. Runs after successful Vercel production deploy.
 *
 *   node scripts/post-deploy.mjs
 *   node scripts/post-deploy.mjs --dry-run
 *
 * Exits 0 even on submission failure: Wayback timeouts must not fail a deploy.
 * Archive.org's /save endpoint returns a 200 with a Location header on
 * success, or 429 if rate-limited. We retry once on 429 with 15s backoff.
 */
const URLS = [
  'https://cssl.dev/',
  'https://cssl.dev/CSLv3',
  'https://cssl.dev/llms.txt',
  'https://cssl.dev/llms-full.txt',
];
const DRY = process.argv.includes('--dry-run');

async function submitOne(target, attempt = 1) {
  const saveUrl = 'https://web.archive.org/save/' + target;
  if (DRY) {
    console.log(`[dry] ${saveUrl}`);
    return { ok: true, dry: true };
  }
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const r = await fetch(saveUrl, {
      method: 'GET',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'cssl-site-post-deploy/1.0 (+https://cssl.dev)' },
    });
    clearTimeout(to);
    if (r.status === 429 && attempt < 2) {
      console.warn(`[429] ${target} ; backing off 15s and retrying`);
      await new Promise(res => setTimeout(res, 15000));
      return submitOne(target, attempt + 1);
    }
    console.log(`[${r.status}] ${target}`);
    return { ok: r.ok, status: r.status, url: target };
  } catch (e) {
    clearTimeout(to);
    console.warn(`[err] ${target} — ${e.message}`);
    return { ok: false, error: e.message, url: target };
  }
}

async function archiveToday(target) {
  // best-effort redundant archive ; no auth required
  if (DRY) { console.log(`[dry-at] https://archive.today/?run=1&url=${encodeURIComponent(target)}`); return; }
  try {
    const r = await fetch('https://archive.today/?run=1&url=' + encodeURIComponent(target), {
      method: 'GET',
      headers: { 'User-Agent': 'cssl-site-post-deploy/1.0' },
      signal: AbortSignal.timeout(30_000),
    });
    console.log(`[at:${r.status}] ${target}`);
  } catch (e) {
    console.warn(`[at:err] ${target} — ${e.message}`);
  }
}

(async () => {
  const results = [];
  for (const u of URLS) {
    results.push(await submitOne(u));
    await new Promise(res => setTimeout(res, 3000));  // polite spacing
  }
  // archive.today as redundant backup (only for main two pages)
  for (const u of URLS.slice(0, 2)) {
    await archiveToday(u);
    await new Promise(res => setTimeout(res, 2000));
  }
  const ok = results.filter(r => r.ok).length;
  console.log(`\n${ok}/${results.length} submissions accepted`);
  // exit 0 regardless ; archival failure shouldn't fail the deploy
  process.exit(0);
})();
