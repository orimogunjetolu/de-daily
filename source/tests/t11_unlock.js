// v9.1: opt-in faster unlock, AWS Course 4 Module 1 only
const H = require('./h.js'); let fail = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const FIN = `const fin = l => { S.theory[l.id] = today(); codeIds(l).forEach(id => { if (!S.items[id]) S.items[id] = { lvl: 1, due: addDays(today(), 3) }; }); };`;
// 1. fresh learner: no button before a lesson is finished; nothing written
let r = H(`({ h: unlockBtnHTML('aws0'), keys: Object.keys(localStorage._d) })`);
ok(r.h === '', 'no button before the C4M1 lesson is finished');
ok(!r.keys.includes('deLearn.aws'), 'deLearn.aws not created before first tap');
// 2. finished aws0: button shown with the sentence; only for C4M1
r = H(FIN + `fin(AWS_C4M1[0]); const core = Object.values(LESSONS).find(l => l.track !== 'aws'); fin(core);
  ({ h: unlockBtnHTML('aws0'), core: unlockBtnHTML(core.id), n: c4m1NextAfter('aws0').id, last: unlockBtnHTML(AWS_C4M1[AWS_C4M1.length - 1].id) })`);
ok(/Unlock next lesson now/.test(r.h) && /data-l="aws1"/.test(r.h), 'finished aws0 shows "Unlock next lesson now" for aws1');
ok(/spaced review still runs on its normal schedule/.test(r.h) && /Coursera deadlines/.test(r.h), 'etiquette sentence shown next to the button');
ok(r.core === '', 'no button for a SQL/core lesson');
ok(r.last === '', 'no button on the last C4M1 lesson (nothing after it)');
// 3. tap: unlocks only the next lesson; review schedules, terms, name drill, fast lane unchanged
r = H(FIN + `fin(AWS_C4M1[0]); A.nr['aws0-x'] = { s: 1, ivl: 1, due: '2030-01-01' }; save(); saveTerms(); saveAws();
  const snap = () => JSON.stringify([localStorage._d['deLearn.v1'], localStorage._d['deLearn.ext'], localStorage._d['deLearn.terms'], A.nr, A.hooks, A.ct, T.fast, S.cards, S.items, S.xp]);
  const b = snap(); const bad = awsUnlock('aws2', 'aws0'); const good = awsUnlock('aws1', 'aws0'); const a = snap();
  const ls = buildLessonSession('aws1');
  ({ bad, good, same: a === b, unl: Object.keys(A.unl), aws: JSON.parse(localStorage._d['deLearn.aws']), lsMode: ls.mode, lsL: ls.lesson.id })`);
ok(r.bad === false, 'cannot skip ahead: aws2 is refused from aws0');
ok(r.good === true && r.unl.join() === 'aws1', 'tap unlocks only the next lesson (' + r.unl + ')');
ok(r.same, 'deLearn.v1/.ext/.terms, cards, items, XP, name drill and fast lane unchanged by the tap');
ok(r.aws.nr['aws0-x'].due === '2030-01-01' && r.aws.unl.aws1, 'existing deLearn.aws data preserved; flag stored inside deLearn.aws');
ok(r.lsMode === 'lesson' && r.lsL === 'aws1', 'tap opens the next lesson session');
// 4. old v9 deLearn.aws without unl loads fine and is not rewritten on load
const old = JSON.stringify({ v: 1, hooks: { a: 'mine' }, nr: {}, ct: { c: { done: '2026-11-01' } } });
r = H(`({ s: localStorage._d['deLearn.aws'], h: A.hooks.a, b: unlockBtnHTML('aws0') })`, { 'deLearn.aws': old });
ok(r.s === old && r.h === 'mine' && r.b === '', 'v9 deLearn.aws byte-identical on load and readable');
if (fail) { console.log(fail + ' FAILED'); process.exit(1); } else console.log('all t11 checks passed');
