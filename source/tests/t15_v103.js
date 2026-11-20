// v10.3 tests: node source/tests/t15_v103.js — CTEs and derived tables built up by hand (sql7 Steps 1–8).
// Checks: new question IDs, legacy positions kept, the teaching order, the same six stream rows everywhere (no made-up tables),
// every wrong option explained, a non-music transfer question in every step, tables before text, the write-it questions marked
// by result with their keywords kept, catch-up of only the new steps for learners who saw sql7 before, and no item, lesson or
// module change (so no % can move).
const fs = require('fs'), path = require('path'), os = require('os'); const { execSync } = require('child_process'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const BASE = process.argv[2] || '9ab5ff9';
(async () => {
  const R = await H(`(async () => { const out = {}; const L = ILLUS.sql7;
  const st = L.order.map(([k, i]) => k === 's' ? 'S:' + L.scenes[i].h : 'Q:' + (L.qs[i].id || 'sql7.' + i));
  out.seq = st; out.legacyQ = [L.qs[0].id, L.qs[1].id, L.qs[0].q, L.qs[1].q]; out.legacyS = L.scenes.slice(0, 3).map(s => s.h);
  const nw = L.order.filter(([k, i]) => (k === 's' ? L.scenes[i] : L.qs[i]).v103);
  // v10.4: Steps 9–12 (v104) follow Steps 1–8; the legacy CTE picture stays; the two old UNION pictures and questions are retired (Step 10 replaces them)
  const rest = L.order.slice(nw.length); const n4 = rest.filter(([k, i]) => (k === 's' ? L.scenes[i] : L.qs[i]).v104).length;
  out.tailLegacy = rest.slice(0, n4).every(([k, i]) => (k === 's' ? L.scenes[i] : L.qs[i]).v104) && JSON.stringify(rest.slice(n4)) === JSON.stringify([['s', 0]]) && JSON.stringify(L.retired) === JSON.stringify([['s', 1], ['s', 2], ['q', 0], ['q', 1]]);
  out.newFirst = L.order.slice(0, nw.length).every(([k, i]) => (k === 's' ? L.scenes[i] : L.qs[i]).v103);
  const nS = L.scenes.filter(s => s.v103), nQ = L.qs.filter(q => q.v103); out.nS = nS.length; out.nQ = nQ.length;
  out.ids = nQ.every(q => /^sql7\\.g[1-8]/.test(q.id || '')) && new Set(nQ.map(q => q.id)).size === nQ.length;
  out.linkAsk = nS.every(s => s.link && s.ask && s.say && s.tf);
  out.mcW = nQ.filter(q => q.k === 'mc').every(q => q.w && q.o.every((_, j) => !j || (q.w[j] && q.w[j].length > 15)) && q.why);
  out.steps = [1, 2, 3, 4, 5, 6, 7, 8].map(n => { const qs = nQ.filter(q => q.id.startsWith('sql7.g' + n)); const sc = nS.filter(s => s.h.startsWith('Step ' + n + ' '));
    return { n, sc: sc.length, qs: qs.length, mc: qs.filter(q => q.k === 'mc').length, transfer: qs.some(q => /🛒/.test(q.q) && (q.ts === 'shop' || q.show)) }; });
  // the same six stream rows everywhere; listener_id only where needed; nothing called plays
  const pairs = t => JSON.stringify(t.r.map(r => [r[0], r[r.length - 1]]));
  out.rows = pairs(L.tsets.p.streams) === '[[1,14],[2,14],[3,14],[4,22],[5,31],[6,31]]' && pairs(L.tsets.l.streams) === pairs(L.tsets.p.streams) && L.tsets.p.streams.c.join() === 'stream_id,song_id' && L.tsets.l.streams.c.join() === 'stream_id,listener_id,song_id';
  out.lUse = [...new Set(L.order.filter(([k, i]) => (k === 's' ? L.scenes[i] : L.qs[i]).ts === 'l').map(([k, i]) => ((k === 's' ? L.scenes[i].h : L.qs[i].id) || '').replace(/ ·.*$/, '').replace(/^sql7\\.g(\\d).*/, 'Step $1')))];
  const blob = JSON.stringify(nS) + JSON.stringify(nQ); out.noPlays = !/(FROM|JOIN|TABLE)\\s+plays?\\b|play_id|<code>plays?<|\\bplays\\s*\\(/i.test(blob); // the word “plays” in prose is fine; a plays TABLE is not
  out.tables = [...new Set(Object.entries(L.tsets).filter(([k]) => ['p', 'a', 'l', 'l7', 'l8', 'shop'].includes(k)).flatMap(([, ts]) => Object.keys(ts)))]; // the v10.3 table sets (v10.4 adds its own, checked in t16)
  // rule checks: thinking before naming (GROUP BY named after the by-hand piles; HAVING after the learner spotted WHERE; CTE after the by-hand MAX)
  const at = x => st.indexOf(x);
  out.handFirst = at('Q:sql7.g1b') < at('S:Step 1 · Your piles in SQL: GROUP BY and COUNT(*)') && at('Q:sql7.g2a') < at('S:Step 2 · Two columns in GROUP BY: every count is 1') && at('Q:sql7.g4a') < at('S:Step 4 · Two steps in one query: a CTE') && at('Q:sql7.g6a') < at('S:Step 6 · Three steps as a CTE') && at('Q:sql7.g7a') < at('S:Step 7 · WHERE runs before the piles exist') && at('Q:sql7.g8b') < at('Q:sql7.g8c') && at('Q:sql7.g8e') < at('Q:sql7.g8f') && at('Q:sql7.g8f') < at('S:Step 8 · Check your query, step by step');
  out.noGroupByEarly = nS.filter(s => /^Step 1 · Sort/.test(s.h)).every(s => !/GROUP BY/.test(s.say + (s.sql || '')));
  // tables come before the text that walks through them
  SESSION = { i: 0, steps: [] }; out.tf = nS.every(s => { F = null; const h = viewIllus({ lesson: 'sql7', sc: L.scenes.indexOf(s), pos: 1, of: 2 }); return h.indexOf('<table') > -1 && h.indexOf('<table') < h.indexOf('ill-say'); });
  // the write-it questions: marked by running the query on the lesson's tables, keywords kept (the in-app vqCheck rule)
  const mark = async (q, code) => { try { const u = await runIll(code, 'sql7', q.ts), e = await runIll(q.sol, 'sql7', q.ts); const c = compareResults(u, e, false);
    const miss = c.ok && q.need ? q.need.find(([re]) => !new RegExp(re, 'i').test(code)) : null; return c.ok && !miss ? 'right' : miss ? 'need:' + miss[1] : 'wrong'; } catch (er) { return 'error'; } };
  const Q = id => L.qs.find(q => q.id === id); out.run = {};
  const cases = {
    'sql7.g4b': [['model', Q('sql7.g4b').sol, 'right'], ['other alias', 'WITH song_counts AS (SELECT song_id, COUNT(*) AS n FROM streams GROUP BY song_id) SELECT MAX(n) AS top FROM song_counts;', 'right'],
      ['other CTE name', 'WITH sc AS (SELECT song_id, COUNT(*) AS stream_count FROM streams GROUP BY song_id) SELECT MAX(stream_count) FROM sc', 'right'],
      ['GROUP BY stream_id', Q('sql7.g4b').sol.replace('GROUP BY song_id', 'GROUP BY stream_id'), 'wrong'], ['MIN', Q('sql7.g4b').sol.replace('MAX(', 'MIN('), 'wrong'],
      ['GROUP BY stream_id, song_id', Q('sql7.g4b').sol.replace('GROUP BY song_id', 'GROUP BY stream_id, song_id'), 'wrong'], ['SELECT 3 (luck)', 'SELECT 3;', 'need:WITH']],
    'sql7.g6c': [['model', Q('sql7.g6c').sol, 'right'], ['columns swapped', Q('sql7.g6c').sol.replace('SELECT song_counts.song_id, song_counts.stream_count', 'SELECT song_counts.stream_count, song_counts.song_id'), 'right'],
      ['< instead of >', Q('sql7.g6c').sol.replace('stream_count > avg', 'stream_count < avg'), 'wrong'], ['>= instead of >', Q('sql7.g6c').sol.replace('stream_count > avg', 'stream_count >= avg'), 'wrong'],
      ['hard-coded 2', Q('sql7.g6c').sol.replace('FROM song_counts, avg_count\\nWHERE song_counts.stream_count > avg_count.avg_streams', 'FROM song_counts\\nWHERE song_counts.stream_count > 2'), 'need:FROM song_counts, avg_count']],
    'sql7.g8f': [['model', Q('sql7.g8f').sol, 'right'], ['no alias', Q('sql7.g8f').sol.replace(' AS avg_songs', ''), 'right'],
      ['COUNT(*)', Q('sql7.g8f').sol.replace('COUNT(DISTINCT song_id)', 'COUNT(*)'), 'wrong'], ['COUNT(song_id)', Q('sql7.g8f').sol.replace('COUNT(DISTINCT song_id)', 'COUNT(song_id)'), 'wrong'],
      ['MAX instead of AVG', Q('sql7.g8f').sol.replace('AVG(songs)', 'MAX(songs)'), 'wrong'], ['GROUP BY song_id', Q('sql7.g8f').sol.replace('GROUP BY listener_id', 'GROUP BY song_id'), 'wrong'], ['SELECT 1.5 (luck)', 'SELECT 1.5;', 'need:DISTINCT']] };
  for (const id of Object.keys(cases)) for (const [name, code, want] of cases[id]) { const got = await mark(Q(id), code); out.run[id + ' · ' + name] = [got, want]; }
  // Step 8 data: listeners 7 and 8, then one row changed at a time (COUNT(*) and DISTINCT averages)
  const avgs = async ts => { const r = await runIll('WITH x AS (SELECT listener_id, COUNT(*) AS a, COUNT(DISTINCT song_id) AS d FROM streams GROUP BY listener_id) SELECT AVG(a), AVG(d) FROM x', 'sql7', ts); return r.values[0]; };
  out.avgs = [await avgs('l'), await avgs('l7'), await avgs('l8')];
  out.l7 = JSON.stringify(L.tsets.l.streams.r) === '[[1,7,14],[2,7,14],[3,7,14],[4,8,22],[5,8,31],[6,8,31]]' && JSON.stringify(L.tsets.l7.streams.r.slice(6)) === '[[7,8,14]]' && JSON.stringify(L.tsets.l8.streams.r.slice(6)) === '[[7,8,14],[8,7,14]]';
  const q8c = Q('sql7.g8c'); out.resultRow = /one row of <code>streams<[/]code> stands for one play/i.test(q8c.q) && /result<[/]b>/.test(q8c.q) && q8c.o[0].startsWith('one listener');
  out.stop = !!Q('sql7.g8s') && /reread the question/i.test(Q('sql7.g8s').o[0]) && st.indexOf('Q:sql7.g8s') < st.indexOf('Q:sql7.g8f');
  out.tableFirst8 = ['sql7.g8g', 'sql7.g8h', 'sql7.g8i'].every(id => { const q = Q(id); const ts = q.ts; return ts && st.indexOf('Q:' + id) > st.findIndex(x => x.startsWith('S:') && L.scenes.find(s => 'S:' + s.h === x && s.ts === ts)); });
  out.distinctDef = L.scenes.some(s => /DISTINCT<[/]b> means “count each song once”/.test(s.say));
  out.runAll = nQ.filter(q => q.k === 'run').every(q => q.need && q.need.length && q.need.every(([re]) => new RegExp(re, 'i').test(q.sol)) && /____/.test(q.code));
  // returning learner who saw sql7's pictures before v10.3: only the new steps, labelled new, one lesson a day; finishing clears it
  const ord = []; orderedReadyModules().forEach(m => m.lessons.forEach(l => ord.push(l.id)));
  ord.slice(0, ord.indexOf('sql7') + 1).forEach(id => { S.theory[id] = '2026-11-01'; });
  const prev = {}; ord.slice(0, ord.indexOf('sql7')).forEach(id => { if (ILLUS[id]) prev[id] = { seen: '2026-11-01', v10: '2026-11-01', v101: '2026-11-01', v103: '2026-11-01', v104: '2026-11-01', q: {} }; }); // v10.4: earlier lessons' v10.4 steps already seen, so sql7 is the pending one
  T.vis = prev; T.vis.sql7 = { seen: '2026-11-01', q: { 0: { n: 1, ok: '2026-11-01', miss: null }, 1: { n: 1, ok: '2026-11-01', miss: null } } };
  const before = JSON.stringify(T.vis.sql7.q);
  out.pending = v10Pending('sql7') && !v10Pending('sql7', true); const cu = catchUpIllus(); out.cu = cu;
  const only = illusSteps('sql7', null, true); out.onlyNew = only.length === nw.length && only.every(x => x.isNew && (x.type === 'illus' ? L.scenes[x.sc] : L.qs[x.qi]).v103);
  const p = buildDailySession(); out.dailyDbg = [p.counts.catchUp, p.counts.illus, p.counts.lesson && p.counts.lesson.id]; out.dailyCU = p.counts.catchUp === 'sql7' && p.steps.filter(s => s.lesson === 'sql7').length === nw.length && p.steps.filter(s => s.lesson === 'sql7').every(s => s.isNew);
  out.oldAnswers = JSON.stringify(T.vis.sql7.q) === before && !!vqRec('sql7', 0) && !!vqRec('sql7', 1);
  T.vis.sql7.v103 = '2026-11-20'; T.vis.sql7.v104 = '2026-11-20'; out.done = !v10Pending('sql7') && (!catchUpIllus() || catchUpIllus().id !== 'sql7');
  // learners who finished sql5 under v10.1 are not sent back to sql5; the rung stays open
  T.vis.sql5 = { seen: '2026-10-30', v10: '2026-11-01', v101: '2026-11-04', q: {} }; T.vis.sqlm = { seen: '2026-10-30', v10: '2026-11-01', q: {} };
  out.sql5 = !v10Pending('sql5') && relKey('sql5') === 'v101' && rungReady(LESSONS.sqlc);
  // a fresh learner meets the whole lesson: 8 steps, then the legacy pictures
  T.vis = {}; const full = illusSteps('sql7'); out.fresh = full.length === L.order.length && !full.some(x => x.isNew);
  out.items = Object.values(LESSONS).map(l => l.id + ':' + l.itemIds.join(',') + ':' + (l.problems || []).map(p => p.id).join(','));
  out.terms = Object.keys(T4 || {}).length;
  return out; })()`, { 'deLearn.v1': JSON.stringify({ xp: 500, streak: 3, theory: {}, items: {}, cards: {}, problems: {} }) });
  // the same lessons, items and problems as the last live build, so no lesson or module % can change
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't15-')); fs.mkdirSync(path.join(tmp, 'tests'));
  fs.writeFileSync(path.join(tmp, 'app.js'), execSync(`git show ${BASE}:source/app.js`, { cwd: path.join(dir, '..'), maxBuffer: 1 << 26 })); fs.copyFileSync(path.join(__dirname, 'h.js'), path.join(tmp, 'tests', 'h.js'));
  const OLD = require(path.join(tmp, 'tests', 'h.js'))(`(() => ({ items: Object.values(LESSONS).map(l => l.id + ':' + l.itemIds.join(',') + ':' + (l.problems || []).map(p => p.id).join(',')), terms: Object.keys(T4 || {}).length, q: ILLUS.sql7.qs.map(q => JSON.stringify(q)), s: ILLUS.sql7.scenes.map(s => JSON.stringify(s)) }))()`, {});
  console.log('     ' + R.seq.length + ' teaching steps: ' + R.nS + ' screens, ' + R.nQ + ' questions, then the 5 legacy steps');
  ok(R.ids, 'new questions carry new, unique IDs (sql7.g1… to sql7.g8…)');
  ok(R.legacyQ[0] === undefined && R.legacyQ[1] === undefined && R.legacyQ[2] === JSON.parse(OLD.q[0]).q && R.legacyQ[3] === JSON.parse(OLD.q[1]).q, 'legacy questions keep their positions (sql7.0, sql7.1) and text');
  ok(OLD.s.length === 3 && R.legacyS.every((h, i) => h === JSON.parse(OLD.s[i]).h), 'legacy scenes keep their positions');
  ok(R.newFirst && R.tailLegacy, 'teaching order: Steps 1–8, then Steps 9–12 (v10.4), then the legacy CTE picture; the old UNION pictures are retired');
  R.steps.forEach(s => ok(s.sc >= 1 && s.mc >= 1 && s.transfer, `Step ${s.n}: ${s.sc} screen(s), ${s.qs} question(s), ${s.mc} choice question(s), a non-music transfer question`));
  ok(R.linkAsk, 'every new screen links to the previous step, asks its question first, and is drawn tables first (tf)');
  ok(R.mcW, 'every wrong option of every new choice question is explained');
  ok(R.rows, 'the same six stream rows (1,14) (2,14) (3,14) (4,22) (5,31) (6,31) everywhere; listener_id added in the listener set only');
  ok(R.lUse.join() === 'Step 2,Step 8', 'listener_id is shown only where needed: ' + R.lUse.join(', '));
  ok(R.noPlays && R.tables.every(t => ['streams', 'song_counts', 'orders'].includes(t)), 'only real tables (streams; song_counts is a step result; orders is the shop transfer); no “plays” table: ' + R.tables.join(', '));
  ok(R.handFirst && R.noGroupByEarly, 'by hand first: piles before GROUP BY, 6 piles before the two-column query, MAX by hand before the CTE, the average by hand before Step 6, the mistake spotted before HAVING, the plan before the query');
  ok(R.tf, 'tables come before the text on every new screen');
  ok(JSON.stringify(R.avgs) === '[[3,1.5],[3.5,2],[4,2]]', 'Step 8 averages: COUNT(*) vs DISTINCT 3 vs 1.5, then 3.5 vs 2 (+ stream 7), then 4 vs 2 (+ stream 8): ' + JSON.stringify(R.avgs));
  ok(R.l7, 'Step 8 uses listeners 7 and 8 (1,7,14) (2,7,14) (3,7,14) (4,8,22) (5,8,31) (6,8,31), then adds (7,8,14), then (8,7,14)');
  ok(R.resultRow, 'Step 8 asks what one row of step 1’s RESULT stands for, distinct from one row of streams (one play)');
  ok(R.stop && R.distinctDef, 'DISTINCT defined as “count each song once”; the plan warns against an unneeded step 3 before the learner writes the query');
  ok(R.tableFirst8, 'each change-one-row question comes after a screen showing its full table');
  ok(R.runAll, 'every write-it question has blanks, and its model answer keeps every required keyword');
  Object.entries(R.run).forEach(([k, [got, want]]) => ok(got === want, `marked by result: ${k} → ${got}` + (got === want ? '' : ' (want ' + want + ')')));
  ok(R.pending && R.cu && R.cu.id === 'sql7' && R.cu.onlyNew, 'a learner who saw sql7 before gets it as a catch-up of new steps only (never re-locks a rung)');
  ok(R.onlyNew, 'the catch-up holds exactly the new steps, each labelled 🆕 New');
  ok(R.dailyCU, 'the daily session puts the new steps in as the one catch-up of the day ' + JSON.stringify(R.dailyDbg));
  ok(R.oldAnswers, 'earlier sql7 picture answers are untouched and still readable');
  ok(R.done, 'finishing the new steps clears the catch-up');
  ok(R.sql5, 'learners who finished the joins steps are not sent back, and the combination drills stay open');
  ok(R.fresh, 'a fresh learner meets the whole lesson in order, with no 🆕 labels');
  ok(JSON.stringify(R.items) === JSON.stringify(OLD.items) && R.terms === OLD.terms, `no lesson, term, code card or problem added or removed compared with ${BASE}, so no % can change`);
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH', e); process.exit(1); });
