// v9: AWS track scaffolding. Separate from the SQL daily session; additive storage; figures render.
const H = require('./h.js'); let fail = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const FIX = `const FX = { id: 'awsfx', title: 'Fixture lesson', theory: { why: 'w', body: ['b'], pro: 'p', q: { q: 'q', a: 'a' } },
  code: [{ id: 'awsfx-c1', task: 'route', lang: 'bash', code: 'aws ec2 [[create-route]] --gateway-id igw-1' }],
  qa: [{ id: 'awsfx-q1', q: 'Why?', a: 'Because [[stateful]].' }], problems: [{ id: 'awsfx-p1', kind: 'open', title: 'P', scenario: 's', solution: 'x', explain: 'e' }] };
  AWS_MODS[0].lessons.push(FX); awsIndex(AWS_MODS[0]);`;
// 1. fresh learner, with an AWS lesson present
let r = H(FIX + `const d = buildDailySession(); const a = buildAwsSession();
  ({ dailyAws: d.steps.some(s => (s.lesson && s.lesson.startsWith && s.lesson.startsWith('aws')) || (s.id && s.id.startsWith('aws'))), dl: d.counts.lesson && d.counts.lesson.id,
     al: a.counts.lesson && a.counts.lesson.id, mode: a.mode, aIds: a.steps.filter(s => s.id).map(s => s.id), ready: READY.some(m => m.id.startsWith('aws')),
     cur: CURRICULUM.modules.some(m => m.id.startsWith('aws')), scope: SCOPE, keys: Object.keys(localStorage._d) })`);
ok(!r.dailyAws, 'SQL daily session contains no AWS step');
ok(r.dl && !r.dl.startsWith('aws'), 'SQL daily new lesson is still a core lesson (' + r.dl + ')');
ok(r.al === 'aws0' && r.mode === 'aws', 'AWS session offers the first AWS lesson in Coursera order (' + r.al + ', mode aws)');
ok(r.aIds.every(id => id.startsWith('aws')), 'AWS session has only aws* items/problems');
ok(!r.ready && !r.cur, 'AWS modules are not in READY or CURRICULUM');
ok(r.scope === 'core', 'SCOPE restored to core after building the AWS session');
// 2. existing learner: stores byte-identical on load, and SQL plan unchanged by the AWS track
const base = H(`buildDailySession(); save(); saveExt && saveExt(); saveTerms(); JSON.stringify(localStorage._d)`);
const st = JSON.parse(base);
const r2 = H(FIX + `const before = JSON.stringify(localStorage._d); const p1 = JSON.stringify(buildDailySession().steps); buildAwsSession();
  ({ same: before === JSON.stringify(localStorage._d), p1, p2: JSON.stringify(buildDailySession().steps) })`, st);
ok(r2.same, 'deLearn.v1/.ext/.terms byte-identical on load and after planning the AWS session');
ok(r2.p1 === r2.p2, 'SQL daily plan identical before/after building an AWS session');
// 3. commitTermPlan with aws scope writes T.dayAws, never T.day
const r3 = H(`commitTermPlan({ scope: 'aws', open: [], activate: [], starts: [{ id: Object.keys(T4)[0], tier: 0 }] }); ({ day: T.day, dayAws: T.dayAws })`);
ok(!r3.day && r3.dayAws && r3.dayAws.newTerms === 1, 'AWS new-term count goes to T.dayAws (additive)');
// 4. every aws figure renders
const r4 = H(`const sc = [['awsvpc', {}], ['awsvpc', { hl: 'prv', ep: 1 }], ['awspath', AWS_PATH_OUT], ['awssgnacl', {}], ['awssgnacl', { after: 1 }],
  ['awsnacl', { pkt: 'TCP 22 from 198.51.100.7', rules: [[100, 'TCP 443', '0.0.0.0/0', 'ALLOW'], [110, 'TCP 22', '198.51.100.0/24', 'DENY'], ['*', 'all', '0.0.0.0/0', 'DENY']], hit: 1 }],
  ['awspeer'], ['awsdns'], ['awsep', { hl: 'gw' }], ['iamwho'], ['iampol', { json: AWS_TLS_POL, cap: 'bucket policy' }], ['iameval', { hit: 'deny' }], ['iamglue'], ['kmsenv'], ['salt'], ['awssec']];
  sc.map(([f, fp]) => { try { const h = ILL_FIGS[f]({ fp }, {}); return h.length > 50 && !/undefined/.test(h) ? '' : f; } catch (e) { return f + ':' + e.message; } }).filter(Boolean)`);
