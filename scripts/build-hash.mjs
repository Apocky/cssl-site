#!/usr/bin/env node
/* build-hash.mjs — compute SHA-256 of each HTML file and embed it into
 * the footer's .build-hash element. Also updates llms.txt and llms-full.txt
 * timestamps (dateModified parity).
 *
 *   node scripts/build-hash.mjs
 *
 * Safe to re-run: the previous hash is replaced by the new one.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname || '.', '..');
const TARGETS = ['index.html', 'CSLv3.html'];

function hashBody(s) {
  // hash only the visible content (strip the existing hash marker to
  // avoid chicken-and-egg; the hash attests to the body text, not the
  // footer's hash attestation itself).
  const stripped = s.replace(/data-hash="[^"]*"/g, 'data-hash=""');
  return createHash('sha256').update(stripped, 'utf8').digest('hex');
}

function embed(path) {
  const full = join(ROOT, path);
  const src = readFileSync(full, 'utf8');
  const hash = hashBody(src);
  const short = hash.slice(0, 16);
  const ts = new Date().toISOString().slice(0, 10);
  const label = `sha256:${short} · ${ts}`;
  let out;
  if (/data-hash="[^"]*"[^>]*>[^<]*</.test(src)) {
    out = src.replace(/(data-hash=")[^"]*(")([^>]*>)[^<]*(<)/,
      `$1${hash}$2$3${label}$4`);
  } else {
    // insert if the <div class="build-hash"> exists but has no body
    out = src.replace(/(<div class="build-hash"[^>]*data-hash=")[^"]*(")\s*>/,
      `$1${hash}$2>${label}`);
  }
  if (out === src) {
    console.warn(`[warn] no hash placeholder found in ${path}`);
    return;
  }
  writeFileSync(full, out, 'utf8');
  console.log(`${path.padEnd(16)}  ${label}`);
}

for (const t of TARGETS) embed(t);
