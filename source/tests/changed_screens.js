// Lists every picture screen and question that a build adds or changes, so the benchmark in
// LEARNING_RULES.md ("Benchmark: check before shipping") can be run on each of them.
// usage: node source/tests/changed_screens.js [base-commit]   (default: HEAD)
const { execSync } = require('child_process'); const fs = require('fs'), path = require('path'), os = require('os');
const base = process.argv[2] || 'HEAD'; const REPO = path.join(__dirname, '..', '..');
const H = require('./h.js');
const dump = () => H(`(() => { const o = {}; Object.keys(ILLUS).forEach(l => { const L = ILLUS[l];
  L.scenes.forEach(s => { o[l + ' · screen · ' + s.h] = JSON.stringify(s); });
  L.qs.forEach((q, i) => { o[l + ' · question · ' + (q.id || l + '.' + i)] = JSON.stringify(q); }); }); return o; })()`, {});
const now = dump();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-')); fs.mkdirSync(path.join(tmp, 'tests'));
fs.writeFileSync(path.join(tmp, 'app.js'), execSync(`git show ${base}:source/app.js`, { cwd: REPO, maxBuffer: 1 << 26 }));
fs.copyFileSync(path.join(__dirname, 'h.js'), path.join(tmp, 'tests', 'h.js'));
const old = require(path.join(tmp, 'tests', 'h.js'))(`(() => { const o = {}; Object.keys(ILLUS).forEach(l => { const L = ILLUS[l];
  L.scenes.forEach(s => { o[l + ' · screen · ' + s.h] = JSON.stringify(s); });
  L.qs.forEach((q, i) => { o[l + ' · question · ' + (q.id || l + '.' + i)] = JSON.stringify(q); }); }); return o; })()`, {});
const strip = j => j.replace(/,"v10":1|,"v101":1/g, '');
const added = Object.keys(now).filter(k => !(k in old)), changed = Object.keys(now).filter(k => k in old && strip(old[k]) !== strip(now[k])), removed = Object.keys(old).filter(k => !(k in now));
console.log(`Compared with ${base}: ${added.length} added, ${changed.length} changed, ${removed.length} removed or renamed`);
added.forEach(k => console.log('ADDED   ' + k)); changed.forEach(k => console.log('CHANGED ' + k)); removed.forEach(k => console.log('REMOVED ' + k));
console.log('Run the 13-point benchmark (LEARNING_RULES.md) on every ADDED and CHANGED line.');
