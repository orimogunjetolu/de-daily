// v6 illustration tests: node source/tests/t6_illus.js
// 1) every scene's SQL really produces the drawn result (real sql.js 3.49), 2) every visual question's answer is right,
// 3) flow: pictures → questions → theory → terms, 4) existing learners get a catch-up and lose no progress.
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
(async () => {
  const R = await H(`(async () => {
  const out = { scenes: [], qs: [], html: [] };
  const norm = r => JSON.stringify(r);
  for (const lid of Object.keys(ILLUS)) { const L = ILLUS[lid]; if (!LESSONS[lid]) { out.scenes.push([lid, 'no such lesson', false]); continue; }
    for (let i = 0; i < L.scenes.length; i++) { const sc = L.scenes[i];
      try { out.html.push([lid + '#' + i, illFigHTML(sc, L, '').length > 50]); } catch (e) { out.html.push([lid + '#' + i, false, e.message]); }
      (sc.ins || []).forEach(x => { if (!x.raw && !illTab(L, x)) out.scenes.push([lid + '#' + i, 'missing table ' + x.t, false]); });
      if (!sc.sql || !sc.out) continue;
      try { const r = await runIll(sc.sql, lid);
        if (sc.out.err) { out.scenes.push([lid + '#' + i, 'expected error, got rows', false]); continue; }
        const exp = { columns: sc.out.c, values: sc.out.r }; const c = compareResults(r, exp, !!sc.ordered);
        const m = (sc.out.m || []).length === sc.out.r.length || !sc.out.m;
        out.scenes.push([lid + '#' + i, c.ok ? 'ok' : c.msg + ' got ' + norm(r.values), c.ok && m]);
      } catch (e) { out.scenes.push([lid + '#' + i, e.message, !!(sc.out.err && e.message.includes(sc.out.err))]); } }
    for (let i = 0; i < L.qs.length; i++) { const q = L.qs[i]; let good = false, why = '';
      if (q.k === 'mc') good = q.o.length >= 3 && new Set(q.o).size === q.o.length;
      else if (q.k === 'tap') { const t = L.tables[q.t]; good = !!t && q.ans.length > 0 && q.ans.every(k => k < t.r.length);
        if (good && q.sql && /^\s*(SELECT|WITH)/i.test(q.sql) && !/____/.test(q.sql)) { try { const r = await runIll(q.sql, lid); why = norm(r.values); } catch (e) { good = false; why = q.sql + ' :: ' + e.message; } } }
      else if (q.k === 'run') { try { const s = await runIll(q.sol, lid); good = s.values.length > 0 && !(q.forbid && new RegExp(q.forbid, 'i').test(q.sol)) && /____/.test(q.code);
          if (q.forbid) { const alt = q.alt ? await runIll(q.alt, lid) : null; if (alt) good = good && compareResults(alt, s, false).ok; } } catch (e) { why = e.message; } }
      out.qs.push([lid + ' q' + i + ' ' + q.k, good, why]); } }
  // flow for a brand-new learner reaching an illustrated lesson
  let D = '2026-11-02'; const T0 = today; today = d => d ? T0(d) : D;
  const lesson = LESSONS['sql5'] ? 'sql5' : Object.keys(ILLUS)[0];
  const lp = buildLessonSession(lesson).steps.map(s => s.type);
  out.lessonFlow = lp.slice(0, 20).join(',');
  out.lessonOrder = lp.indexOf('theory') > lp.lastIndexOf('vq') && lp[0] === 'illus' && lp.lastIndexOf('illus') < lp.indexOf('vq');
  // daily: put the learner just before an illustrated lesson
  const order = []; orderedReadyModules().forEach(m => m.lessons.forEach(l => order.push(l.id)));
  const target = order.find(id => ILLUS[id]);
  order.slice(0, order.indexOf(target)).forEach(id => { S.theory[id] = D; LESSONS[id].itemIds.forEach(it => { if (ITEMS[it].kind !== 'term') S.items[it] = { lvl: 4, due: '2099-01-01', mastered: true }; }); });
  const nl = nextLesson(); out.nextIs = nl && nl.id; out.target = target;
  const p = buildDailySession(); const ty = p.steps.map(s => s.type + (s.lesson ? ':' + s.lesson : ''));
  out.dailyFlow = ty.join(',');
  const iT = ty.indexOf('theory:' + target), lastIll = Math.max(ty.lastIndexOf('illus:' + target), ty.lastIndexOf('vq:' + target));
  out.dailyOrder = iT > 0 && lastIll >= 0 && lastIll < iT;
  out.termsFromTarget = p.terms.open.concat(p.terms.close).filter(s => LESSONS[target].itemIds.includes(s.id)).length;
  out.budgetOther = p.terms.budget; out.counts = { illus: p.counts.illus, other: p.counts.other };
  // after reading theory (not pictures): target's terms are blocked; after pictures: allowed
  S.theory[target] = D; const q1 = newTermQueue(null).filter(id => LESSONS[target].itemIds.includes(id)).length;
  visState(target).seen = D; const q2 = newTermQueue(null).filter(id => LESSONS[target].itemIds.includes(id)).length;
  out.gate = [q1, q2];
  // existing learner (read sql2..sql9 before v6, with term progress): catch-up appears, one lesson a day, progress untouched
  T.vis = {}; order.forEach(id => S.theory[id] = D);
  const anyTerm = Object.keys(T4).find(id => LESSONS[ITEMS[id].lesson] && ILLUS[ITEMS[id].lesson]);
  if (anyTerm) T.terms[anyTerm] = T.terms[anyTerm] || { st: 'active', tier: 0, ph: T4[anyTerm].tiers[0].ph.map(() => ({ s: 2, ok: [] })), started: D };
  const before = JSON.stringify({ S: { items: S.items, cards: S.cards, theory: S.theory, xp: S.xp }, terms: T.terms });
  D = '2026-11-03'; const p2 = buildDailySession(); const cu = p2.counts.catchUp; out.cu = cu; out.cuBusyFirst = !anyTerm || cu === ITEMS[anyTerm].lesson;
  const lessonsWithIll = new Set(p2.steps.filter(s => s.type === 'illus').map(s => s.lesson)); out.cuOne = lessonsWithIll.size === 1;
  out.cuBeforeTerms = p2.steps.findIndex(s => s.type === 'illus') < Math.max(0, p2.steps.findIndex(s => s.type === 'term'));
  commitTermPlan(p2.terms); const after = JSON.stringify({ S: { items: S.items, cards: S.cards, theory: S.theory, xp: S.xp }, terms: T.terms });
  out.notLowered = (() => { const a = JSON.parse(before), b = JSON.parse(after); return Object.keys(a.terms).every(id => b.terms[id] && b.terms[id].ph.every((x, j) => x.s >= a.terms[id].ph[j].s)) && Object.keys(a.S.theory).every(k => b.S.theory[k]); })();
  return out; })()`);
  R.html.forEach(([k, g, e]) => ok(g, 'renders ' + k + (e ? ' ' + e : '')));
  R.scenes.forEach(([k, msg, g]) => ok(g, 'scene SQL matches drawing ' + k + (g ? '' : ' :: ' + msg)));
  R.qs.forEach(([k, g, w]) => ok(g, 'question ' + k + (g ? '' : ' :: ' + w)));
  ok(R.lessonOrder, 'lesson session: pictures → questions → theory (' + R.lessonFlow + ')');
  ok(R.nextIs === R.target, 'next lesson is the first illustrated one (' + R.target + ')');
  ok(R.dailyOrder, 'daily: pictures & questions come before the theory');
  ok(R.termsFromTarget === 0, 'daily: no terms from the lesson on the day its pictures are first shown');
  ok(R.gate[0] === 0 && R.gate[1] > 0, 'terms wait for the pictures, then start (' + R.gate + ')');
  ok(!!R.cu && R.cuOne, 'existing learner: one catch-up lesson a day (' + R.cu + ')');
  ok(R.cuBusyFirst, 'catch-up prefers a lesson with terms in progress');
  ok(R.cuBeforeTerms, 'catch-up shown before term practice');
  ok(R.notLowered, 'no progress lowered by v6 planning');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH', e); process.exit(1); });
