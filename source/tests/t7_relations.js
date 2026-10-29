// v7 tests: node source/tests/t7_relations.js
// lesson order, gap-lesson scheduling for existing learners (unlocked, nothing lowered), fresh learners unaffected,
// placement storage untouched, module % never lowered by the new lessons, and every new code item / problem runs on the real dataset.
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
// a learner from v6 who has read sql1..sql6 and has an older placement (sql1..sql3 tested out)
const D0 = '2026-10-20';
const v6store = (() => {
  const S = { v: 1, xp: 900, streak: 6, lastDay: '2026-10-27', theory: {}, items: {}, cards: {}, problems: {}, settings: {}, focus: 'sql' };
  ['sql1', 'sql2', 'sql3', 'sql4', 'sql5', 'sql6'].forEach(l => S.theory[l] = D0);
  const E = { v: 1, bites: {}, placed: { sql1: D0, sql2: D0, sql3: D0 }, placement: { best: 1, last: 1, date: D0, n: 1 }, onboarded: D0, pace: { log: [], day: null } };
  return { 'deLearn.v1': JSON.stringify(S), 'deLearn.ext': JSON.stringify(E) };
})();
(async () => {
  const R = await H(`(async () => { const out = {};
    const ids = CURRICULUM.modules.find(m => m.id === 'sql').lessons.map(l => l.id); out.order = ids.join(',');
    // code items need S.items for the lesson to count as started: give sql1..sql6 code items progress
    ['sql1','sql2','sql3','sql4','sql5','sql6'].forEach(l => codeIds(LESSONS[l]).forEach(id => { S.items[id] = S.items[id] || { lvl: 3, due: '2026-10-30' }; }));
    S.theory.sqlt = '2026-10-27'; codeIds(LESSONS.sqlt).forEach(id => S.items[id] = { lvl: 1, due: '2026-10-30' }); visState('sqlt').seen = '2026-10-27';
    const snap = () => JSON.stringify({ items: S.items, theory: S.theory, xp: S.xp, streak: S.streak, placed: E.placed, placement: E.placement });
    const before = snap(); const progBefore = {}; ['sql1','sql5','sql6'].forEach(l => progBefore[l] = lessonProgress(LESSONS[l]));
    const modP = moduleProgress(CURRICULUM.modules.find(m => m.id === 'sql'));
    const origAvg = (() => { const ls = CURRICULUM.modules.find(m => m.id === 'sql').lessons.filter(l => !l.added); return ls.reduce((a, l) => a + lessonProgress(l), 0) / ls.length; })();
    out.modNotLower = modP >= origAvg - 1e-9;
    out.next1 = nextLesson() && nextLesson().id; out.unlocked = moduleUnlocked(CURRICULUM.modules.find(m => m.id === 'sql'));
    const p = buildDailySession(); out.daily1 = p.steps.map(s => s.type + (s.lesson ? ':' + s.lesson : '')).filter(x => /sqlr|sqlm/.test(x)).slice(0, 4).join(',');
    out.dailyHasM = p.steps.some(s => s.lesson === 'sqlm');
    // learner finishes sqlr that day → next day sqlm, then normal order (sql7)
    S.theory.sqlr = '2026-10-28'; codeIds(LESSONS.sqlr).forEach(id => S.items[id] = { lvl: 1, due: '2026-10-29' }); visState('sqlr').seen = '2026-10-28';
    out.next2 = nextLesson().id;
    S.theory.sqlm = '2026-10-29'; codeIds(LESSONS.sqlm).forEach(id => S.items[id] = { lvl: 1, due: '2026-10-30' });
    out.next3 = nextLesson().id;
    out.untouched = (() => { const a = JSON.parse(before), b = JSON.parse(snap()); return Object.keys(a.items).every(k => JSON.stringify(a.items[k]) === JSON.stringify(b.items[k])) && Object.keys(a.theory).every(k => a.theory[k] === b.theory[k]) && b.xp >= a.xp && JSON.stringify(a.placed) === JSON.stringify(b.placed) && JSON.stringify(a.placement) === JSON.stringify(b.placement); })();
    out.progKept = ['sql1','sql5','sql6'].every(l => lessonProgress(LESSONS[l]) >= progBefore[l]);
    out.placeLv2 = PLACE_LEVELS[2].lessons.join(','); out.p2f = PLACE_BANK.filter(q => q.lv === 2).length;
    // new lessons' code and problems on the real dataset
    const SQL = await getSQL(); const db = new SQL.Database(); db.exec(DATASET_SQL); out.runs = [];
    ['sqlr','sqlm','sql5'].forEach(l => { LESSONS[l].code.forEach(c => { try { const r = db.exec(plain(c.code)); out.runs.push([c.id, r.length && r[r.length-1].values.length > 0, JSON.stringify(r.length ? r[r.length-1].values.slice(0,4) : [])]); } catch (e) { out.runs.push([c.id, false, e.message]); } });
      (LESSONS[l].problems || []).forEach(pr => { try { const r = db.exec(pr.solution); out.runs.push([pr.id, r.length && r[0].values.length > 0, JSON.stringify(r[0].values)]); } catch (e) { out.runs.push([pr.id, false, e.message]); } }); });
    const zr = db.exec("SELECT COUNT(*) FROM streams WHERE listener_id = 3")[0].values[0][0]; out.zainab = zr;
    const pk = (() => { try { db.exec('INSERT INTO playlist_songs VALUES (1,14)'); return false; } catch (e) { return /UNIQUE/i.test(e.message); } })(); out.pkPair = pk;
    db.close(); return out; })()`, v6store);
  const F = await H(`(() => ({ next: nextLesson().id, fresh: isFreshUser(), gap: gapLesson() }))()`, {});
  // a v6 learner placed at level 2 (sql1..sql5 tested out) but sqlr / sqlm never seen
  const P2 = await H(`(() => { ['sql1','sql2','sql3','sql4','sql5'].forEach(l => E.placed[l] = '2026-10-01'); const first = nextLesson().id; S.theory.sqlt = '2026-10-28'; codeIds(LESSONS.sqlt).forEach(id => S.items[id] = { lvl: 1, due: '2026-10-30' }); return { first, next: nextLesson().id, placed: Object.keys(E.placed).join(',') }; })()`, {});
  ok(/sql4,sqlt,sqlr,sql5,sqlm,sql6/.test(R.order), 'roadmap order: sql4 → Entities/relationships → JOINs → Many-to-many → sql6 (' + R.order + ')');
  ok(R.next1 === 'sqlr' && R.unlocked, 'existing learner past joins: the relationships lesson is next and unlocked');
  ok(/^illus:sqlr/.test(R.daily1) && !R.dailyHasM, 'daily: one new lesson a day, pictures first (' + R.daily1 + ')');
  ok(R.next2 === 'sqlm', 'next day: the many-to-many lesson (' + R.next2 + ')');
  ok(R.next3 === 'sql7', 'then back to normal order (' + R.next3 + ')');
  ok(R.untouched && R.progKept, 'no stored progress changed or lowered (items, theory, XP, placement)');
  ok(R.modNotLower, 'module % not pulled down by the added lessons');
  ok(F.fresh && F.next === 'sql1' && !F.gap, 'fresh learner unaffected: starts at sql1, no gap lessons');
  ok(P2.first === 'sqlt' && P2.next === 'sqlr' && P2.placed === 'sql1,sql2,sql3,sql4,sql5', 'placed-at-level-2 learner: new lessons offered, placement unchanged');
  ok(R.placeLv2 === 'sql4,sqlt,sqlr,sql5,sqlm' && R.p2f === 7, 'placement level 2 covers the new lessons (v7 keys/relationships item, v8 column-placement item)');
  R.runs.forEach(([k, g, v]) => ok(g, 'runs on the dataset: ' + k + ' ' + (g ? v.slice(0, 80) : ':: ' + v)));
  ok(R.zainab === 0, 'dataset: Zainab has no streams (no link without an event)');
  ok(R.pkPair, 'dataset: playlist_songs composite key refuses a duplicate pair');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH', e); process.exit(1); });
