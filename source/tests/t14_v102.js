// v10.2 tests: node source/tests/t14_v102.js — result-based checking of SQL code cards (Level 3 lines, Level 4 info),
// the sqlm-c3 answers from the bug report, no previously-correct answer made wrong, wrong answers stay wrong,
// compareResults column order, and the one-time fix102 repair (idempotent, never lowers anything).
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const FROM = '\nFROM streams st\nJOIN songs s ON s.song_id = st.song_id\n';
(async () => {
  // ---------- sqlm-c3 at Level 3: the two typed lines are put back into the card and run ----------
  const R = await H(`(async () => { const it = ITEMS['sqlm-c3']; const segs = phraseSegments(it); const lines = segs.filter(s => s.blank).map(s => s.s);
    const L3 = async (a, b) => { const f = { segs, vals: [a, b] }; const textOk = segs.filter(s => s.blank).every((bl, i) => !!checkBlank(f.vals[i], bl.alts, true)); const x = await gradeSqlExec(it, fadeQuery(f), lines); return { textOk, ok: !!(x && x.ok), msg: x ? (x.ok ? x.note : x.msg) : null }; };
    const out = { lines };
    out.user = await L3('SELECT st.song_id, COUNT(DISTINCT st.listener_id)', 'GROUP BY st.song_id;');
    out.title = await L3('SELECT s.title, COUNT(DISTINCT st.listener_id)', 'GROUP BY s.title;');
    out.titleAlias = await L3('SELECT s.title, COUNT(DISTINCT st.listener_id) AS listeners', 'GROUP BY s.title;');
    out.both = await L3('SELECT s.song_id, s.title, COUNT(DISTINCT st.listener_id) AS listeners', 'GROUP BY s.song_id, s.title;');
    out.bothSt = await L3('SELECT st.song_id, s.title, COUNT(DISTINCT st.listener_id)', 'GROUP BY st.song_id');
    out.alias2 = await L3('select count(distinct st.listener_id) as n_listeners , s.title as song', 'group by song');
    out.order = await L3('SELECT COUNT(DISTINCT st.listener_id) AS listeners, st.song_id', 'GROUP BY 2 ORDER BY 1 DESC;');
    out.semi = await L3('  SELECT   S.TITLE ,COUNT( DISTINCT ST.LISTENER_ID )', 'GROUP   BY S.TITLE');
    out.star = await L3('SELECT s.title, COUNT(*) AS listeners', 'GROUP BY s.title;');
    out.starId = await L3('SELECT st.song_id, COUNT(*)', 'GROUP BY st.song_id;');
    out.nodist = await L3('SELECT s.title, COUNT(st.listener_id) AS listeners', 'GROUP BY s.title;');
    out.nogroup = await L3('SELECT s.title, COUNT(DISTINCT st.listener_id) AS listeners', ';');
    out.nolabel = await L3('SELECT COUNT(DISTINCT st.listener_id)', 'GROUP BY s.title;');
    out.wrongLabel = await L3('SELECT st.listener_id, COUNT(DISTINCT st.listener_id)', 'GROUP BY st.song_id;');
    out.extraCol = await L3('SELECT st.song_id, st.stream_id, COUNT(DISTINCT st.listener_id)', 'GROUP BY st.song_id;');
    out.syntax = await L3('SELEC s.title, COUNT(DISTINCT st.listener_id)', 'GROUP BY s.title;');
    out.model = await L3(lines[0], lines[1]);
    // the whole query typed into line 1 (fallback used by checkFade when the put-back query cannot run)
    out.whole = await gradeSqlExec(it, 'SELECT st.song_id, COUNT(DISTINCT st.listener_id) FROM streams st JOIN songs s ON s.song_id = st.song_id GROUP BY st.song_id;', lines);
    // Level 4: the full query from memory is run and reported (self-grade stays)
    out.l4 = await gradeSqlExec(it, 'SELECT st.song_id, COUNT(DISTINCT st.listener_id)' + ${JSON.stringify(FROM)} + 'GROUP BY st.song_id;', null);
    out.l4star = await gradeSqlExec(it, 'SELECT s.title, COUNT(*)' + ${JSON.stringify(FROM)} + 'GROUP BY s.title;', null);
    out.altRuns = (await runSQL(it.alt, null, 'music')).values.length === 3;
    return out; })()`, {});
  ok(R.lines.length === 2 && /DISTINCT/.test(R.lines[0]) && /GROUP BY/.test(R.lines[1]), 'Level 3 blanks the SELECT line and the GROUP BY line: ' + JSON.stringify(R.lines));
  ok(!R.user.textOk && R.user.ok, "the user's exact answer (st.song_id, no alias) was rejected by the text check and is now accepted");
  ok(/song_id/.test(R.user.msg) && /safer/.test(R.user.msg) && /share a title/.test(R.user.msg), 'its feedback says it is correct and why grouping by the ID is safer: ' + R.user.msg.replace(/<[^>]+>/g, ''));
  ok(R.title.ok && !R.title.textOk, 'title version without the alias accepted (the old text check rejected it too)');
  ok(R.titleAlias.textOk && R.titleAlias.ok, 'the model lines are accepted by the text check and by running them');
  ok(R.both.ok && R.bothSt.ok && /both/.test(R.both.msg), 'song_id and title both shown: accepted, called the safest version');
  ok(R.alias2.ok && R.order.ok && R.semi.ok, 'aliases, column order, GROUP BY 2, ORDER BY, case, spacing and the semicolon do not matter');
  ok(!R.star.ok && /plays/.test(R.star.msg) && /Ada played Calm Down twice/.test(R.star.msg), 'COUNT(*) is wrong, and the feedback says it counted plays, not different listeners');
  ok(!R.starId.ok, 'COUNT(*) grouped by song_id is wrong too');
  ok(!R.nodist.ok && /not different listeners/.test(R.nodist.msg), 'COUNT(st.listener_id) without DISTINCT is wrong');
  ok(!R.nogroup.ok && /no GROUP BY/.test(R.nogroup.msg), 'missing GROUP BY is wrong, and the feedback names it: ' + R.nogroup.msg);
  ok(!R.nolabel.ok && /column/.test(R.nolabel.msg), 'counts with no label column are wrong (which song is which?)');
  ok(!R.wrongLabel.ok && !R.extraCol.ok, 'a wrong label column or an extra unrelated column is wrong');
  ok(!R.syntax.ok && /could not run/.test(R.syntax.msg), 'a syntax error is wrong and shows the SQLite message');
  ok(R.model.ok, 'the model lines pass the run check');
  ok(R.whole && R.whole.ok, 'the whole query typed on one line is checked as a complete query');
  ok(R.l4 && R.l4.ok && R.l4star && !R.l4star.ok, 'Level 4: the run result is reported (right for song_id, wrong for COUNT(*))');
  ok(R.altRuns, 'the "safest version" (song_id and title) runs and returns 3 rows');

  // ---------- every runnable SQL card: nothing that passed before fails now; dropping a blanked keyword never passes ----------
  const G = await H(`(async () => { const out = { model: [], drop: [], skipped: [] };
    for (const it of Object.values(ITEMS).filter(i => i.kind === 'code' && i.lang === 'sql')) {
      const segs = phraseSegments(it); const bl = segs.filter(s => s.blank); const lines = bl.map(s => s.s);
      const f = { segs, vals: lines.slice() };
      const textOk = bl.every((b, i) => !!checkBlank(f.vals[i], b.alts, true));
      const x = await gradeSqlExec(it, fadeQuery(f), lines);
      if (!x) { out.skipped.push(it.id); out.model.push([it.id, textOk, 'text only']); continue; }
      out.model.push([it.id, textOk && x.ok, x.ok ? '' : x.msg]);
      // remove each blanked keyword from its line: the run check must never accept it
      // (AS before an alias is optional in SQL, so leaving it out is a real equivalent and is not tested here)
      for (const alts of cardKeys(it, lines)) { const k = alts[0]; if (/^as$/i.test(k)) continue; const i = lines.findIndex(l => hasKey(l, [k])); if (i < 0) continue;
        const isW = c => !!c && /[A-Za-z0-9_]/.test(c); const low = lines[i].toLowerCase(), kl = k.toLowerCase(); let pos = -1;
        for (let p = low.indexOf(kl); p >= 0; p = low.indexOf(kl, p + 1)) { if ((!isW(kl[0]) || !isW(low[p - 1])) && (!isW(kl[kl.length - 1]) || !isW(low[p + kl.length]))) { pos = p; break; } }
        if (pos < 0) continue; const g = { segs, vals: lines.slice() }; g.vals[i] = lines[i].slice(0, pos) + ' ' + lines[i].slice(pos + k.length); const y = await gradeSqlExec(it, fadeQuery(g), lines);
        out.drop.push([it.id + ' without ' + k, !(y && y.ok)]); }
    }
    return out; })()`, {});
  const badModel = G.model.filter(x => !x[1]);
  ok(!badModel.length, 'every SQL card: the model lines still pass at Level 3 (' + G.model.length + ' cards, ' + G.skipped.length + ' text-only: ' + G.skipped.join(', ') + ') ' + JSON.stringify(badModel));
  const badDrop = G.drop.filter(x => !x[1]);
  ok(G.drop.length > 60 && !badDrop.length, 'every SQL card: removing a blanked keyword is never accepted by the run check (' + G.drop.length + ' variants) ' + JSON.stringify(badDrop));

  // ---------- compareResults (problems, placement, run questions): column order no longer matters; old verdicts kept ----------
  const C = await H(`(async () => { const a = { columns: ['title', 'n'], values: [['A', 1], ['B', 2]] }, b = { columns: ['n', 'title'], values: [[1, 'A'], [2, 'B']] }, c = { columns: ['n', 'title'], values: [[1, 'A'], [3, 'B']] };
    const sol = []; for (const p of Object.values(PROBLEMS).filter(p => p.kind === 'sql')) { try { const r = await runSQL(p.solution + (p.after ? '\\n;' + p.after : ''), p.setup, p.db); sol.push([p.id, compareResults(r, r, !!p.ordered).ok]); } catch (e) { sol.push([p.id, false]); } }
    return { perm: compareResults(b, a, false).ok, diff: compareResults(c, a, false).ok, same: compareResults(a, a, true).ok, sol }; })()`, {});
  ok(C.perm && !C.diff && C.same, 'compareResults: swapped columns accepted, different values still wrong');
  ok(C.sol.every(x => x[1]), 'every problem solution still matches itself (' + C.sol.length + ')');

  // ---------- fix102: one-time repair of the sqlm-c3 record ----------
  const day = new Date().toISOString().slice(0, 10);
  const base = (it) => ({ 'deLearn.v1': JSON.stringify({ v: 2, xp: 812, streak: 6, best: 9, lastActive: day, days: { [day]: { xp: 40, steps: 9 } }, theory: { sqlm: '2026-11-01' }, problems: {}, settings: { minutes: 25, newPerDay: 8, focus: 'sql' }, created: '2026-10-01',
    items: Object.assign({ 'sqlm-c1': { lvl: 3, due: day, right: 2, wrong: 0, seen: day, intro: '2026-11-01', mastered: false }, 'sql1-c1': { lvl: 4, due: day, right: 4, wrong: 0, seen: day, intro: '2026-10-01', mastered: true } }, it ? { 'sqlm-c3': it } : {}),
    cards: { 'sql1-c1': { ease: 2.5, ivl: 6, reps: 2, lapses: 0, due: '2026-11-20', added: '2026-10-05' } } }) });
  const run = (store, twice) => { const st = Object.assign({}, store); const r1 = H('(() => { const a = fix102(); const b = fix102(); return [a, b, JSON.parse(localStorage.getItem("deLearn.fix102"))]; })()', st);
    return { r: r1, v1: global.localStorage.getItem('deLearn.v1'), flag: global.localStorage.getItem('deLearn.fix102'), ls: global.localStorage._d }; };
  const strip = (j, id) => { const o = JSON.parse(j); delete o.items[id]; return JSON.stringify(o); };
  // A: the bug case: dropped from Level 3 to 2 today (a miss sets due = the answer day)
  const sA = base({ lvl: 2, due: day, right: 3, wrong: 1, seen: day, intro: '2026-11-01', mastered: false }); const A = run(sA);
  const a1 = JSON.parse(A.v1).items['sqlm-c3'];
  ok(A.r[0] && A.r[0].changed && a1.lvl === 4 && a1.right === 4 && a1.wrong === 1 && a1.due > day, 'dropped card restored: Level 2 → 4 (what a correct Level 3 answer gives), counted right, due tomorrow');
  ok(A.r[1] === null, 'second run in the same load does nothing (flag set)');
  const loadedA = H('JSON.stringify(S)', Object.assign({}, sA)); // what a normal load (no repair) saves
  ok(strip(A.v1, 'sqlm-c3') === strip(loadedA, 'sqlm-c3'), 'everything else in deLearn.v1 byte-identical (XP, streak, days, other cards, flashcards)');
  const A2 = run(Object.assign({}, A.ls)); ok(A2.v1 === A.v1 && A2.flag === A.flag && A2.r[0] === null, 'idempotent across loads: a later load changes nothing');
  // B: the retry already climbed back to Level 3 (last answer right)
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const B = run(base({ lvl: 3, due: tomorrow, right: 4, wrong: 1, seen: day, intro: '2026-11-01', mastered: false })); const b1 = JSON.parse(B.v1).items['sqlm-c3'];
  ok(B.r[0].changed && b1.lvl === 4 && b1.right === 4 && b1.due === tomorrow, 'retry already passed at Level 2 (now Level 3): set to Level 4, nothing else');
  // C: never lowers or touches anything else
  const cases = [['mastered', { lvl: 4, due: day, right: 6, wrong: 1, seen: day, intro: '2026-11-01', mastered: true }], ['no misses', { lvl: 2, due: day, right: 1, wrong: 0, seen: day, intro: day, mastered: false }],
    ['old miss', { lvl: 2, due: '2026-10-10', right: 1, wrong: 1, seen: '2026-10-10', intro: '2026-10-01', mastered: false }], ['level 4 already', { lvl: 4, due: tomorrow, right: 5, wrong: 1, seen: day, intro: '2026-11-01', mastered: false }],
    ['level 1', { lvl: 1, due: day, right: 0, wrong: 2, seen: day, intro: day, mastered: false }], ['never seen', null]];
  cases.forEach(([n, it]) => { const s = base(it); const X = run(s); ok(X.v1 === s['deLearn.v1'] && X.r[0] && !X.r[0].changed && X.flag, 'no change when ' + n + ' (deLearn.v1 byte-identical, flag written)'); });
  // D: a fresh learner and an empty store
  const D = run({}); ok(D.v1 === null || !JSON.parse(D.v1).items['sqlm-c3'], 'fresh learner: nothing created');
  // E: levels never fall for any starting record
  let lower = 0; for (const lvl of [1, 2, 3, 4]) for (const miss of [true, false]) { const it = { lvl, due: miss ? day : tomorrow, right: 1, wrong: 1, seen: day, intro: day, mastered: false }; const X = run(base(it)); const y = JSON.parse(X.v1).items['sqlm-c3']; if (y.lvl < lvl || y.right < 1 || y.wrong < 1 || y.due < it.due) lower++; }
  ok(lower === 0, 'no starting record is ever lowered (level, right, wrong, due) over 8 combinations');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
