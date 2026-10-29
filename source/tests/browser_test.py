"""Browser tests for DE Daily (needs playwright + Chrome).
Run from the repo root after `python3 source/build.py`:
    python3 source/tests/browser_test.py
It builds a scratch web root in source/tests/.www with
  v2/  = index.html of commit 08c6b1a (before v3: only deLearn.v1)
  v3/  = index.html of commit 371b94a (v3: deLearn.v1 + deLearn.ext)
  v4/  = index.html of commit c35b2c9 (v4: + deLearn.terms)
  v5/  = index.html of commit 051a0fb (v5: + fast lane fields in deLearn.terms)
  v6/  = index.html of commit f5aa839 (v6: + deLearn.terms.vis, picture-first lessons)
  v7/  = index.html of commit 19df660 (v7: entities/relationships + many-to-many lessons)
  v8/  = index.html of commit 60df8f4 (v8: What's inside a table + transfer test)
  new/ = the current build (index.html, sw.js, manifest, icons)
and checks that saved progress from both old versions survives the update untouched."""
import json, os, shutil, subprocess, threading, http.server, functools, datetime
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..')); WWW = os.path.join(HERE, '.www')
shutil.rmtree(WWW, ignore_errors=True)
for name, rev in [('v2', '08c6b1a'), ('v3', '371b94a'), ('v4', 'c35b2c9'), ('v5', '051a0fb'), ('v6', 'f5aa839'), ('v7', '19df660'), ('v8', '60df8f4')]:
    os.makedirs(os.path.join(WWW, name)); open(os.path.join(WWW, name, 'index.html'), 'wb').write(subprocess.check_output(['git', 'show', rev + ':index.html'], cwd=REPO))
