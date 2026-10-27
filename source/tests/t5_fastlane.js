// v5 fast-lane tests: node source/tests/t5_fastlane.js
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const R = H(`(() => {
const out = {}; let D = '2026-11-02'; const T0 = today; today = d => d ? T0(d) : D;
S.theory['sql1-l1'] = D; Object.keys(LESSONS).slice(0, 8).forEach(l => S.theory[l] = D);
const day = (d, n, okN) => { D = d; for (let i = 0; i < n; i++) t4Log(i < okN); };
// ---- switching on only after a consistent run
day('2026-11-02', 10, 10); day('2026-11-03', 10, 10); day('2026-11-04', 10, 9);
D = '2026-11-05'; out.after3 = paceInfo4().mode;
day('2026-11-05', 3, 1);  /* too few answers: neither counts nor breaks */
D = '2026-11-06'; out.afterSmall = paceInfo4().mode;
day('2026-11-06', 6, 6); D = '2026-11-07'; out.after4 = paceInfo4().mode; out.noteOn = paceInfo4().note;
// ---- a broken run: a counted day under 90% resets it
const T1 = JSON.parse(JSON.stringify(T)); T.daily = {}; T.log = []; T.fast = { on: false, since: null, off: null, why: null };
day('2026-11-02', 10, 10); day('2026-11-03', 10, 8); day('2026-11-04', 10, 10); day('2026-11-05', 10, 10); day('2026-11-06', 10, 10);
D = '2026-11-07'; out.broken = paceInfo4().mode; day('2026-11-07', 10, 10); D = '2026-11-08'; out.broken4 = paceInfo4().mode;
// ---- while on: simulate days, all correct; caps and per-term rules
T.daily = {}; T.log = []; T.fast = { on: false, since: null, off: null, why: null }; T.terms = {}; T.ground = {}; T.day = null;
['2026-10-20','2026-10-21','2026-10-22','2026-10-23'].forEach(d => day(d, 10, 10));
const viol = []; let maxA = 0, maxNew = 0, laneDays = 0, maxTermSteps = 0, cap = 0; let d = '2026-10-24';
const codeOf = p => p.steps.filter(s => s.type !== 'term' && s.type !== 'help' && !(s.type === 'card' && ITEMS[s.id].kind === 'term')).map(s => s.type + s.id + (s.lesson || '')).join();
for (let i = 0; i < 25; i++) { D = d; const p = buildDailySession(); if (p.pace.mode === 'lane') laneDays++;
  const tsteps = p.steps.filter(s => s.type === 'term' || (s.type === 'card' && s.term));
  if (tsteps.length > p.terms.budget) viol.push('budget ' + d);
  commitTermPlan(p.terms); const before = JSON.parse(JSON.stringify(T.terms));
  p.steps.filter(s => s.type === 'term').forEach(s => { if (!termStepValid(s)) return; initTerm(s); if (s.k === 'adv' && blocksLeft(s.id).length) viol.push('adv before blocks'); answerTerm(s, true); });
  for (let k = 0; k < 5; k++) t4Log(true); /* keep 5+ answers a day so the day counts */
  Object.keys(T.terms).forEach(id => { const a = before[id], b = T.terms[id]; if (!a || a.tier !== b.tier) return; const up = b.ph.reduce((x, q, j) => x + Math.max(0, q.s - a.ph[j].s), 0); if (up > 1) viol.push('2 steps ' + id); });
  maxA = Math.max(maxA, Object.values(T.terms).filter(t => t.st === 'active').length); maxNew = Math.max(maxNew, (T.day && T.day.newTerms) || 0);
  d = addDays(d, 1); }
out.lane = { laneDays, maxA, maxNew, viol };
// code identical with lane on vs normal
D = d; const pOn = buildDailySession(); const codeOn = codeOf(pOn);
const sv = JSON.stringify(T.fast); T.fast.on = false; T.fast.off = D; T.daily = {}; const pOff = buildDailySession(); out.codeSame = codeOn === codeOf(pOff) && pOn.terms.budget === pOff.terms.budget; T.fast = JSON.parse(sv);
['2026-11-14','2026-11-15','2026-11-16','2026-11-17'].forEach(x => T.daily[x] = { n: 10, ok: 10 });
// ---- slip: off at once, back to normal caps, extra terms paused with credit kept
D = d; out.onBeforeSlip = paceInfo4().mode; const shown = {}; Object.keys(T.terms).forEach(id => shown[id] = termShown(id)); const steps = JSON.stringify(Object.fromEntries(Object.entries(T.terms).map(([k, v]) => [k, v.ph.map(q => q.s)])));
t4Log(true); t4Log(true); t4Log(false); t4Log(true); out.onAfter4 = T.fast.on; t4Log(true); out.offAt5 = !T.fast.on; out.why = T.fast.why;
const p2 = buildDailySession(); out.offMode = p2.pace.mode; out.offNote = p2.pace.note; out.offNewCap = p2.terms.starts.filter(s => s.tier === 0).length;
commitTermPlan(p2.terms); out.activeAfterOff = Object.values(T.terms).filter(t => t.st === 'active').length; out.paused = p2.terms.pause.length;
out.notLowered = Object.keys(shown).every(id => termShown(id) + 1e-9 >= shown[id]); out.stepsKept = steps === JSON.stringify(Object.fromEntries(Object.entries(T.terms).map(([k, v]) => [k, v.ph.map(q => q.s)])));
// the next day: a fresh run of 4 is needed
D = addDays(d, 1); out.nextDay = paceInfo4().mode;
// ---- rolling slip: every counted day fine, but recent answers under 85%
T.fast = { on: true, since: D, off: null, why: null }; T.log = Array.from({ length: 20 }, (_, i) => ({ d: D, ok: i % 5 ? 1 : 0 })); T.log[1].ok = 0; /* 75% */
D = addDays(D, 1); t4Log(true); out.rollOff = !T.fast.on && /recent/.test(T.fast.why);
return out; })()`);
console.log(JSON.stringify(R, null, 1));
ok(R.after3 !== 'lane' && R.afterSmall !== 'lane' && R.after4 === 'lane', 'on only after 4 consistent counted days; a small day neither counts nor breaks the run');
ok(/Fast lane on: consistent accuracy/.test(R.noteOn), 'note: "Fast lane on: consistent accuracy"');
ok(R.broken !== 'lane' && R.broken4 === 'lane', 'a counted day under 90% breaks the run; 4 fresh days needed');
ok(R.lane.laneDays >= 20 && R.lane.maxA > 3 && R.lane.maxA <= 5, 'lane allows up to 5 active terms (max seen ' + R.lane.maxA + ')');
ok(R.lane.maxNew >= 2 && R.lane.maxNew <= 2, 'up to 2 new terms a day (max seen ' + R.lane.maxNew + ')');
ok(!R.lane.viol.length, 'term items within the 1/3 budget, blocks first, one step a day: ' + R.lane.viol.slice(0, 5).join('; '));
ok(R.codeSame, 'code steps and term budget identical with lane on or off');
ok(R.onBeforeSlip === 'lane' && R.onAfter4 && R.offAt5 && /today 80%/.test(R.why), 'slip: off at once when today reaches 5 answers under 90% (' + R.why + ')');
ok(R.offMode !== 'lane' && /Fast lane off/.test(R.offNote) && R.offNewCap <= 1, 'after a slip: normal pace, note shown, at most 1 new term');
ok(R.activeAfterOff <= 3 && R.paused >= 1 && R.notLowered && R.stepsKept, 'extra terms paused, phrase steps and shown progress kept (' + R.activeAfterOff + ' active, ' + R.paused + ' paused)');
ok(R.nextDay !== 'lane', 'stays off the next day (a fresh run is needed)');
ok(R.rollOff, 'rolling accuracy under 85% turns it off');
console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