ok(!r4.length, 'all AWS figures render (' + r4.join(',') + ')');
const r5 = H(`ILL_FIGS.iampol({ fp: { json: AWS_TLS_POL } }, {})`);
ok(/aw-deny/.test(r5) && /aw-k-Condition/.test(r5), 'policy JSON highlights Effect/Condition and Deny');

// 5. content checks for Course 4 Module 1
const C = H(`(() => { const o = { n: AWS_C4M1.length, bad: [] }; const B = m => o.bad.push(m);
  AWS_C4M1.forEach(l => { const I = ILLUS[l.id]; if (!I || !I.scenes.length) B(l.id + ' no picture');
    const mcs = (I ? I.qs : []).filter(q => q.k === 'mc'); if (mcs.length < 3) B(l.id + ' <3 mc');
    mcs.forEach((q, i) => { if (q.w.length !== q.o.length || q.w[0] !== null || q.w.slice(1).some(x => !x || x.length < 4) || !q.why) B(l.id + ' mc' + i + ' wrong option unexplained'); });
    I && I.scenes.forEach((sc, i) => { try { const h = ILL_FIGS[sc.fig](sc, I.tables || {}); if (!h || /undefined|NaN/.test(h)) B(l.id + ' scene' + i + ' bad'); } catch (e) { B(l.id + ' scene' + i + ' ' + e.message); } });
    if (!l.theory || !l.theory.why || !l.cz) B(l.id + ' theory/cz');
    l.terms.forEach(t => { const h = AWS_HOOKS[t.id]; if (!h || !HOOK_KIND[h.k] || !h.t || !h.j) B(t.id + ' hook');
      if (h && h.k !== 'origin' && !/Memory aid|memory aid|Contrast pair/.test(h.t)) B(t.id + ' aid not labelled');
      if (isBite(t.id)) B(t.id + ' def too long (bite)'); if (!T4[t.id] || !T4[t.id].tiers.length) B(t.id + ' not in T4 pick/type/spot path');
      (TERMS4[t.id].t1.ph || []).forEach((ph, k) => { if (ph.d.length < 3 || ph.d.some(d => !d[1]) || !ph.spot || ph.spot.o.length < 3) B(t.id + ' phrase' + k); }); }); });
  AWS_CT.forEach(c => { if (!LESSONS[c.after]) B(c.id + ' after'); c.steps.forEach((s, i) => { if (s.w.length !== s.o.length || s.w[0] !== null || s.w.slice(1).some(x => !x) || !s.why) B(c.id + ' step' + i);
    if (!/Practice drawing, not a real AWS screenshot/.test(ctScreenHTML(s.scr))) B(c.id + ' label'); }); });
  o.terms = AWS_C4M1.reduce((a, l) => a + l.terms.length, 0); o.kinds = [...new Set(Object.values(AWS_HOOKS).map(h => h.k))].length; o.ct = AWS_CT.length; return o; })()`);