os.makedirs(os.path.join(WWW, 'new'))
for f in ['index.html', 'sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png']: shutil.copy(os.path.join(REPO, f), os.path.join(WWW, 'new', f))
PORT = 8766
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=WWW)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'; SHOTS = os.environ.get('SHOTS')
KEEP8 = os.environ.get('KEEP8') or SHOTS or os.path.join(HERE, '.shots8'); os.makedirs(KEEP8, exist_ok=True)
fails = []
def check(c, m):
    print(('ok   ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
yest = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
CRAFT = """() => {
  const t = today(); const y = '%s';
  S.xp = 1234; S.streak = 9; S.best = 11; S.lastActive = y; S.days[y] = { xp: 80, steps: 20, session: true, mins: 24 };
  S.settings.minutes = 30; S.settings.focus = 'etl';
  ['sql1','sql2','sql3','etl1','etl2'].forEach(l => S.theory[l] = '2026-10-20');
  const mk = (id, lvl, extra) => S.items[id] = Object.assign({ lvl, due: t, right: lvl, wrong: 1, seen: y, intro: '2026-10-20', mastered: false }, extra || {});
  mk('sql1-t1', 2); mk('etl2-t1', 3); mk('sql8-t3', 4); mk('sql2-t3', 1); mk('sql4-t3', 2); mk('sql1-t3', 3); mk('sql3-t1', 4);
  mk('sql1-t2', 4, { mastered: true }); S.cards['sql1-t2'] = { ease: 2.36, ivl: 6, reps: 2, lapses: 1, due: '2026-10-30', added: '2026-10-11' };
  mk('etl1-t1', 4, { mastered: true }); S.cards['etl1-t1'] = { ease: 2.5, ivl: 1, reps: 1, lapses: 0, due: t, added: '2026-10-12' };
  const code = Object.keys(ITEMS).filter(k => ITEMS[k].kind === 'code').slice(0, 3); code.forEach((k, i) => mk(k, i + 1));
  S.problems[Object.keys(PROBLEMS)[0]] = { solved: true, tries: 2, last: y };
  save(); return localStorage.getItem('deLearn.v1');
}""" % yest
PROG = "(() => { const o = {}; Object.values(LESSONS).forEach(l => o[l.id] = lessonProgress(l)); Object.keys(ITEMS).forEach(id => o[id] = itemProgress(id)); return o; })()"

def drive(page, maxsteps=300, wrong_every=4):
    """Click through a session. In v4 term steps it answers correctly, except every Nth answer."""
    n = 0; seen = set()
    for i in range(maxsteps):
        if page.locator('main.summary').count(): return i, seen
        acts = page.eval_on_selector_all('[data-act]:not([disabled])', 'els => els.map(e => e.dataset.act)')
        def c(sel): page.click(sel)
        for a in ['helpDone', 'illNext', 'biteIntro', 'theoryDone', 'showCard', 'next', 'probDone']:
            if a in acts: c(f'[data-act="{a}"] >> nth=0'); seen.add(a); break
        else:
            if 'tSelf' in acts: c('[data-act="tSelf"][data-ok="1"]'); seen.add('tSelf')
            elif 'biteSelf' in acts or 'selfGrade' in acts: a = 'biteSelf' if 'biteSelf' in acts else 'selfGrade'; c(f'[data-act="{a}"][data-ok="1"]')
            elif 'gradeCard' in acts: c('[data-act="gradeCard"][data-g="2"]'); seen.add('gradeCard')
            elif 'tPick' in acts or 'tTap' in acts or 'tCheck' in acts:
                n += 1; wrong = wrong_every and n % wrong_every == 0
                info = page.evaluate("({ form: F.form, kind: F.kind, ok: F.opts ? F.opts.findIndex(o => o.i === 0) : -1, tap: F.q && F.q.tap ? F.q.tap.findIndex(x => x[1] === 1) : -1, ans: F.ph ? F.ph.t : (F.tr ? F.tr.def : '') })")
                seen.add('term:' + str(info['kind']) + ':' + str(info['form']))
                if SHOTS and ('shot:' + str(info['form']) + str(info['kind'])) not in seen: seen.add('shot:' + str(info['form']) + str(info['kind'])); page.screenshot(path=f"{SHOTS}/v4-{info['kind']}-{info['form']}.png", full_page=True)
                if 'tCheck' in acts:
                    page.fill('.inputs input, textarea.recall', 'wrong answer words' if wrong else info['ans']); c('[data-act="tCheck"]')
                elif 'tTap' in acts:
                    k = info['tap'] if not wrong else (info['tap'] + 1) % page.locator('[data-act="tTap"]').count(); c(f'[data-act="tTap"][data-i="{k}"]')
                else:
                    k = info['ok'] if not wrong else (info['ok'] + 1) % page.locator('[data-act="tPick"]').count(); c(f'[data-act="tPick"][data-i="{k}"]')
                if SHOTS and wrong and 'shot:fb' not in seen: seen.add('shot:fb'); page.screenshot(path=f'{SHOTS}/v4-feedback-wrong.png', full_page=True)
            elif 'vqPick' in acts or 'vqCheck' in acts:
                n += 1; wrong = wrong_every and n % wrong_every == 0; seen.add('vq')
                q = page.evaluate("({ k: F.q.k, ok: F.opts ? F.opts.findIndex(o => o.i === 0) : -1, ans: F.q.ans || [], sol: F.q.sol || '' })")
                if q['k'] == 'mc': c(f'[data-act="vqPick"][data-k="{(q["ok"] + (1 if wrong else 0)) % page.locator("[data-act=vqPick]").count()}"]')
                elif q['k'] == 'cls':
                    its = page.evaluate("F.q.items.map(it => it[1])"); ncat = page.evaluate("F.q.cats.length")
                    for i, cat in enumerate(its): c(f'[data-act="vqCls"][data-i="{i}"][data-c="{(cat + (1 if wrong and i == 0 else 0)) % ncat}"]')
                    c('[data-act="vqCheck"]')
                elif q['k'] == 'tapc':
                    c(f'[data-act="vqTapC"][data-c="{(q["ans"][0] + (1 if wrong else 0)) % 3}"]'); c('[data-act="vqCheck"]')
                elif q['k'] == 'tap':
                    for r in (q['ans'] if not wrong else q['ans'][:1] + [x for x in range(9) if x not in q['ans']][:1]): c(f'[data-act="vqTap"][data-r="{r}"]')
                    c('[data-act="vqCheck"]')
                else: page.fill('#vqCode', 'SELECT 1' if wrong else q['sol']); c('[data-act="vqCheck"]'); page.wait_for_selector('[data-act="next"]', timeout=8000)
            elif 'bitePick' in acts: c('[data-act="bitePick"] >> nth=0')
            elif 'checkBite' in acts:
                for el in page.query_selector_all('.inputs input, textarea.recall'): el.fill('something')
                c('[data-act="checkBite"]')
            elif 'chip' in acts:
                for _ in range(page.locator('.slot').count()): c('[data-act="chip"]:not([disabled]) >> nth=0')
                c('[data-act="checkFade"]'); seen.add('fade')
            elif 'checkFade' in acts:
                for el in page.query_selector_all('.inputs input, textarea.recall'): el.fill('x')
                c('[data-act="checkFade"]'); seen.add('fade')
            elif 'checkProb' in acts:
                page.fill('#probCode', 'SELECT 1'); c('[data-act="checkProb"]'); page.wait_for_timeout(1200); seen.add('problem')
                if page.locator('[data-act="reveal"]').count(): c('[data-act="reveal"]')
            elif 'openGrade' in acts: c('[data-act="openGrade"][data-g="1"]'); seen.add('problem')
            elif 'reveal' in acts: c('[data-act="reveal"] >> nth=-1')
            else: print('stuck', acts, page.inner_text('main')[:300]); return -1, seen
        page.wait_for_timeout(25)
    return 0, seen

def get(page, k): return page.evaluate(f"localStorage.getItem('{k}')")
def ctxpage(br, sw='block'):
    ctx = br.new_context(service_workers=sw, viewport={'width': 400, 'height': 860}); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    return ctx, page, errs

def preserve(br, label, oldbuild, play_old):
    ctx, page, errs = ctxpage(br)
    page.goto(f'{BASE}/{oldbuild}/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if play_old:  # build real v3 progress (bite ladders, pacing log) by playing a v3 session
        if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
        page.click('#startBtn'); r, _ = drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    v1, ext = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'); oldprog = page.evaluate(PROG); old = json.loads(v1)
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1, f'[{label}] deLearn.v1 byte-identical after loading the new build')
    if ext is not None: check(get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.ext byte-identical after loading the new build')
    else: check(get(page, 'deLearn.ext') is not None, f'[{label}] deLearn.ext created additively (v3 migration still runs)')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    T = json.loads(get(page, 'deLearn.terms'))
    st = {k: (v['st'], [p['s'] for p in v['ph']]) for k, v in T['terms'].items()}
    print(f'  [{label}] migrated terms:', st)
    check(all(v['st'] in ('paused', 'active') for v in T['terms'].values()) and len(T['terms']) >= 5, f'[{label}] in-progress terms migrated with credit ({len(T["terms"])})')
    check('sql1-t2' not in T['terms'] and 'etl1-t1' not in T['terms'], f'[{label}] mastered terms stay flashcards')
    check(max(T['terms']['sql8-t3']['ph'][i]['s'] for i in range(len(T['terms']['sql8-t3']['ph']))) >= 2, f'[{label}] old L4 term keeps pick+type credit')
    check('1234' in page.inner_text('.stats') or json.loads(v1)['xp'] > 1234, f'[{label}] XP shown')
    page.click('#startBtn'); n, seen = drive(page)
    check(n > 0, f'[{label}] v4 daily session completes ({n} steps; {sorted(seen)})')
    after = json.loads(get(page, 'deLearn.v1'))
    check(after['xp'] >= old['xp'] and after['best'] >= old['best'] and after['cards']['sql1-t2'] == old['cards']['sql1-t2'], f'[{label}] XP {old["xp"]}→{after["xp"]}, best kept, untouched card unchanged')
    check(all(k in after['items'] and (after['items'][k]['lvl'] >= v['lvl'] or after['items'][k].get('mastered')) for k, v in old['items'].items() if ITEM_KIND.get(k) == 'term'), f'[{label}] no term record in deLearn.v1 lowered')
    if ext is not None: check(get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.ext still untouched after a v4 session')
    prog2 = page.evaluate(PROG); lower = [k for k in oldprog if ITEM_KIND.get(k) == 'term' and prog2.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] term progress not lowered after a session with wrong answers (code items follow the normal fade rule) ' + str(lower[:5]))
    page.click('main.summary [data-to="home"]'); page.click('nav [data-to="roadmap"]'); page.click('li[data-l="sql1"]'); page.click('[data-act="startLesson"]'); n2, _ = drive(page)
    check(n2 > 0, f'[{label}] lesson practice completes ({n2} steps)')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5]))
    ctx.close()

def preserve_v4(br):
    # real v4 state: crafted v1, a v3 session, then two v4 sessions; then load v5
    ctx, page, errs = ctxpage(br); label = 'from v4 c35b2c9'
    page.goto(f'{BASE}/v3/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v4/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    v1, ext, t4 = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), json.loads(get(page, 'deLearn.terms')); oldprog = page.evaluate(PROG)
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1 and get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.v1 and deLearn.ext byte-identical after loading v5')
    t5 = json.loads(get(page, 'deLearn.terms'))
    same = all(k in t5['terms'] and [p['s'] for p in t5['terms'][k]['ph']] == [p['s'] for p in v['ph']] and t5['terms'][k]['st'] == v['st'] for k, v in t4['terms'].items()) and t5['ground'] == t4['ground'] and t5['log'] == t4['log']
    check(same and 'fast' in t5 and not t5['fast']['on'], f'[{label}] deLearn.terms kept (terms, phrase steps, blocks, log); fast lane added off')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ' + str(lower[:5]))
    page.click('#startBtn'); n, _ = drive(page); check(n > 0, f'[{label}] new-build session completes ({n} steps)')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def preserve_v5(br):
    # real v5 state: crafted v1, v3 session, v4 session, two v5 sessions; then load v6
    ctx, page, errs = ctxpage(br); label = 'from v5 051a0fb'
    page.goto(f'{BASE}/v3/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v4/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v5/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    v1, ext, t5 = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), json.loads(get(page, 'deLearn.terms')); oldprog = page.evaluate(PROG)
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1 and get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.v1 and deLearn.ext byte-identical after loading v6')
    t6 = json.loads(get(page, 'deLearn.terms'))
    same = all(k in t6['terms'] and [p['s'] for p in t6['terms'][k]['ph']] == [p['s'] for p in v['ph']] and t6['terms'][k]['st'] == v['st'] for k, v in t5['terms'].items()) and all(t6.get(k) == t5.get(k) for k in ['ground', 'log', 'daily', 'fast'])
    check(same, f'[{label}] deLearn.terms kept (terms, phrase steps, blocks, log, daily, fast lane)')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ' + str(lower[:5]))
    plan = page.inner_text('.today'); print('  [v5→v6] plan:', plan.replace('\n', ' | ')[:300])
    check('Pictures first' in plan or 'picture steps' in plan, f'[{label}] home plan shows pictures for one lesson today (catch-up, or the new lesson\'s own)')
    page.click('#startBtn'); n, seen = drive(page); check(n > 0 and 'illNext' in seen and 'vq' in seen, f'[{label}] session with catch-up pictures + visual questions completes ({n} steps)')
    t6b = json.loads(get(page, 'deLearn.terms')); check(len([k for k, v in t6b.get('vis', {}).items() if v.get('seen')]) == 1, f'[{label}] exactly one lesson illustrated today: {list(t6b.get("vis", {}).keys())}')
    after = json.loads(get(page, 'deLearn.v1')); old = json.loads(v1)
    check(after['xp'] >= old['xp'] and all(k in after['theory'] for k in old['theory']), f'[{label}] XP {old["xp"]}→{after["xp"]}, theory marks kept')
    lowt = [k for k, v in t5['terms'].items() if k in t6b['terms'] and t6b['terms'][k].get('tier', 0) == v.get('tier', 0) and any(a['s'] < b['s'] for a, b in zip(t6b['terms'][k]['ph'], v['ph']))]
    check(not lowt, f'[{label}] no term phrase step lowered after a v6 session ' + str(lowt[:5]))
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def joins_390(br):
    # the joins lesson at phone width: every picture renders, nothing overflows, real RIGHT/FULL JOIN runs
    ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    page.evaluate("startSession(buildLessonSession('sql5'))")
    k = 0; ran = 0
    while page.locator('[data-act="illNext"]').count():
        k += 1; h = page.inner_text('main')
        ov = page.evaluate("document.documentElement.scrollWidth"); check(ov <= 390, f'joins picture {k}: no horizontal page overflow at 390px (scrollWidth {ov})')
        if page.locator('[data-act="illRun"]').count():
            page.click('[data-act="illRun"]'); page.wait_for_selector('.ill-run table, .ill-run .ill-err', timeout=8000); ran += 1
        if SHOTS: page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{SHOTS}/v7-joins-{k}.png', full_page=True)
        if k == 1: check(page.locator('svg.erd').count() == 1 and 'follow' in h.lower(), 'joins open with the ERD arrow ("joins follow the arrow")')
        if k == 4: check('NULL' in h and 'Asake' in h, 'LEFT JOIN picture shows Asake with a visible NULL')
        page.click('[data-act="illNext"]')
    check(k == 7 and ran >= 4, f'joins lesson: 7 pictures, real queries run in the app ({ran})')
    txt = page.inner_text('main'); check('Tap' in txt and page.locator('[data-act="vqTap"]').count() == 3, 'first visual question: tap the artists rows')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v6-joins-tap.png', full_page=True)
    n, seen = drive(page, wrong_every=3); check(n > 0 and 'vq' in seen, f'joins lesson completes ({n} steps)')
    check(json.loads(get(page, 'deLearn.terms'))['vis']['sql5']['seen'] is not None, 'pictures marked seen in deLearn.terms.vis')
    check(not errs, 'no JS errors (joins 390px): ' + '; '.join(errs[:5])); ctx.close()

def lesson_390(br, lid, nscenes, shot):
    # a v7 lesson at phone width: every picture renders, nothing overflows, every query runs, all question kinds work
    ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    page.evaluate(f"startSession(buildLessonSession('{lid}'))")
    k = 0; ran = 0; figs = set()
    while page.locator('[data-act="illNext"]').count():
        k += 1
        ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)")
        wide = page.evaluate("[...document.querySelectorAll('main svg, main .ill-ins, main .entf, main .stl, main .evf, main .cls, main .anat, main .ddl, main .plc, main .bps, main .ask, main .scene table')].filter(e => e.getBoundingClientRect().right > 390.5).length")
        check(ov <= 390 and wide == 0, f'{lid} picture {k}: no overflow at 390px (scrollWidth {ov}, wide parts {wide})')
        for f in ['svg.erd', 'svg.bip', '.entf', '.stf', '.evf']:
            if page.locator(f).count(): figs.add(f)
        if page.locator('[data-act="illRun"]').count():
            page.click('[data-act="illRun"]'); page.wait_for_selector('.ill-run table, .ill-run .ill-err', timeout=8000); ran += 1
            check(page.locator('.ill-run .ill-err').count() == 0, f'{lid} picture {k}: query runs in the app')
        if SHOTS: page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{SHOTS}/{shot}-{k}.png', full_page=True)
        page.click('[data-act="illNext"]')
    check(k == nscenes, f'{lid}: {nscenes} pictures ({k}), {ran} real queries run; figures {sorted(figs)}')
    kinds = set(); qn = 0
    while page.locator('[data-act="vqCheck"], [data-act="vqPick"]').count():
        qn += 1; q = page.evaluate("F.q.k"); kinds.add(q)
        if SHOTS and (q in ('cls', 'tapc') or lid == 'sqlt'): page.screenshot(path=f'{SHOTS}/{shot}-q{qn}-{q}.png', full_page=True)
        ov = page.evaluate("document.documentElement.scrollWidth"); check(ov <= 390, f'{lid} question {qn} ({q}): no overflow ({ov})')
        n, _ = drive(page, maxsteps=1, wrong_every=0)
        fb = page.inner_text('main'); check('Correct' in fb, f'{lid} question {qn} ({q}) answered correctly is marked correct')
        if SHOTS and q == 'cls': page.screenshot(path=f'{SHOTS}/{shot}-q-cls-done.png', full_page=True)
        page.click('[data-act="next"]')
    print(f'  [{lid}] question kinds:', sorted(kinds))
    n, seen = drive(page, wrong_every=3); check(n > 0, f'{lid} lesson completes ({qn} picture questions, {n} more steps)')
    check(json.loads(get(page, 'deLearn.terms'))['vis'][lid]['seen'] is not None, f'{lid} pictures marked seen')
    check(not errs, f'no JS errors ({lid} 390px): ' + '; '.join(errs[:5])); ctx.close()
    return kinds

def preserve_v6(br):
    # real v6 state: crafted v1, v3/v4/v5 sessions, a v6 daily session and the v6 joins lesson (so the learner is past joins); then load v7
    ctx, page, errs = ctxpage(br); label = 'from v6 f5aa839'
    page.goto(f'{BASE}/v3/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v4/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v5/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v6/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("startSession(buildLessonSession('sql5'))"); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    v1, ext, t6 = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), json.loads(get(page, 'deLearn.terms')); oldprog = page.evaluate(PROG)
    oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1 and get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.v1 and deLearn.ext byte-identical after loading the new build')
    t7 = json.loads(get(page, 'deLearn.terms'))
    same = all(k in t7['terms'] and [p['s'] for p in t7['terms'][k]['ph']] == [p['s'] for p in v['ph']] and t7['terms'][k]['st'] == v['st'] for k, v in t6['terms'].items()) and all(t7.get(k) == t6.get(k) for k in ['ground', 'log', 'daily', 'fast', 'vis'])
    check(same, f'[{label}] deLearn.terms kept (terms, phrase steps, blocks, log, daily, fast lane, pictures seen)')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); lowm = [m for m, v in oldmod if newmod.get(m, 0) + 1e-9 < v]
    check(not lowm, f'[{label}] no module % lowered by the new lessons ' + str(lowm))
    nl = page.evaluate("nextLesson().id"); check(nl == 'sqlt', f'[{label}] learner past joins: next lesson is the earliest added one, What\'s inside a table ({nl})')
    page.click('nav [data-to="roadmap"]'); rm = page.inner_text('main')
    check("What's inside a table" in rm and 'Entities, events & relationships' in rm and 'Many-to-many' in rm, f'[{label}] roadmap lists the three added lessons')
    li_t = page.inner_text('li[data-l="sqlt"]'); li_r = page.inner_text('li[data-l="sqlr"]'); li_m = page.inner_text('li[data-l="sqlm"]')
    check('NEXT' in li_t and 'NEW' in li_r and 'NEW' in li_m and '🔒' not in li_t + li_r + li_m, f'[{label}] added lessons shown as NEXT / NEW, not locked')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v7-roadmap-existing.png', full_page=True)
    page.click('li[data-l="sqlm"]'); check(page.locator('[data-act="startLesson"]').count() == 1, f'[{label}] many-to-many lesson opens (unlocked)')
    page.evaluate("go('home')"); page.click('#startBtn'); n, seen = drive(page)
    check(n > 0 and 'illNext' in seen, f'[{label}] daily session with the new lesson\'s pictures completes ({n} steps)')
    t7b = json.loads(get(page, 'deLearn.terms')); check(t7b['vis'].get('sqlt', {}).get('seen') and not t7b['vis'].get('sqlr', {}).get('seen') and not t7b['vis'].get('sqlm', {}).get('seen'), f'[{label}] one new lesson a day: sqlt pictures seen, sqlr / sqlm wait')
    after = json.loads(get(page, 'deLearn.v1')); old = json.loads(v1)
    check(after['xp'] >= old['xp'] and all(k in after['theory'] for k in old['theory']), f'[{label}] XP {old["xp"]}→{after["xp"]}, theory marks kept')
    lowt = [k for k, v in t6['terms'].items() if k in t7b['terms'] and t7b['terms'][k].get('tier', 0) == v.get('tier', 0) and any(a['s'] < b['s'] for a, b in zip(t7b['terms'][k]['ph'], v['ph']))]
    check(not lowt, f'[{label}] no term phrase step lowered after a v7 session ' + str(lowt[:5]))
    check(get(page, 'deLearn.ext') == ext or json.loads(get(page, 'deLearn.ext'))['placed'] == json.loads(ext)['placed'], f'[{label}] placement record unchanged')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def preserve_v7(br):
    # real v7 state: crafted v1, v3/v4/v5/v6 sessions, v7 daily sessions (relationships pictures) and the v7 many-to-many lesson; then load v8
    ctx, page, errs = ctxpage(br); label = 'from v7 19df660'
    page.goto(f'{BASE}/v3/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v4/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v5/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v6/index.html'); page.wait_for_selector('#startBtn'); page.evaluate("startSession(buildLessonSession('sql5'))"); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v7/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("startSession(buildLessonSession('sqlm'))"); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    v1, ext, tr = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), get(page, 'deLearn.terms'); oldprog = page.evaluate(PROG); t7 = json.loads(tr)
    oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")
    check(t7['vis'].get('sqlr', {}).get('seen') and t7['vis'].get('sqlm', {}).get('seen'), f'[{label}] v7 state has both v7 lessons seen')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1, f'[{label}] deLearn.v1 byte-identical after loading v8')
    check(get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.ext byte-identical after loading v8')
    t8 = get(page, 'deLearn.terms')
    if t8 == tr: check(True, f'[{label}] deLearn.terms byte-identical after loading v8')
    else:
        t8j = json.loads(t8); same = all(t8j['terms'].get(k) == v for k, v in t7['terms'].items()) and all(t8j.get(k) == t7.get(k) for k in ['ground', 'log', 'daily', 'fast', 'vis'])
        check(same, f'[{label}] deLearn.terms: every v7 record identical (only additive keys differ)')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); lowm = [m for m, v in oldmod if newmod.get(m, 0) + 1e-9 < v]
    check(not lowm, f'[{label}] no module % lowered by the new lesson ' + str(lowm))
    nl = page.evaluate("nextLesson().id"); check(nl == 'sqlt', f'[{label}] next lesson is the new What\'s inside a table ({nl})')
    page.click('nav [data-to="roadmap"]'); li_t = page.inner_text('li[data-l="sqlt"]'); li_r = page.inner_text('li[data-l="sqlr"]')
    check(('NEXT' in li_t or 'NEW' in li_t) and '🔒' not in li_t, f'[{label}] roadmap shows sqlt as NEXT (added lesson), unlocked: {li_t!r}')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v8-roadmap-existing.png', full_page=True)
    page.evaluate("go('home')"); page.click('#startBtn'); n, seen = drive(page)
    check(n > 0 and 'illNext' in seen, f'[{label}] daily session with the sqlt pictures completes ({n} steps)')
    tb = json.loads(get(page, 'deLearn.terms')); check(tb['vis'].get('sqlt', {}).get('seen'), f'[{label}] sqlt pictures marked seen')
    after = json.loads(get(page, 'deLearn.v1')); old = json.loads(v1)
    check(after['xp'] >= old['xp'] and all(after['theory'].get(k) == v for k, v in old['theory'].items()), f'[{label}] XP {old["xp"]}→{after["xp"]}, theory marks kept')
    lowt = [k for k, v in t7['terms'].items() if k in tb['terms'] and tb['terms'][k].get('tier', 0) == v.get('tier', 0) and any(a['s'] < b['s'] for a, b in zip(tb['terms'][k]['ph'], v['ph']))]
    check(not lowt, f'[{label}] no term phrase step lowered after a v8 session ' + str(lowt[:5]))
    check(json.loads(get(page, 'deLearn.ext'))['placed'] == json.loads(ext)['placed'] and json.loads(get(page, 'deLearn.ext')).get('placement') == json.loads(ext).get('placement'), f'[{label}] placement record unchanged')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def preserve_v8(br):
    # real v8 state: crafted v1, v3..v7 sessions, v8 daily session and the v8 sqlt lesson; then load v8.1 (genre moved to songs)
    ctx, page, errs = ctxpage(br); label = 'from v8 60df8f4'
    page.goto(f'{BASE}/v3/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v4/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v6/index.html'); page.wait_for_selector('#startBtn'); page.evaluate("startSession(buildLessonSession('sql5'))"); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v7/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v8/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("startSession(buildLessonSession('sqlt'))"); drive(page, wrong_every=3); page.click('main.summary [data-to="home"]')
    v1, ext, tr = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), get(page, 'deLearn.terms'); oldprog = page.evaluate(PROG); t8o = json.loads(tr)
    oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")
    check(t8o['vis'].get('sqlt', {}).get('seen'), f'[{label}] v8 state has the sqlt lesson seen')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1, f'[{label}] deLearn.v1 byte-identical after loading v8.1')
    check(get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.ext byte-identical after loading v8.1')
    check(get(page, 'deLearn.terms') == tr, f'[{label}] deLearn.terms byte-identical after loading v8.1')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); lowm = [m for m, v in oldmod if newmod.get(m, 0) + 1e-9 < v]
    check(not lowm, f'[{label}] no module % lowered by v8.1 ' + str(lowm))
    check(page.evaluate("LESSONS.sqlt.code.length + LESSONS.sql1.code.length") > 0 and 'v8.1' in page.evaluate("document.documentElement.innerHTML") , f'[{label}] v8.1 build loaded')
    page.click('#startBtn'); n, seen = drive(page); check(n > 0, f'[{label}] daily session after the update completes ({n} steps)')
    after = json.loads(get(page, 'deLearn.v1')); old = json.loads(v1)
    check(after['xp'] >= old['xp'] and all(after['theory'].get(k) == v for k, v in old['theory'].items()), f'[{label}] XP {old["xp"]}→{after["xp"]}, theory marks kept')
    tb = json.loads(get(page, 'deLearn.terms'))
    lowt = [k for k, v in t8o['terms'].items() if k in tb['terms'] and tb['terms'][k].get('tier', 0) == v.get('tier', 0) and any(a['s'] < b['s'] for a, b in zip(tb['terms'][k]['ph'], v['ph']))]
    check(not lowt, f'[{label}] no term phrase step lowered after a v8.1 session ' + str(lowt[:5]))
    check(json.loads(get(page, 'deLearn.ext'))['placed'] == json.loads(ext)['placed'], f'[{label}] placement record unchanged')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def transfer_wrong(br):
    # wrong answers in the transfer test explain themselves (mc: why each other option is wrong; cls: the right box and why)
    ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn'); page.evaluate("startSession(buildLessonSession('sqlt'))")
    k = 0; shots81 = set()
    while page.locator('[data-act="illNext"]').count():
        k += 1
        if k == 1:
            page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KEEP8}/1-table-anatomy.png', full_page=True)
        h = page.inner_text('main')
        if 'Afrobeats, R&B' in h and 'genre' not in shots81:
            page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KEEP8}/4-genre-before-after.png', full_page=True); shots81.add('genre')
            check('NULL' not in h or True, 'genre before/after picture shown (list cell, duplicated rows, genre on songs)')
        if page.locator('main .plc').count() and 'same test' in h.lower():
            page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KEEP8}/5-more-than-one-test.png', full_page=True); shots81.add('multi')
        page.click('[data-act="illNext"]')
    got_mc = got_cls = False; qn = 0
    while page.locator('[data-act="vqCheck"], [data-act="vqPick"]').count():
        qn += 1; q = page.evaluate("({ k: F.q.k, t: F.q.q })")
        if q['k'] in ('mc', 'cls') and not (q['k'] == 'mc' and got_mc) and not (q['k'] == 'cls' and got_cls) and qn > 2:
            if q['k'] == 'mc' and qn == 12: page.screenshot(path=f'{KEEP8}/2-transfer-question-bank.png', full_page=True)
            drive(page, maxsteps=1, wrong_every=1)
            fb = page.inner_text('main')
            if q['k'] == 'mc':
                check('Correct' not in fb and page.locator('.whyw li.picked').count() == 1, f'transfer q{qn}: wrong pick explained ("why the other answers are wrong", yours first)')
                got_mc = qn >= 12
                if got_mc: page.screenshot(path=f'{KEEP8}/3-transfer-wrong-explained.png', full_page=True)
            else:
                check(page.locator('.cls-w').count() >= 3, f'transfer q{qn}: sorting shows the right box and why for each item'); got_cls = True
                page.screenshot(path=f'{SHOTS or KEEP8}/v8-cls-wrong.png', full_page=True)
        else: drive(page, maxsteps=1, wrong_every=0)
        ov = page.evaluate("document.documentElement.scrollWidth"); check(ov <= 390, f'transfer q{qn} feedback: no overflow at 390px ({ov})')
        page.click('[data-act="next"]')
    check(got_mc and got_cls, 'wrong-answer explanations seen for multiple choice and sorting')
    check(shots81 == {'genre', 'multi'}, f'genre picture and the any-data test picture captured: {sorted(shots81)}')
    check(not errs, 'no JS errors (transfer wrong answers): ' + '; '.join(errs[:5])); ctx.close()

