#!/usr/bin/env node
/* build.mjs — top-level build orchestrator.
 *
 *   node scripts/build.mjs
 *
 * Currently runs only the hash-embed step (build-hash.mjs). As additional
 * build steps are added (font subsetting, minification, OG image render,
 * search-index precompute), chain them from here.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname || '.', '..');
const STEPS = [
  ['build-hash',  ['node', 'scripts/build-hash.mjs']],
  // ['og-image',   ['python', 'scripts/build-og.py']],           // future
  // ['font-subset',['python', 'scripts/subset-fonts.py']],       // future
  // ['minify',     ['npx', '--yes', 'lightningcss', '...']],     // future
];

let failed = 0;
for (const [name, cmd] of STEPS) {
  console.log(`\n§ ${name}`);
  const r = spawnSync(cmd[0], cmd.slice(1), { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`[fail] ${name} exited ${r.status}`);
    failed++;
  }
}
console.log(`\n${STEPS.length - failed}/${STEPS.length} build steps OK`);
process.exit(failed ? 1 : 0);