ok(C.n === 15 && C.ct === 5, '15 lessons (L0 + Coursera 03–20) and 5 click-throughs (' + C.n + ', ' + C.ct + ')');
ok(C.kinds === 4, 'hooks use all 4 kinds (origin, image, split, contrast)');
ok(!C.bad.length, C.terms + ' terms: picture, mc with every wrong option explained, hook k/t/j labelled, def under 15 words, full pick/type/spot path, ct steps explained+labelled ' + C.bad.join(' | '));
// 6. hooks/name drill are additive: never touch v1/.ext/.terms or the fast lane
const r6 = H(FIX + `const id = 'aws1-vpc'; T.terms[id] = { st: 'active', tier: 0, ph: [{ s: 1, seen: today() }, { s: 0 }] }; save(); saveTerms();
  const core = () => { const v = JSON.parse(localStorage._d['deLearn.v1']); ['xp', 'streak', 'best', 'lastActive', 'days'].forEach(k => delete v[k]); return JSON.stringify([v, localStorage._d['deLearn.ext'], localStorage._d['deLearn.terms']]); };
  const before = core(); const xp0 = S.xp; const tsB = JSON.stringify(T.terms[id]); const logB = T.log.length, fastB = JSON.stringify(T.fast || null);
  SESSION = { steps: [{ type: 'nr', id }], i: 0, stats: { right: 0, wrong: 0 }, xp: 0 }; F = null; viewNR(SESSION.steps[0]); const pk = F.form;
  nrAnswer(true); const a1 = JSON.parse(JSON.stringify(A.nr[id]));
  F = null; viewNR(SESSION.steps[0]); const tf = F.form; F.t0 = Date.now(); nrAnswer(true); const a2 = JSON.parse(JSON.stringify(A.nr[id]));
  F = null; viewNR(SESSION.steps[0]); F.t0 = Date.now(); nrAnswer(true); const a3 = JSON.parse(JSON.stringify(A.nr[id]));
  F = null; viewNR(SESSION.steps[0]); nrAnswer(false); const miss = viewNR(SESSION.steps[0]);
  A.hooks[id] = 'my own'; saveAws();
  ({ pk, tf, a1, a2, a3, a4: A.nr[id], same: JSON.stringify(T.terms[id]) === tsB && T.log.length === logB && JSON.stringify(T.fast || null) === fastB,
     stores: before === core(), xp: S.xp - xp0, aws: JSON.parse(localStorage._d['deLearn.aws']), miss: /aw-hook hint/.test(miss),
     match: [nrMatch('amazon vpc', 'VPC'), nrMatch('Shield Standrd', 'Shield Standard'), nrMatch('NAT', 'Internet gateway (IGW)'), nrMatch('internet gateway', 'Internet gateway (IGW)')] })`, st);
ok(r6.pk === 'pick' && r6.tf === 'type', 'name drill: pick first, then type');
ok(r6.a1.ivl === 1 && r6.a2.ivl === 2 && r6.a3.ivl === 6, 'name drill intervals: pick 1 day, first type 2 days, fast type ×3 (' + [r6.a1.ivl, r6.a2.ivl, r6.a3.ivl] + ')');
ok(r6.a4.s === 0 && r6.a4.ivl === 1 && r6.miss, 'a miss resets the drill to 1 day and shows the hook as a hint');
ok(r6.same, 'name drill never changes the term\'s flashcard/phrase state, T.log or the fast lane');
ok(r6.stores && r6.xp > 0 && r6.aws.v === 1 && r6.aws.hooks['aws1-vpc'] === 'my own', 'own hook + drill saved only in deLearn.aws; .ext/.terms and v1 (apart from XP/streak) untouched; drill earns XP (' + r6.xp + ')');
ok(r6.match.join() === 'true,true,false,true', 'typed-name matching (Amazon prefix, 1 typo, short form) ' + r6.match);
// 7. no deLearn.aws key is created just by loading; hook card shows before the definition at first meeting
const r7 = H(`S.theory.aws0 = '2026-01-01'; T.vis = T.vis || {}; T.vis.aws0 = { seen: '2026-01-01' }; const p = buildAwsSession(true); commitTermPlan(p.terms); const k = p.steps.findIndex(s => s.type === 'term' && s.k === 'adv' && AWS_HOOKS[s.id]);
  SESSION = { steps: p.steps, i: k, stats: { right: 0, wrong: 0 }, xp: 0, requeued: {} }; F = null; const h = k >= 0 ? viewTerm(p.steps[k]) : '';
  ({ k, hook: h.indexOf('aw-hook'), def: h.indexOf('class="def'), own: /Use my own hook/.test(h), key: 'deLearn.aws' in localStorage._d, ct: p.steps.some(s => s.type === 'ct') })`);
ok(r7.k >= 0 && r7.hook >= 0 && r7.hook < r7.def && r7.own, 'first meeting of an AWS term: hook card (with "Use my own hook") comes before the definition');
ok(!r7.key, 'no deLearn.aws key is written by loading or planning');
ok(!r7.ct, 'no click-through before its lesson theory is read (aws0 read, P1 needs aws1)');
console.log(fail ? fail + ' FAILED' : 'ALL OK'); process.exit(fail ? 1 : 0);