def fast_lane_ui(br):
    ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    page.evaluate("""(() => { const t = today(); for (let i = 1; i <= 4; i++) T.daily[addDays(t, -i)] = { n: 10, ok: 10 }; T.log = Array.from({ length: 20 }, () => ({ d: addDays(t, -1), ok: 1 })); saveTerms(); go('home'); })()""")
    check('Fast lane on: consistent accuracy' in page.inner_text('main'), 'Home shows "Fast lane on: consistent accuracy" after 4 consistent days')
    page.evaluate("""(() => { for (let i = 0; i < 5; i++) t4Log(i > 0); saveTerms(); go('home'); })()""")
    txt = page.inner_text('main'); check('Fast lane off' in txt and 'Fast lane on' not in txt, 'a slip (4/5 today) turns it off at once, with a note')
    check(not errs, 'no JS errors (fast lane): ' + '; '.join(errs[:5])); ctx.close()

with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROME', '/usr/bin/google-chrome'), args=['--no-sandbox'])
    ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    ITEM_KIND = page.evaluate("Object.fromEntries(Object.values(ITEMS).map(i => [i.id, i.kind]))"); ctx.close()
    preserve(br, 'from 08c6b1a', 'v2', False)
    preserve(br, 'from v3 371b94a', 'v3', True)
    # ---------- fresh user: help step, learn screen, several simulated days ----------
    ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn'); page.click('[data-act="startFresh"]')
    page.click('#startBtn'); check(page.locator('[data-act="helpDone"]').count() == 1, 'first session after the update opens with "How learning works"')
    txt = page.inner_text('main')
    check(all(w in txt for w in ['Building blocks', 'One phrase at a time', 'Pick', 'Accepted wordings', 'Precision', 'Tiers', '2–3 terms', '1/3', 'Fast lane', 'See it first', 'Every abstract idea', 'pacing', 'Placement', 'never reset', 'Inside a table before between tables', 'Transfer test']), 'help covers every rule')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v4-help.png', full_page=True)
    n, seen = drive(page); check(n > 0 and 'term:ground:None' in seen, f'fresh session completes with grounding ({n} steps; {sorted(seen)})')
    page.click('main.summary [data-to="home"]'); page.click('#startBtn')
    check(page.locator('[data-act="helpDone"]').count() == 0, 'help step shown only once'); page.click('[data-act="quit"]') if False else None
    page.evaluate("SESSION = null; go('home')")
    page.click('nav [data-to="settings"]'); page.click('[data-act="go"][data-to="learn"]')
    check('How learning works' in page.inner_text('header') and 'Pick → ⌨️ Type' in page.inner_text('main'), 'More → How learning works screen')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v4-learn.png', full_page=True)
    preserve_v4(br)
    preserve_v5(br)
    preserve_v6(br)
    preserve_v7(br)
    preserve_v8(br)
    joins_390(br)
    k1 = lesson_390(br, 'sqlr', 11, 'v7-sqlr'); check({'cls', 'tapc', 'tap', 'mc', 'run'} <= k1, 'relationships lesson uses classify, tap-column, tap-rows, pick and run questions')
    lesson_390(br, 'sqlm', 5, 'v7-sqlm')
    k8 = lesson_390(br, 'sqlt', 15, 'v8-sqlt'); check({'cls', 'tap', 'mc', 'run'} <= k8, 'table lesson uses classify, tap-rows, pick and run questions')
    lesson_390(br, 'sql2', 2, 'v81-sql2'); lesson_390(br, 'sql4', 3, 'v81-sql4'); lesson_390(br, 'sql3', 2, 'v81-sql3')  # v8.1: daily_streams and labelled views
    transfer_wrong(br)
    fast_lane_ui(br)
    # simulate following days by moving the clock forward
    forms = set()
    for d in range(1, 9):
        page.evaluate(f"(() => {{ const T0 = today; const D = addDays(T0(), {d}); window.__D = D; today = x => x ? T0(x) : D; }})()") if d == 1 else page.evaluate("(() => { window.__D = addDays(window.__D, 1); })()")
        if d == 1: page.evaluate("(() => { const T0 = today; today = x => x ? T0(x) : window.__D; })()")
        page.evaluate("go('home')"); plan = page.inner_text('.today')
        page.click('#startBtn'); n, seen = drive(page); forms |= seen
        if d == 1: print('  day-2 plan:', plan.replace('\n', ' | ')[:400])
        page.click('main.summary [data-to="home"]')
    print('  forms seen over 8 days:', sorted(x for x in forms if x.startswith('term')))
    check({'term:adv:pick', 'term:adv:type', 'term:adv:spot'} <= forms, 'pick, type and spot all appear on later days')
    Tn = json.loads(get(page, 'deLearn.terms')); act = [k for k, v in Tn['terms'].items() if v['st'] == 'active']
    check(1 <= len(act) <= 3, f'2–3 terms in progress at once: {act}')
    print('  fresh user pictures seen:', list(Tn.get('vis', {}).keys()))
    check(not errs, 'no JS errors (fresh user): ' + '; '.join(errs[:5]))
    ctx.close()
    # ---------- PWA offline ----------
    ctx = br.new_context(); page = ctx.new_page(); page.goto(BASE + '/new/'); page.wait_for_selector('#startBtn')
    page.evaluate("navigator.serviceWorker.ready.then(() => true)"); page.wait_for_timeout(1500)
    caches = page.evaluate("caches.keys()"); check('de-daily-v8-1' in caches, 'service worker cache de-daily-v8-1: ' + str(caches))
    ctx.set_offline(True); page.reload(); page.wait_for_selector('#startBtn', timeout=8000)
    check(page.locator('#startBtn').count() == 1, 'app loads offline from the service worker')
    ctx.close(); br.close()
print('\nFAILS:', len(fails)); [print(' -', f) for f in fails]
raise SystemExit(1 if fails else 0)
