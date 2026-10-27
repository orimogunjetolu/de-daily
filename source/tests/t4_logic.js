// v4 terminology engine tests: node source/tests/t4_logic.js
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const R = H(`(() => {
const out = {}; let D = '2026-11-02'; const T0 = today; today = d => d ? T0(d) : D;
// ---- data integrity
const bad = [];
Object.keys(T4).forEach(id => { const tr = T4[id].tiers; if (!tr.length || !tr[0].ph.length) bad.push(id + ' no tier');
  tr.forEach((t, ti) => t.ph.forEach((p, pi) => { if (p.a.length > 3) bad.push(id + ' alts'); if (phraseDistractors(id, ti, pi, 3).length < 3) bad.push(id + ' t' + ti + ' p' + pi + ' distractors'); const q = spotQuestion(id, ti, pi); if (!(q.o && q.o.length >= 2) && !(q.tap && q.tap.some(x => x[1] === 1))) bad.push(id + ' spot'); }));
  T4[id].blocks.forEach(b => { if (!GROUND[b]) bad.push(id + ' block ' + b); }); });
Object.keys(GROUND).forEach(b => GROUND[b].qs.forEach(q => { if (q.tap ? q.tap.filter(x => x[1] === 1).length !== 1 : !(q.o && q.o.length >= 3)) bad.push('ground ' + b); }));
out.bad = bad; out.nTerms = Object.keys(T4).length; out.authored = Object.values(T4).filter(x => x.authored).length; out.tier3 = Object.values(T4).filter(x => x.tiers.length >= 3).length;
out.maxPh = Math.max(...Object.values(T4).map(x => x.tiers[0].ph.length));
// ---- checking: accepted wordings and precision words
const ob = T4['sql3-t1'].tiers[0].ph, pr = T4['sql2-t1'].tiers[0].ph;
out.chk = {
  exact: checkPhrase('by one or more expressions', ob[1]).ok, typo: checkPhrase('by one or more expresions', ob[1]).ok, alt: checkPhrase('by one or more columns', ob[1]).ok,
  on: checkPhrase('on one or more expressions', ob[1]), one: checkPhrase('by one expression', ob[1]).ok,
  each: checkPhrase('for each row', pr[1]).ok, every: checkPhrase('for every row', pr[1]).ok, oneRow: checkPhrase('for one row', pr[1]),
  notTrue: checkPhrase('WHERE keeps only the rows where it is not TRUE', pr[2]).ok, keepTrue: checkPhrase('where keeps the rows where it is true', pr[2]).ok,
  result: checkPhrase('sorts the result rows', ob[0]).ok, table: checkPhrase('sorts the table rows', ob[0]).ok,
  order: checkPhrase('FROM, WHERE, GROUP BY, HAVING', T4['sql3-t4'].tiers[0].ph[1]).ok, orderBad: checkPhrase('FROM, GROUP BY, WHERE, HAVING', T4['sql3-t4'].tiers[0].ph[1]).ok };
// ---- fresh learner, simulated days, always correct
S.theory['sql1-l1'] = D; Object.keys(LESSONS).slice(0, 4).forEach(l => S.theory[l] = D);
const log = []; let maxActive = 0, violations = [];
const run = (d, answer) => { D = d; const p = buildDailySession(); commitTermPlan(p.terms); const before = JSON.parse(JSON.stringify(T.terms));
  const tsteps = p.steps.filter(s => s.type === 'term');
  tsteps.forEach(s => { if (!termStepValid(s)) return; const f = initTerm(s); if (s.k === 'adv' && blocksLeft(s.id).length) violations.push('adv before ground ' + s.id); answerTerm(s, answer(s, f)); });
  Object.keys(T.terms).forEach(id => { const a = before[id], b = T.terms[id]; if (!a || a.tier !== b.tier) return; const up = b.ph.reduce((x, p, i) => x + Math.max(0, p.s - a.ph[i].s), 0); if (up > 1) violations.push('2 steps in a day ' + id + ' ' + d);
    const firstOpen = a.ph.findIndex(p => p.s < 3); b.ph.forEach((p, i) => { if (p.s > a.ph[i].s && i !== firstOpen) violations.push('phrase out of order ' + id); }); });
  maxActive = Math.max(maxActive, Object.values(T.terms).filter(t => t.st === 'active').length);
  return { p, tsteps }; };
const first = run(D, () => true);
out.day1 = { help: first.p.steps[0].type, open: first.p.counts.tOpen, ground: first.p.counts.ground, other: first.p.counts.other, close: first.p.counts.tClose };
const daysToMaster = {}; let d = D;
let nAns = 0; for (let i = 1; i <= 60; i++) { d = addDays(d, 1); const r = run(d, () => ++nAns % 5 !== 0); /* 80% correct keeps normal pace */ Object.keys(T.terms).forEach(id => { if (T.terms[id].done[0] && !daysToMaster[id]) daysToMaster[id] = i + 1; });
  const tc = r.p.counts.tOpen + r.p.counts.tClose; if (tc > Math.max(2, Math.round(r.p.counts.other / 2)) || (r.p.counts.other >= 4 && tc > r.p.counts.other)) violations.push('split ' + d + ' ' + tc + '/' + r.p.counts.other); log.push(tc + '/' + r.p.counts.other); }
out.daysToMaster = daysToMaster; out.maxActive = maxActive; out.violations = violations.slice(0, 10); out.splitLog = log.slice(0, 12).join(' ');
out.grounded = Object.keys(T.ground).filter(groundDone).length; out.cardsAfter = Object.keys(S.cards).filter(id => ITEMS[id].kind === 'term').length;
out.states = Object.keys(T.terms).map(id => id + ':' + T.terms[id].st + ':t' + T.terms[id].tier + ':' + T.terms[id].ph.map(p => p.s).join('') + ':' + JSON.stringify(T.terms[id].done)).join(' '); out.tierWait = Object.values(T.terms).filter(t => t.st === 'wait' || t.tier > 0).length;
// ---- a miss drops one step
{ const id0 = 'sql9-t1'; D = addDays(d, 1); T.terms[id0] = newTermState(id0, 0, 'active'); T4[id0].blocks.forEach(b => T.ground[b] = { ok: D, done: D, n: 2 }); const ts = T.terms[id0]; ts.ph[0].s = 2; ts.ph[0].seen = D;
  answerTerm({ type: 'term', k: 'adv', id: id0 }, false); out.miss = [2, ts.ph[0].s]; answerTerm({ type: 'term', k: 'adv', id: id0 }, true); out.sameDayAfterMiss = ts.ph[0].s;
  D = addDays(D, 1); answerTerm({ type: 'term', k: 'adv', id: id0 }, true); out.nextDay = ts.ph[0].s; answerTerm({ type: 'term', k: 'adv', id: id0 }, true); out.sameDay2 = ts.ph[0].s; delete T.terms[id0]; }
// ---- pacing touches only terms
const codeBefore = buildDailySession().steps.filter(s => s.type !== 'term' && s.type !== 'help' && !(s.type === 'card' && ITEMS[s.id].kind === 'term')).map(s => s.type + s.id + (s.lesson || '')).join();
T.log = Array.from({ length: 20 }, () => ({ d: D, ok: 0 }));
const slow = buildDailySession(); const codeAfter = slow.steps.filter(s => s.type !== 'term' && s.type !== 'help' && !(s.type === 'card' && ITEMS[s.id].kind === 'term')).map(s => s.type + s.id + (s.lesson || '')).join();
out.pace = { mode: slow.pace.mode, codeSame: codeBefore === codeAfter, starts: slow.terms.starts.length, extra: slow.steps.filter(s => s.extra).length };
T.log = Array.from({ length: 20 }, () => ({ d: D, ok: 1 })); out.fastMax = buildDailySession().pace.maxActive;
return out; })()`);
console.log(JSON.stringify(R, null, 1));
ok(!R.bad.length, 'data integrity (' + R.nTerms + ' terms, ' + R.authored + ' authored, ' + R.tier3 + ' with tier 3): ' + R.bad.slice(0, 5).join('; '));
const c = R.chk;
ok(c.exact && c.typo && c.alt, 'accepted wordings + typo tolerance');
ok(!c.on.ok && c.on.prec && c.on.prec.want === 'by', '"on" instead of "by" counts as wrong, with reason');
ok(!c.one, '"one" instead of "one or more" is wrong');
ok(c.each && c.every && !c.oneRow.ok, 'for each/every row ok, for one row wrong');
ok(!c.notTrue && c.keepTrue, 'added "not" is wrong; correct wording accepted');
ok(c.result && !c.table, 'result rows vs table rows');
ok(c.order && !c.orderBad, 'clause order enforced');
ok(R.day1.help === 'help', 'help step shown once in first session');
ok(R.day1.ground > 0 && R.day1.open <= R.day1.ground + 2, 'day 1 starts with grounding');
ok(!R.violations.length, 'one step per term per day, phrases in order, grounding gate, split cap: ' + R.violations.join('; '));
ok(R.maxActive <= 2, 'at most 2 active terms at normal pace (max seen ' + R.maxActive + ')');
ok(Object.keys(R.daysToMaster).length >= 2 && Math.min(...Object.values(R.daysToMaster)) >= 7, 'tier 1 mastery takes many days: ' + JSON.stringify(R.daysToMaster));
ok(R.cardsAfter >= 2, 'mastered tier 1 becomes a flashcard');
ok(R.miss[1] === 1 && R.sameDayAfterMiss === 1 && R.nextDay === 2 && R.sameDay2 === 2, 'miss drops one step; no step-up on the miss day; max one step per day');
ok(R.pace.mode === 'slow' && R.pace.codeSame && R.pace.starts === 0, 'slow pacing: no new terms, code identical');
ok(R.fastMax === 3, 'fast pacing allows 3 active terms');
console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
