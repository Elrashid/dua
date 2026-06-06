/* Build step for GitHub Pages.
 *
 * Copies the static site into ./dist and replaces every `__BUILD_HASH__`
 * token with the current git commit hash. That hash is appended as a `?v=`
 * query to every JS/CSS URL (and baked into the service-worker cache name),
 * so when a new commit is deployed, clients fetch fresh code instead of a
 * stale cached copy.
 *
 * Run locally:  node build.mjs   ->   serve ./dist
 * In CI the workflow runs this and uploads ./dist to Pages.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function gitHash() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try { return execSync('git rev-parse HEAD').toString().trim(); }
  catch { return 'dev' + Date.now(); }
}

const HASH = gitHash().slice(0, 12);
const root = process.cwd();
const dist = path.join(root, 'dist');

// Top-level entries to include in the published site.
const INCLUDE = [
  'index.html', 'manifest.webmanifest', 'sw.js', 'version.json', '.nojekyll',
  'css', 'js', 'fonts', 'icons'
];
const TEXT = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.mjs']);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
for (const entry of INCLUDE) {
  const src = path.join(root, entry);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(dist, entry), { recursive: true });
}

let count = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!TEXT.has(path.extname(e.name))) continue;
    const t = fs.readFileSync(p, 'utf8');
    if (t.includes('__BUILD_HASH__')) {
      fs.writeFileSync(p, t.split('__BUILD_HASH__').join(HASH));
      count++;
    }
  }
}
walk(dist);

fs.writeFileSync(
  path.join(dist, 'version.json'),
  JSON.stringify({ hash: HASH, time: new Date().toISOString() }) + '\n'
);

console.log(`Built ./dist with build hash ${HASH} (patched ${count} files).`);
