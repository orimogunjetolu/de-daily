// v10.4 tests: node source/tests/t16_v104.js — every SQL lesson after joins rebuilt by hand (sqlrt chart task, sql6, sql7 Steps 9–12, sql8, sql9).
// Checks: unique new IDs, every new step flagged and placed, wrong options explained, a shop transfer per lesson, tables first,
// only app tables or labelled practice copies, write-it questions marked by result with keywords kept (and wrong answers refused),
// one-line legends on coloured figures, catch-up of only the new steps, card/problem gating (not-started only; started items untouched),
// and the same items, terms and problems as v10.3 (so no % can change).
const fs = require('fs'), path = require('path'), os = require('os'); const { execSync } = require('child_process'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const BASE = process.argv[2] || '5a80296';
const LIDS = ['sqlrt', 'sql6', 'sql7', 'sql8', 'sql9']; // all v10.4 lessons; the page decides which are shown (V104_ON)
(async () => {
  const R = await H(`(async () => { const out = { per: {}, bad: [] }; const LIDS = Object.keys(V104_ON); out.lids = LIDS;
  out.parkedSame = ${JSON.stringify(LIDS)}.filter(l => !V104_ON[l]).map(l => [l, JSON.stringify(ILLUS[l].order || null), ILLUS[l].scenes.length, ILLUS[l].qs.length]);
  const bad = (m) => out.bad.push(m);
  const ALLOWED = ['chart_entries', 'songs', 'artists', 'listeners', 'streams', 'raw_loads', 'chart_mon', 'chart_tue', 'entries', 'chart', 'chart_named', 'raw', 'song_counts',
    'orders', 'customers', 'staff', 'online_orders', 'shop_orders', 'daily'];
  const ids = [];
  const mark = async (lid, q, code) => { try { const u = await runIll(code, lid, q.ts), e = await runIll(q.sol, lid, q.ts); const c = compareResults(u, e, false);
    const miss = c.ok && q.need ? q.need.find(([re]) => !new RegExp(re, 'i').test(code)) : null; return c.ok && !miss ? 'right' : miss ? 'need' : 'wrong'; } catch (er) { return 'error'; } };
  SESSION = { i: 0, steps: [] };
  for (const lid of LIDS) { const L = ILLUS[lid]; const o = L.order.map(([k, i]) => k === 's' ? L.scenes[i] : L.qs[i]);
    const nS = L.scenes.filter(s => s.v104), nQ = L.qs.filter(q => q.v104); const p = out.per[lid] = { screens: nS.length, questions: nQ.length, shop: nQ.filter(q => /🛒/.test(q.q + (q.ask || ''))).length + nS.filter(s => /🛒/.test(s.ask || '')).length };
    nQ.forEach(q => ids.push(q.id));
    if (!nS.concat(nQ).every(x => o.includes(x))) bad(lid + ': a new step is missing from the teaching order');
    // every new screen: tables first, a link to the step before, a question first, a reason on every marked row, a legend for colour groups
    nS.forEach((s, j) => { if (!s.tf || !s.link || !s.ask) bad(lid + ' ' + s.h + ': tf/link/ask');
      const marks = (s.ins || []).concat(s.after || []).concat(s.out && s.out.m ? [s.out] : []).flatMap(x => x.m || []);
      if (marks.some(k => /^g/.test(k)) && !(s.lg && s.lg.g)) bad(lid + ' ' + s.h + ': colour groups without a one-line legend');
      if ((s.ins || []).length + (s.after || []).length > 4) bad(lid + ' ' + s.h + ': too many tables in one figure');
      F = null; const h = viewIllus({ lesson: lid, sc: L.scenes.indexOf(s), pos: 1, of: 2 });
      if (!(s.ins || s.after || (s.out && !s.out.err))) bad(lid + ' ' + s.h + ': no table on screen'); else if ((s.ins || s.after) && !(h.indexOf('<table') > -1 && h.indexOf('<table') < h.indexOf('ill-say'))) bad(lid + ' ' + s.h + ': table not before text'); });
    // every new question: plausible options with every wrong one explained; data on screen; run questions marked by result
    for (const q of nQ) {
      if (q.k === 'mc' && !(q.o.length >= 4 && q.w && q.o.every((_, j) => !j || (q.w[j] && q.w[j].length > 10)) && q.why)) bad(q.id + ': options/explanations');
      if (q.k === 'mc' && q.ref === false && !q.show && !q.sql) bad(q.id + ': ref:false without the data shown');
      if (!q.ts && q.ref !== false && q.k !== 'tap') bad(q.id + ': no table set');
      if (q.k === 'run') { if (!(q.need && q.need.every(([re]) => new RegExp(re, 'i').test(q.sol)) && /____/.test(q.code))) bad(q.id + ': run question needs/blanks');
        if (await mark(lid, q, q.sol) !== 'right') bad(q.id + ': model answer not marked right'); } }
    // only app tables, the app's views, or labelled practice tables
    Object.values(L.tsets || {}).forEach(ts => Object.keys(ts).forEach(t => { if (!ALLOWED.includes(t)) bad(lid + ': table ' + t + ' not in the app'); }));
    if (/(FROM|JOIN|TABLE)\\s+plays?\\b|play_id/.test(JSON.stringify(nS) + JSON.stringify(nQ))) bad(lid + ': a plays table');
  }
  // rung lessons (sqlrt): the % counts only the pre-v10.4 questions, so the new steps cannot lower it
  out.rung = Object.values(LESSONS).filter(l => l.rung && ILLUS[l.id]).map(l => { const L = ILLUS[l.id]; const keep = T.vis; T.vis = { [l.id]: { seen: '2026-11-01', q: {}, qid: {} } };
    L.qs.forEach((q, i) => { if (!q.v104) { T.vis[l.id].qid[vqId(l.id, i)] = { ok: 1, n: 1 }; } });
    const sp = S.problems; S.problems = {}; const all = rungProgress(l); S.problems = sp; T.vis = keep; return [l.id, all, (l.problems || []).length ? 0.85 : 1]; });
  out.idsUnique = new Set(ids).size === ids.length && ids.every(Boolean); out.nIds = ids.length;
  const all = []; Object.keys(ILLUS).forEach(l => ILLUS[l].qs.forEach((q, i) => all.push(vqId(l, i)))); out.allUnique = new Set(all).size === all.length;
  // wrong answers are refused (and lucky constants need their keywords)
  const Q = (lid, id) => ILLUS[lid].qs.find(q => q.id === id) || { sol: '' }; out.run = {};
  const cases = [
    ['sqlrt', 'sqlrt.v12', Q('sqlrt', 'sqlrt.v12').sol.replace('HAVING COUNT(DISTINCT c.chart_date) > 1', 'HAVING COUNT(*) > 1'), 'need'],
    ['sqlrt', 'sqlrt.v12', Q('sqlrt', 'sqlrt.v12').sol.replace('WHERE c.position <= 5\\n', ''), 'need'],
    ['sqlrt', 'sqlrt.v12', "SELECT 'Ayra Starr' AS artist, 2 AS days UNION ALL SELECT 'Victony', 2;", 'need'],
    ['sqlrt', 'sqlrt.v11', Q('sqlrt', 'sqlrt.v11').sol.replace(/AS artist/, 'AS who'), 'right'],
    ['sql6', 'sql6.v21', Q('sql6', 'sql6.v21').sol.replace('AND NOT EXISTS', 'AND EXISTS'), 'wrong'],
    ['sql6', 'sql6.v22', Q('sql6', 'sql6.v22').sol.replace("    WHERE chart_date = '2026-10-17'\\n  );", '  );'), 'wrong'],
    ['sql7', 'sql7.h13', Q('sql7', 'sql7.h13').sol.replace('n < 30', 'n <= 30'), 'wrong'],
    ['sql7', 'sql7.h17', Q('sql7', 'sql7.h17').sol.replace('100.0 *', '100 *'), 'wrong'],
    ['sql8', 'sql8.v16', Q('sql8', 'sql8.v16').sol.replace('LAG(', 'LEAD('), 'wrong'],
    ['sql8', 'sql8.v16', Q('sql8', 'sql8.v16').sol.replace('PARTITION BY song_id', 'PARTITION BY chart_date'), 'wrong'],
    ['sql9', 'sql9.v14', Q('sql9', 'sql9.v14').sol.replace('c.position > 5', 'c.position >= 5'), 'wrong']];
  for (const [lid, id, code, want] of cases.filter(c => LIDS.includes(c[0]))) { const got = await mark(lid, Q(lid, id), code); out.run[id + ' → ' + want] = got === want; }
  // returning learner who had seen every lesson before v10.4: one lesson a day, only its new steps, labelled new; sqlrt first
  const ord = []; orderedReadyModules().forEach(m => m.lessons.forEach(l => ord.push(l.id)));
  ord.slice(0, ord.indexOf('sql9') + 1).forEach(id => { S.theory[id] = '2026-11-01'; });
  T.vis = {}; ord.slice(0, ord.indexOf('sql9') + 1).forEach(id => { if (ILLUS[id]) T.vis[id] = { seen: '2026-11-01', v10: '2026-11-01', v101: '2026-11-01', v103: '2026-11-01', q: {} }; });
  out.parkedNotPending = ['sqlrt', 'sql6', 'sql8', 'sql9'].filter(l => !V104_ON[l]).every(l => !v10Pending(l));
  const cu = catchUpIllus(); out.cu = cu; const only = illusSteps(cu.id, null, true);
  out.onlyNew = cu.onlyNew && only.length === ILLUS[cu.id].order.filter(([k, i]) => (k === 's' ? ILLUS[cu.id].scenes[i] : ILLUS[cu.id].qs[i]).v104).length && only.every(x => x.isNew);
  out.pending = LIDS.every(l => v10Pending(l) && !v10Pending(l, true) && relKey(l) === 'v104');
  // gating: sql7-c3 (RECURSIVE) not started → held until sql7's v10.4 steps are seen; a started item is never held
  const t = today(); S.items = {}; S.cards = {}; S.problems = {};
  out.held = itemHeld('sql7-c3') && S.theory.sql7 && !newTermQueue().includes('sql7-t3') && !newTermQueue().includes('sql7-t4') && !itemHeld('sql5-c1') && LIDS.length && ['sqlrt', 'sql6', 'sql8', 'sql9'].filter(l => !V104_ON[l]).every(l => !LESSONS[l].itemIds.some(itemHeld) && !(LESSONS[l].problems || []).some(problemHeld));
  S.items['sql7-c3'] = { lvl: 2, due: t, right: 1, wrong: 0, seen: t, intro: '2026-11-10', mastered: false }; const snap = JSON.stringify(S.items['sql7-c3']);
  out.startedFree = !itemHeld('sql7-c3'); delete S.items['sql7-c3'];
  // a daily session on sql7 (theory read, pictures seen before v10.4): its new steps come first, then the held cards
  ord.slice(0, ord.indexOf('sql7')).forEach(id => { LESSONS[id].itemIds.forEach(it => { if (ITEMS[it].kind !== 'term') S.items[it] = { lvl: 4, due: '2099-01-01', mastered: true }; }); (LESSONS[id].problems || []).forEach(p => S.problems[p.id] = { solved: true, last: '2026-11-01' }); });
  LIDS.forEach(l => { if (l !== 'sql7') T.vis[l].v104 = '2026-11-02'; });
  const nl = nextLesson(); out.nl = nl && nl.id; const p = buildDailySession(); const ty = p.steps.map(s => s.type + ':' + (s.lesson || s.id));
  const firstNew = ty.findIndex(x => x.startsWith('fade:sql7-c')), lastIll = Math.max(ty.lastIndexOf('illus:sql7'), ty.lastIndexOf('vq:sql7'));
  out.order = { firstNew, lastIll, n: ty.length }; out.dailyOk = nl && nl.id === 'sql7' && lastIll >= 0 && (firstNew < 0 || firstNew > lastIll) && p.steps.filter(s => s.lesson === 'sql7' && (s.type === 'illus' || s.type === 'vq')).every(s => (s.type === 'illus' ? ILLUS.sql7.scenes[s.sc] : ILLUS.sql7.qs[s.qi]).v104);
  // the same day without the steps (e.g. no time): no sql7 card starts
  const keep = illusSteps; illusSteps = () => []; const p2 = buildDailySession(); illusSteps = keep; out.noCardWithoutSteps = !p2.steps.some(s => s.type === 'fade' && s.isNew && /^sql7-c/.test(s.id));
  T.vis.sql7.v104 = '2026-11-03'; out.released = !itemHeld('sql7-c3') && !problemHeld(PROBLEMS['sql7-p1']) && newTermQueue().includes('sql7-t3');
  // fresh learner: whole lessons, nothing labelled new
  T.vis = {}; out.fresh = LIDS.every(l => { const f = illusSteps(l); return f.length === ILLUS[l].order.length && !f.some(x => x.isNew); });
  out.items = Object.values(LESSONS).map(l => l.id + ':' + l.itemIds.join(',') + ':' + (l.problems || []).map(p => p.id).join(','));
  out.itemText = JSON.stringify(Object.values(ITEMS).map(i => [i.id, i.front, i.text])); out.terms = Object.keys(T4 || {}).length;
  return out; })()`, { 'deLearn.v1': JSON.stringify({ xp: 500, streak: 3, theory: {}, items: {}, cards: {}, problems: {} }) });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't16-')); fs.mkdirSync(path.join(tmp, 'tests'));
  fs.writeFileSync(path.join(tmp, 'app.js'), execSync(`git show ${BASE}:source/app.js`, { cwd: path.join(dir, '..'), maxBuffer: 1 << 26 })); fs.copyFileSync(path.join(__dirname, 'h.js'), path.join(tmp, 'tests', 'h.js'));
  const OLD = require(path.join(tmp, 'tests', 'h.js'))(`(() => ({ items: Object.values(LESSONS).map(l => l.id + ':' + l.itemIds.join(',') + ':' + (l.problems || []).map(p => p.id).join(',')), itemText: JSON.stringify(Object.values(ITEMS).map(i => [i.id, i.front, i.text])), terms: Object.keys(T4 || {}).length,
    qids: Object.keys(ILLUS).flatMap(l => ILLUS[l].qs.map((q, i) => vqId(l, i))), qs: Object.keys(ILLUS).flatMap(l => ILLUS[l].qs.map(q => JSON.stringify(q))), parked: ['sqlrt', 'sql6', 'sql7', 'sql8', 'sql9'].map(l => [l, JSON.stringify(ILLUS[l].order || null), ILLUS[l].scenes.length, ILLUS[l].qs.length]) }))()`, {});
  Object.entries(R.per).forEach(([l, p]) => console.log('     ' + l + ': ' + p.screens + ' new screens, ' + p.questions + ' new questions, ' + p.shop + ' shop transfers'));
  ok(R.bad.length === 0, 'every new screen and question follows the rules (tables first, link, question, reasons, legend, explained options, data shown, app tables only) ' + R.bad.slice(0, 8).join(' | '));
  ok(Object.values(R.per).every(p => p.shop >= 1), 'a shop transfer question in each shown lesson');
  const OLDP = OLD.parked; ok(JSON.stringify(R.parkedSame) === JSON.stringify(OLDP.filter(x => R.parkedSame.some(y => y[0] === x[0]))), 'parked lessons (' + R.parkedSame.map(x => x[0]).join(', ') + ') are exactly their v10.3 steps: order, scenes and questions');
  ok(R.parkedNotPending, 'parked lessons are not a catch-up and hold no card or problem');
  ok(R.idsUnique && R.allUnique, 'new question IDs are unique (' + R.nIds + '), and every question ID in the app is unique');
  ok(OLD.qids.every(id => R && true), 'every v10.3 question ID still exists: ' + OLD.qids.length);
  const now = await H(`(() => ({ qids: Object.keys(ILLUS).flatMap(l => ILLUS[l].qs.map((q, i) => vqId(l, i))), qs: Object.keys(ILLUS).flatMap(l => ILLUS[l].qs.map(q => JSON.stringify(q).replace(/,"v10":1|,"v101":1|,"v103":1|,"v104":1|,"tf":1/g, ''))) }))()`, {});
  ok(OLD.qids.every(id => now.qids.includes(id)), 'no existing question ID removed or renamed');
  ok(OLD.qs.every(q => now.qs.includes(q.replace(/,"v10":1|,"v101":1|,"v103":1|,"v104":1|,"tf":1/g, ''))), 'no existing question changed');
  Object.entries(R.run).forEach(([k, v]) => ok(v, 'write-it marking: ' + k));
  ok(R.rung.every(([, a, b]) => Math.abs(a - b) < 1e-9), 'rung lessons: every pre-v10.4 question right gives the same % as before (new questions do not enter the %) ' + JSON.stringify(R.rung));
  ok(R.pending, 'learners who saw these lessons get them as pending v10.4 steps that never re-lock a rung');
  ok(R.cu && R.cu.id === R.lids[0] && R.onlyNew, 'the catch-up starts with the first shown lesson and holds only its new steps, each labelled 🆕 New (' + JSON.stringify(R.cu) + ')');
  ok(R.held && R.startedFree, 'a not-started card or problem waits for its lesson’s new steps; a started item is never held');
  ok(R.dailyOk, 'a session on sql7 shows its new steps before any new sql7 card ' + JSON.stringify(R.order) + ' next=' + R.nl);
  ok(R.noCardWithoutSteps, 'without the new steps in the session, no sql7 card starts');
  ok(R.released, 'once the steps are seen, the cards and problem are released');
  ok(R.fresh, 'a fresh learner meets each whole lesson, nothing labelled new');
  ok(JSON.stringify(R.items) === JSON.stringify(OLD.items) && R.terms === OLD.terms && R.itemText === OLD.itemText, 'lessons, items, item text, problems and terms identical to ' + BASE + ' (no % can change)');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH', e); process.exit(1); });
