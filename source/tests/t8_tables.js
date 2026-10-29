// v8 tests: node source/tests/t8_tables.js
// "What's inside a table" (sqlt): order, gap scheduling for existing learners (nothing lowered or reset), fresh learners unaffected,
// code/problems run on the real dataset, the transfer assessment (12+ questions, most outside music, every wrong option explained),
// the new terms are wired into tiers and building blocks, and the help screen documents the rules.
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const D0 = '2026-10-20';
// a v7 learner: read sql1..sql6 plus both v7 lessons (sqlr, sqlm), with placement, bites and term progress
const v7store = (() => {
  const S = { v: 1, xp: 1400, streak: 9, lastDay: '2026-10-28', theory: {}, items: {}, cards: {}, problems: { 'sql4-p1': { solved: D0 } }, settings: {}, focus: 'sql' };
  ['sql1', 'sql2', 'sql3', 'sql4', 'sql5', 'sql6', 'sqlr', 'sqlm'].forEach(l => S.theory[l] = D0);
  const E = { v: 1, bites: {}, placed: { sql1: D0, sql2: D0 }, placement: { best: 2, last: 2, date: D0, n: 2 }, onboarded: D0, pace: { log: [], day: null } };
  return { 'deLearn.v1': JSON.stringify(S), 'deLearn.ext': JSON.stringify(E) };
})();
const MUSIC = /song|artist|chart|stream|playlist|listener|genre|Ayra|Burna|Rema/i;
(async () => {
  const R = await H(`(async () => { const out = {};
    const mod = CURRICULUM.modules.find(m => m.id === 'sql'); out.order = mod.lessons.map(l => l.id).join(',');
    ['sql1','sql2','sql3','sql4','sql5','sql6','sqlr','sqlm'].forEach(l => codeIds(LESSONS[l]).forEach(id => { S.items[id] = S.items[id] || { lvl: 3, due: '2026-10-30' }; }));
    const snap = () => JSON.stringify({ items: S.items, theory: S.theory, xp: S.xp, streak: S.streak, problems: S.problems, placed: E.placed, placement: E.placement, bites: E.bites });
    const before = snap(); const progBefore = {}; mod.lessons.forEach(l => progBefore[l.id] = lessonProgress(l));
    const origAvg = mod.lessons.filter(l => !l.added).reduce((a, l) => a + lessonProgress(l), 0) / mod.lessons.filter(l => !l.added).length;
    out.modNotLower = moduleProgress(mod) >= origAvg - 1e-9;
    out.next1 = nextLesson() && nextLesson().id; out.gap = gapLesson() && gapLesson().id; out.unlocked = moduleUnlocked(mod);
    out.added = LESSONS.sqlt.added; out.isNewBadge = /sqlt[^]*?NEW|NEW[^]*?sqlt/.test(typeof roadmapHTML === 'function' ? roadmapHTML() : '');
    const p = buildDailySession(); out.daily1 = p.steps.map(s => s.type + (s.lesson ? ':' + s.lesson : '')).filter(x => /sqlt/.test(x)).slice(0, 3).join(',');
    S.theory.sqlt = '2026-10-29'; codeIds(LESSONS.sqlt).forEach(id => S.items[id] = { lvl: 1, due: '2026-10-30' }); visState('sqlt').seen = '2026-10-29';
    out.next2 = nextLesson().id;
    out.untouched = (() => { const a = JSON.parse(before), b = JSON.parse(snap()); return Object.keys(a.items).every(k => JSON.stringify(a.items[k]) === JSON.stringify(b.items[k])) && Object.keys(a.theory).every(k => a.theory[k] === b.theory[k]) && b.xp >= a.xp && JSON.stringify(a.problems) === JSON.stringify(b.problems) && JSON.stringify(a.placed) === JSON.stringify(b.placed) && JSON.stringify(a.placement) === JSON.stringify(b.placement) && JSON.stringify(a.bites) === JSON.stringify(b.bites); })();
    out.progKept = mod.lessons.filter(l => l.id !== 'sqlt').every(l => lessonProgress(l) >= progBefore[l.id] - 1e-9);
    // dataset runs
    const SQL = await getSQL(); const db = new SQL.Database(); db.exec(DATASET_SQL); out.runs = [];
    LESSONS.sqlt.code.forEach(c => { try { const r = db.exec(plain(c.code)); out.runs.push([c.id, r.length && r[r.length-1].values.length > 0, JSON.stringify(r.length ? r[r.length-1].values.slice(0,3) : [])]); } catch (e) { out.runs.push([c.id, false, e.message]); } });
    (LESSONS.sqlt.problems || []).forEach(pr => { try { const r = db.exec(pr.solution); out.runs.push([pr.id, r.length && r[0].values.length > 0, JSON.stringify(r[0].values.slice(0,3))]); } catch (e) { out.runs.push([pr.id, false, e.message]); } });
    // blueprints describe the real tables (column names match the dataset)
    out.bp = Object.keys(BLUEPRINTS).map(t => { const real = db.exec("SELECT name FROM pragma_table_info('" + t + "')"); const rc = real.length ? real[0].values.map(v => v[0]) : []; return [t, BLUEPRINTS[t][2].every(c => rc.includes(c[0])) && rc.length === BLUEPRINTS[t][2].length]; });
    db.close();
    const I = ILLUS.sqlt; out.scenes = I.scenes.length; out.qs = I.qs.map(q => ({ k: q.k, txt: q.q + ' ' + (q.show || '') + ' ' + (q.o || []).join(' ') + ' ' + (q.items || []).map(i => i[0]).join(' ') + ' ' + (q.code || ''), wOk: q.k !== 'mc' || (Array.isArray(q.w) && q.w.length === q.o.length && q.w[0] == null && q.w.slice(1).every(x => x && x.length > 15)), clsOk: q.k !== 'cls' || q.items.every(i => i[1] < q.cats.length && i[2] && i[2].length > 10) }));
    out.figs = ['anat','ddl','place','bp','ask','multi'].every(f => typeof ILL_FIGS[f] === 'function');
    out.pictures = I.scenes.filter(s => s.fig || s.ins).length;
    // terms
    out.terms = ['sqlt-t1','sqlt-t2','sqlt-t3'].map(id => { const T = TERMS4[id]; const pieces = (T.t1.def.match(/\\{[^}]+\\}/g) || []).length; return [id, !!T && pieces === T.t1.ph.length && T.t1.ph.every(p => p.spot && p.spot.o.length >= 3 && p.d.length >= 2) && !!T.t3 && (TERM_BLOCKS[id] || []).length >= 2]; });
    out.termNames = LESSONS.sqlt.terms.map(t => t.term).join(',');
    out.dupTerms = (() => { const seen = {}; let d = []; CURRICULUM.modules.forEach(m => m.lessons.forEach(l => (l.terms || []).forEach(t => { const k = t.term.toLowerCase(); if (seen[k]) d.push(k); seen[k] = 1; }))); return d.join(','); })();
    out.help = learnHowHTML(); out.placeLv2 = PLACE_LEVELS[2].lessons.join(',');
    return out; })()`, v7store);
  const F = await H(`(() => ({ next: nextLesson().id, fresh: isFreshUser(), gap: gapLesson() }))()`, {});
  ok(/sql4,sqlt,sqlr,sql5/.test(R.order), 'roadmap order: Grain (sql4) → What\'s inside a table → Entities/relationships → JOINs');
  ok(R.added === 8, 'sqlt is marked as added in v8');
  ok(R.next1 === 'sqlt' && R.gap === 'sqlt' && R.unlocked, 'v7 learner (everything up to many-to-many read): sqlt offered next as a NEW gap lesson (' + R.next1 + ')');
  ok(/^illus:sqlt/.test(R.daily1), 'daily: pictures first (' + R.daily1 + ')');
  ok(R.next2 !== 'sqlt' && R.next2 !== 'sqlr' && R.next2 !== 'sqlm', 'after sqlt, back to the normal order (' + R.next2 + ')');
  ok(R.untouched, 'no stored progress changed (items, theory, XP, problems, placement, bites)');
  ok(R.progKept && R.modNotLower, 'no lesson % or module % lowered by the new lesson');
  ok(F.fresh && F.next === 'sql1' && !F.gap, 'fresh learner unaffected: starts at sql1, no gap lessons');
  ok(R.placeLv2 === 'sql4,sqlt,sqlr,sql5,sqlm', 'placement level 2 covers sqlt');
  R.runs.forEach(([k, g, v]) => ok(g, 'runs on the dataset: ' + k + ' ' + (g ? v.slice(0, 70) : ':: ' + v)));
  R.bp.forEach(([t, g]) => ok(g, 'blueprint matches the real table: ' + t));
  ok(R.bp.length === 7, 'blueprints for all 7 tables');
  ok(R.figs && R.scenes >= 12 && R.pictures >= 12, 'picture walk-through: ' + R.scenes + ' scenes, ' + R.pictures + ' pictures');
  const nonMusic = R.qs.filter(q => !MUSIC.test(q.txt)).length;
  ok(R.qs.length >= 12, 'assessment has 12+ questions (' + R.qs.length + ')');
  ok(nonMusic > R.qs.length / 2, 'transfer: most questions are outside music (' + nonMusic + '/' + R.qs.length + ')');
  ['shop|order|cart|product', 'hospital|patient|doctor', 'school|student|course|grade', 'bank|account|balance'].forEach(d => ok(R.qs.some(q => new RegExp(d, 'i').test(q.txt) && !MUSIC.test(q.txt)), 'transfer domain present: ' + d.split('|')[0]));
  ok(R.qs.every(q => q.wOk), 'every multiple-choice wrong option has its own explanation');
  ok(R.qs.every(q => q.clsOk), 'every sorting item explains its answer');
  R.terms.forEach(([id, g]) => ok(g, 'term wired (tier 1 phrases, near misses, spot question, tier 3, building blocks): ' + id));
  ok(R.termNames === 'Cell,Data type,Redundancy' && !R.dupTerms, 'new terms Cell, Data type, Redundancy; no duplicate terms (' + R.dupTerms + ')');
  ok(/Inside a table before between tables/.test(R.help) && /Transfer test/.test(R.help), 'How learning works documents both v8 rules');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
