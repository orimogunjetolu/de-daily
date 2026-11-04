// v10 tests: node source/tests/t12_v10.js — stable question IDs, one-time migration + backup, % floor,
// back-a-step links, catch-up shows only new steps to learners who saw the lesson, rung gating.
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const store = { 'deLearn.v1': JSON.stringify({ xp: 1234, streak: 9, theory: {}, items: {}, cards: {}, problems: {} }) };
const R = H(`(() => { const out = {}; const D = '2026-11-04'; const T0 = today; today = d => d ? T0(d) : D;
  // 1) IDs
  const ids = []; let orderOk = true, backOk = true;
  Object.keys(ILLUS).forEach(lid => { const L = ILLUS[lid]; L.qs.forEach((q, i) => ids.push(vqId(lid, i)));
    if (L.order) { const s = L.order.filter(x => x[0] === 's').map(x => x[1]).sort((a, b) => a - b), q = L.order.filter(x => x[0] === 'q').map(x => x[1]).sort((a, b) => a - b);
      orderOk = orderOk && s.length === L.scenes.length && s.every((v, i) => v === i) && q.length === L.qs.length && q.every((v, i) => v === i); }
    L.qs.forEach(q => { if (q.back && !L.qs.some(x => x.id === q.back)) backOk = false; }); });
  out.idsUnique = new Set(ids).size === ids.length; out.nIds = ids.length; out.orderOk = orderOk; out.backOk = backOk;
  out.legacyId = vqId('sql5', 0) === 'sql5.0';
  // 2) backup
  backupV9(); out.bak = localStorage.getItem('deLearn.v1.v9bak') === localStorage.getItem('deLearn.v1');
  localStorage.setItem('deLearn.v1', '{"changed":1}'); backupV9(); out.bakKept = localStorage.getItem('deLearn.v1.v9bak') !== '{"changed":1}';
  // 3) migration: v9.1 learner with sql5 answers by position
  T.vis = { sql5: { seen: '2026-10-20', q: { 0: { n: 2, ok: '2026-10-20' }, 3: { n: 1, miss: '2026-10-21' } } } };
  const qBefore = JSON.stringify(T.vis.sql5.q); visMigrate('sql5'); visMigrate('sql5');
  out.mig = T.vis.sql5.qid['sql5.0'].n === 2 && T.vis.sql5.qid['sql5.3'].miss === '2026-10-21' && JSON.stringify(T.vis.sql5.q) === qBefore;
  out.rec = !!vqRec('sql5', 0) && vqRec('sql5', 0).ok === '2026-10-20';
  // 4) catch-up: seen lesson → only the v10 steps, labelled new
  Object.keys(LESSONS).forEach(id => S.theory[id] = S.theory[id] || null); ['sql1','sql2','sql3','sql4','sqlt','sqlr','sql5','sqlm'].forEach(id => { S.theory[id] = '2026-10-01'; if (ILLUS[id]) T.vis[id] = Object.assign(T.vis[id] || {}, { seen: '2026-10-01' }); });
  const cu = catchUpIllus(); out.cu = cu; const st = cu ? illusSteps(cu.id, null, cu.onlyNew) : [];
  out.cuNew = !!cu && cu.onlyNew && st.length > 0 && st.every(s => s.isNew && (s.type === 'illus' ? ILLUS[cu.id].scenes[s.sc] : ILLUS[cu.id].qs[s.qi]).v10);
  // 5) rung gating
  out.gate1 = rungReady(LESSONS.sqlc); T.vis.sql5.v10 = D; T.vis.sqlm.v10 = D; out.gate2 = rungReady(LESSONS.sqlc); out.gate3 = rungReady(LESSONS.sqlrt);
  S.theory.sqlc = D; out.gate4 = rungReady(LESSONS.sqlrt);
  // 6) floor: % can never drop below what v9.1 showed
  localStorage._d['deLearn.floor10'] = undefined; delete localStorage._d['deLearn.floor10'];
  const l = LESSONS.sql5; FLOOR10 = { l: { sql5: 0.93 }, m: {} }; out.floor = lessonProgress(l) >= 0.93;
  FLOOR10 = {}; initFloor10(); out.floorKey = !!localStorage.getItem('deLearn.floor10'); const f1 = localStorage.getItem('deLearn.floor10'); initFloor10(); out.floorOnce = localStorage.getItem('deLearn.floor10') === f1;
  // 7) module % with new lessons never lower than before them
  const m = CURRICULUM.modules.find(m => m.lessons.some(x => x.id === 'sqlc')); const prev = m.lessons.filter(x => !x.added || x.added < 10);
  out.modFloor = moduleProgress(m) >= prev.reduce((a, x) => a + lessonProgress(x), 0) / prev.length - 1e-9;
  return out; })()`, store);
ok(R.idsUnique, 'question IDs unique (' + R.nIds + ')'); ok(R.legacyId, 'legacy questions keep lid.position as their ID');
ok(R.orderOk, 'teaching order lists every scene and question exactly once'); ok(R.backOk, 'every "back a step" link resolves');
ok(R.bak, 'backup copies deLearn.v1 to deLearn.v1.v9bak'); ok(R.bakKept, 'backup is never overwritten');
ok(R.mig, 'migration copies answers to stable IDs, idempotent, old record untouched'); ok(R.rec, 'records read through stable IDs');
ok(R.cuNew, 'catch-up for a seen lesson shows only its new v10 steps (' + JSON.stringify(R.cu) + ')');
ok(R.gate1 === false && R.gate2 === true && R.gate3 === false && R.gate4 === true, 'rung gating: combos after v10 joins, real task after combos');
ok(R.floor, '% floor holds'); ok(R.floorKey && R.floorOnce, 'floor written once to deLearn.floor10'); ok(R.modFloor, 'module % not lowered by new lessons');
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
