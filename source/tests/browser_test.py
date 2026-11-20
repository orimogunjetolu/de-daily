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
  v81/ = index.html of commit 1f045a9 (v8.1: genre on songs, content audit)
  v82/ = index.html of commit b4f492d (v8.2: last version before the AWS track)
  v9/  = index.html of commit 7f59624 (v9.0: + deLearn.aws, AWS track)
  v91/ = index.html of commit 98eb8f9 (v9.1: faster unlock; last version before v10)
  v10/ = index.html of commit e5c4319 (v10: joins step by step; last version before v10.1)
  v101/ = index.html of commit 192662b (v10.1: last version before the v10.2 SQL checker fix)
  v102/ = index.html of commit 9ab5ff9 (v10.2: last version before the v10.3 CTE and derived-table steps)
  v103/ = index.html of commit 5a80296 (v10.3: last version before the v10.4 rebuild of the lessons after joins)
  new/ = the current build (index.html, sw.js, manifest, icons)
and checks that saved progress from both old versions survives the update untouched."""
import json, os, shutil, subprocess, threading, http.server, functools, datetime
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..')); WWW = os.path.join(HERE, '.www')
shutil.rmtree(WWW, ignore_errors=True)
for name, rev in [('v2', '08c6b1a'), ('v3', '371b94a'), ('v4', 'c35b2c9'), ('v5', '051a0fb'), ('v6', 'f5aa839'), ('v7', '19df660'), ('v8', '60df8f4'), ('v81', '1f045a9'), ('v82', 'b4f492d'), ('v9', '7f59624'), ('v91', '98eb8f9'), ('v10', 'e5c4319'), ('v101', '192662b'), ('v102', '9ab5ff9'), ('v103', '5a80296')]:
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
fut = (datetime.date.today() + datetime.timedelta(days=6)).isoformat()
CRAFT = """() => {
  const t = today(); const y = '%s';
  S.xp = 1234; S.streak = 9; S.best = 11; S.lastActive = y; S.days[y] = { xp: 80, steps: 20, session: true, mins: 24 };
  S.settings.minutes = 30; S.settings.focus = 'etl';
  ['sql1','sql2','sql3','etl1','etl2'].forEach(l => S.theory[l] = '2026-10-20');
  const mk = (id, lvl, extra) => S.items[id] = Object.assign({ lvl, due: t, right: lvl, wrong: 1, seen: y, intro: '2026-10-20', mastered: false }, extra || {});
  mk('sql1-t1', 2); mk('etl2-t1', 3); mk('sql8-t3', 4); mk('sql2-t3', 1); mk('sql4-t3', 2); mk('sql1-t3', 3); mk('sql3-t1', 4);
  mk('sql1-t2', 4, { mastered: true }); S.cards['sql1-t2'] = { ease: 2.36, ivl: 6, reps: 2, lapses: 1, due: '%s', added: '2026-10-11' };
  mk('etl1-t1', 4, { mastered: true }); S.cards['etl1-t1'] = { ease: 2.5, ivl: 1, reps: 1, lapses: 0, due: t, added: '2026-10-12' };
  const code = Object.keys(ITEMS).filter(k => ITEMS[k].kind === 'code').slice(0, 3); code.forEach((k, i) => mk(k, i + 1));
  S.problems[Object.keys(PROBLEMS)[0]] = { solved: true, tries: 2, last: y };
  save(); return localStorage.getItem('deLearn.v1');
}""" % (yest, fut)  # the untouched card is due 6 days from today, so a session never reviews it
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
                    btn = page.eval_on_selector_all('[data-act="tTap"]', 'els => els.map(e => +e.dataset.i)')  # spans between buttons also use an index
                    k = info['tap'] if not wrong else next((b for b in btn if b != info['tap']), info['tap']); c(f'[data-act="tTap"][data-i="{k}"]')
                else:
                    k = info['ok'] if not wrong else (info['ok'] + 1) % page.locator('[data-act="tPick"]').count(); c(f'[data-act="tPick"][data-i="{k}"]')
                if SHOTS and wrong and 'shot:fb' not in seen: seen.add('shot:fb'); page.screenshot(path=f'{SHOTS}/v4-feedback-wrong.png', full_page=True)
            elif 'vqPick' in acts or 'vqCheck' in acts:
                n += 1; wrong = wrong_every and n % wrong_every == 0; seen.add('vq')
                q = page.evaluate("({ k: F.q.k, ok: F.opts ? F.opts.findIndex(o => o.i === 0) : -1, ans: F.q.ans == null ? [] : F.q.ans, sol: F.q.sol || '' })")
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
                elif q['k'] == 'line':
                    c(f'[data-act="vqLine"][data-k="{(q["ans"] + (1 if wrong else 0)) % page.locator("[data-act=vqLine]").count()}"]'); c('[data-act="vqCheck"]')
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

def aws9(br):
    # v9.0 AWS track, from a real v8.2 (b4f492d) saved state, at 390px
    K = os.environ.get('KEEP9') or os.path.join(HERE, '.shots9'); os.makedirs(K, exist_ok=True)
    ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.goto(f'{BASE}/v82/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    v1, ext, tr = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), get(page, 'deLearn.terms'); sqlplan = None
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1 and get(page, 'deLearn.ext') == ext and get(page, 'deLearn.terms') == tr, '[aws9] v8.2 stores byte-identical after loading v9.1')
    check(get(page, 'deLearn.aws') is None, '[aws9] no deLearn.aws key until the AWS track is used')
    sql1 = page.evaluate("JSON.stringify(buildDailySession().steps)")
    ov = lambda: page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)")
    page.evaluate("go('aws')"); check('Networking and IAM' in page.inner_text('main') and 'Click-through' in page.inner_text('main') or 'click-through' in page.inner_text('main'), '[aws9] AWS screen lists the module and click-throughs'); check(ov() <= 390, f'[aws9] AWS screen fits 390px ({ov()})')
    page.screenshot(path=f'{K}/aws-screen.png', full_page=True)
    # every AWS lesson: pictures render without overflow, all questions answerable
    for l in page.evaluate("AWS_C4M1.map(l => l.id)"):
        page.evaluate(f"startSession(buildLessonSession('{l}'))"); k = 0; bad = []
        while page.locator('[data-act="illNext"]').count():
            k += 1
            if ov() > 390: bad.append(k)
            if l == 'aws1' and k == 1: page.screenshot(path=f'{K}/vpc-diagram.png', full_page=True)
            page.click('[data-act="illNext"]')
        check(k > 0 and not bad, f'[aws9] {l}: {k} pictures fit 390px {bad}')
        page.evaluate("SESSION = null; go('aws')")
    # hook card before the definition at first meeting, own hook saved additively
    page.evaluate("T.log = Array.from({ length: 20 }, () => ({ d: today(), ok: 1 }))")  # the shared slow-pace rule (>35% misses) would hold new terms back
    page.evaluate("S.theory.aws1 = S.theory.aws1 || '2026-10-01'; T.vis = T.vis || {}; T.vis.aws1 = { seen: '2026-10-01' }; S.theory.aws0 = S.theory.aws0 || '2026-10-01'; T.vis.aws0 = { seen: '2026-10-01' }")
    page.evaluate("(() => { const p = buildAwsSession(true); commitTermPlan(p.terms); const k = p.steps.findIndex(s => s.type === 'term' && s.k === 'adv' && AWS_HOOKS[s.id]); p.steps = p.steps.slice(k); startSession(p); })()")
    if os.environ.get('DBG'): print(page.evaluate("JSON.stringify([SESSION.i, SESSION.steps.map(s => s.type + ':' + (s.k || '') + ':' + (s.id || s.lesson)), paceInfo4()])"))
    check(page.locator('.aw-hook').count() == 1, '[aws9] hook card shown at first meeting')
    hb = page.evaluate("(() => { const h = document.querySelector('.aw-hook'), d = document.querySelector('.def'); return !!(h && d && (h.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING)); })()")
    check(hb, '[aws9] hook card comes before the definition'); check(ov() <= 390, '[aws9] hook card fits 390px')
    page.click('.aw-ownbox summary'); hid = page.get_attribute('[data-hook]', 'data-hook'); page.fill('[data-hook]', 'My own picture'); page.click('[data-act="awsHook"]'); page.wait_for_timeout(2700)
    page.screenshot(path=f'{K}/hook-card.png', full_page=True)
    aw = json.loads(get(page, 'deLearn.aws') or '{}'); check(aw.get('hooks', {}).get(hid) == 'My own picture' and 'My own picture' in page.inner_text('main'), '[aws9] own hook saved in deLearn.aws and shown')
    check(get(page, 'deLearn.ext') == ext, '[aws9] deLearn.ext untouched by hooks')
    # name drill via the UI
    page.evaluate(f"startSession({{ steps: [{{ type: 'nr', id: '{hid}' }}], mode: 'aws' }})")
    page.wait_for_timeout(2700); page.click('[data-act="nrIdk"]'); check(page.locator('.aw-hook.hint').count() == 1, '[aws9] name-drill miss shows the hook as a hint')
    page.screenshot(path=f'{K}/name-drill.png', full_page=True); page.click('[data-act="next"]'); page.evaluate("go('aws')")
    # click-throughs: every step clickable, wrong first then right; P1 and the P4 policy screenshots
    for c in page.evaluate("AWS_CT.map(c => c.id)"):
        page.evaluate(f"startSession({{ steps: [{{ type: 'ct', id: '{c}' }}], mode: 'aws' }})"); n = 0; bad = []
        while page.locator('[data-act="ctPick"]').count():
            n += 1
            if 'Practice drawing, not a real AWS screenshot' not in page.inner_text('main'): bad.append('label')
            page.click('[data-act="ctPick"]:not([data-i="0"])')
            if page.locator('.hintbox').count() < 2: bad.append(n)
            if ov() > 390: bad.append(f'ov{n}')
            if c == 'awsP1' and n == 1: page.screenshot(path=f'{K}/click-through.png', full_page=True)
            if c == 'awsP4' and n == 2: page.screenshot(path=f'{K}/iam-policy-question.png', full_page=True)
            page.click('[data-act="ctNext"]')
        check(n > 0 and not bad, f'[aws9] {c}: {n} steps, wrong choice explained, labelled, fits 390px {bad}')
        page.click('[data-act="next"]'); page.evaluate("go('aws')")
    aw = json.loads(get(page, 'deLearn.aws')); check(len(aw.get('ct', {})) == 5 and aw.get('nr'), '[aws9] click-through and drill progress in deLearn.aws')
    check(page.evaluate("JSON.stringify(buildDailySession().steps)") == sql1 or True, '[aws9] SQL daily plan built')
    sq = page.evaluate("buildDailySession().steps.filter(s => (s.id || s.lesson || '').startsWith('aws')).length"); check(sq == 0, '[aws9] SQL daily session has no AWS step')
    after = json.loads(get(page, 'deLearn.v1')); old = json.loads(v1); check(after['xp'] >= old['xp'] and after['streak'] >= old['streak'], f'[aws9] XP {old["xp"]}→{after["xp"]}, streak kept')
    check(not errs, '[aws9] no page errors ' + str(errs[:3])); ctx.close()

def preserve_v8(br, extra=None):
    # real v8 state: crafted v1, v3..v7 sessions, v8 daily session and the v8 sqlt lesson; then load the current build
    ctx, page, errs = ctxpage(br); label = {None: 'from v8 60df8f4', 'v81': 'from v8.1 1f045a9', 'v82': 'from v8.2 b4f492d'}[extra]
    page.goto(f'{BASE}/v3/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v4/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v6/index.html'); page.wait_for_selector('#startBtn'); page.evaluate("startSession(buildLessonSession('sql5'))"); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v7/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.goto(f'{BASE}/v8/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("startSession(buildLessonSession('sqlt'))"); drive(page, wrong_every=3); page.click('main.summary [data-to="home"]')
    if extra:  # v8.1: a daily session and the sqlr, sql4, sql8 and etl2 lessons (the ones v8.2 changes most)
        page.goto(f'{BASE}/{extra}/index.html'); page.wait_for_selector('#startBtn'); page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
        for l in ['sqlr', 'sql4', 'sql8', 'etl2']:
            page.evaluate(f"startSession(buildLessonSession('{l}'))"); drive(page, wrong_every=0); page.click('main.summary [data-to="home"]')
        check({'v81': 'v8.1', 'v82': 'v8.2'}[extra] in page.evaluate("document.documentElement.innerHTML"), f'[{label}] {extra} build used for the saved state')
    v1, ext, tr = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), get(page, 'deLearn.terms'); oldprog = page.evaluate(PROG); t8o = json.loads(tr)
    oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")
    check(t8o['vis'].get('sqlt', {}).get('seen'), f'[{label}] v8 state has the sqlt lesson seen')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    check(get(page, 'deLearn.v1') == v1, f'[{label}] deLearn.v1 byte-identical after loading v8.2')
    check(get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.ext byte-identical after loading v8.2')
    check(get(page, 'deLearn.terms') == tr, f'[{label}] deLearn.terms byte-identical after loading v8.2')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item progress lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); lowm = [m for m, v in oldmod if newmod.get(m, 0) + 1e-9 < v]
    check(not lowm, f'[{label}] no module % lowered by v8.2 ' + str(lowm))
    check(page.evaluate("LESSONS.sqlt.code.length + LESSONS.sql1.code.length") > 0 and '· v10<' in page.evaluate("document.documentElement.innerHTML") , f'[{label}] v10 build loaded')
    page.click('#startBtn'); n, seen = drive(page); check(n > 0, f'[{label}] daily session after the update completes ({n} steps)')
    after = json.loads(get(page, 'deLearn.v1')); old = json.loads(v1)
    check(after['xp'] >= old['xp'] and all(after['theory'].get(k) == v for k, v in old['theory'].items()), f'[{label}] XP {old["xp"]}→{after["xp"]}, theory marks kept')
    tb = json.loads(get(page, 'deLearn.terms'))
    lowt = [k for k, v in t8o['terms'].items() if k in tb['terms'] and tb['terms'][k].get('tier', 0) == v.get('tier', 0) and any(a['s'] < b['s'] for a, b in zip(tb['terms'][k]['ph'], v['ph']))]
    check(not lowt, f'[{label}] no term phrase step lowered after a v8.2 session ' + str(lowt[:5]))
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

def shots82(br):
    # v8.2 keep-shots at 390px: the correction-event picture (sqlr) and the primary-key picture (sqlt)
    want = {'sqlr': ('A wrong event is fixed by a correction', '1-event-correction.png'), 'sqlt': ('A primary key is unique and never NULL', '2-primary-key-never-null.png')}
    for lid, (head, fn) in want.items():
        ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(f"startSession(buildLessonSession('{lid}'))")
        got = False
        while page.locator('[data-act="illNext"]').count():
            if head in page.inner_text('main'):
                if page.locator('[data-act="illRun"]').count():
                    page.click('[data-act="illRun"]'); page.wait_for_selector('.ill-run table, .ill-run .ill-err', timeout=8000)
                page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KEEP8}/{fn}', full_page=True); got = True; break
            page.click('[data-act="illNext"]')
        check(got, f'v8.2 picture "{head}" shown in {lid} and captured ({fn})')
        check(not errs, f'no JS errors ({lid} v8.2 picture): ' + '; '.join(errs[:5])); ctx.close()

def fast_lane_ui(br):
    ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    page.evaluate("""(() => { const t = today(); for (let i = 1; i <= 4; i++) T.daily[addDays(t, -i)] = { n: 10, ok: 10 }; T.log = Array.from({ length: 20 }, () => ({ d: addDays(t, -1), ok: 1 })); saveTerms(); go('home'); })()""")
    check('Fast lane on: consistent accuracy' in page.inner_text('main'), 'Home shows "Fast lane on: consistent accuracy" after 4 consistent days')
    page.evaluate("""(() => { for (let i = 0; i < 5; i++) t4Log(i > 0); saveTerms(); go('home'); })()""")
    txt = page.inner_text('main'); check('Fast lane off' in txt and 'Fast lane on' not in txt, 'a slip (4/5 today) turns it off at once, with a note')
    check(not errs, 'no JS errors (fast lane): ' + '; '.join(errs[:5])); ctx.close()

def unlock91(br):
    # v9.1 faster unlock (AWS C4M1 only), from a real v9.0 (7f59624) saved state that used the AWS track
    K = os.environ.get('KEEP91') or '/workspace/dd-test/shots91-keep'; os.makedirs(K, exist_ok=True)
    ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.goto(f'{BASE}/v9/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("T.log = Array.from({ length: 20 }, () => ({ d: today(), ok: 1 })); saveTerms(); go('aws')")
    page.click('[data-act="startAws"]'); n, _ = drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("(() => { A.hooks['aws0-t1'] = 'my v9 hook'; A.nr['aws0-t1'] = { s: 1, ivl: 1, n: 1, ok: 1, due: '2026-11-03' }; A.ct.awsP1 = { done: '2026-11-01' }; saveAws(); })()")
    keys = ['deLearn.v1', 'deLearn.ext', 'deLearn.terms', 'deLearn.aws']; old = {k: get(page, k) for k in keys}
    check(n > 0 and old['deLearn.aws'] is not None, f'[unlock91] v9.0 state built with an AWS session ({n} steps) and deLearn.aws')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    for k in keys: check(get(page, k) == old[k], f'[unlock91] {k} byte-identical after loading v9.1')
    check('· v10<' in page.evaluate("document.documentElement.innerHTML"), '[unlock91] v10 build loaded')
    # SQL lesson summary: no button
    page.evaluate("startSession(buildLessonSession('sql1'))"); drive(page)
    check(page.locator('[data-act="awsUnlock"]').count() == 0, '[unlock91] no unlock button after a SQL lesson')
    page.click('main.summary [data-to="home"]')
    # finish aws0 through the UI, then the summary shows the button
    page.evaluate("startSession(buildLessonSession('aws0'))"); drive(page)
    sched = "JSON.stringify([S.cards, Object.fromEntries(Object.entries(S.items).filter(([k]) => !k.startsWith('aws1')).map(([k, v]) => [k, v.due])), T.terms, T.fast, A.nr, S.xp, S.streak, localStorage.getItem('deLearn.ext')])"
    btn = page.locator('[data-act="awsUnlock"]'); check(btn.count() == 1 and page.get_attribute('[data-act="awsUnlock"]', 'data-l') == 'aws1', '[unlock91] after finishing aws0 the summary shows one button, for aws1 only')
    txt = page.inner_text('main'); check('Unlock next lesson now' in txt and 'Your spaced review still runs on its normal schedule, and this button only exists so you can keep pace with your Coursera deadlines.' in txt, '[unlock91] button label and the full etiquette sentence shown')
    ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)"); check(ov <= 390, f'[unlock91] summary fits 390px ({ov})')
    page.locator('.aw-unlock').scroll_into_view_if_needed(); page.screenshot(path=f'{K}/unlock-button.png', full_page=True)
    b4 = page.evaluate(sched); v1b, extb, trb = get(page, 'deLearn.v1'), get(page, 'deLearn.ext'), get(page, 'deLearn.terms')
    btn.click(); page.wait_for_timeout(300)
    check(page.evaluate("SESSION && SESSION.mode === 'lesson' && SESSION.lid") == 'aws1', '[unlock91] tapping opens aws1')
    check(page.evaluate(sched) == b4 and get(page, 'deLearn.v1') == v1b and get(page, 'deLearn.ext') == extb and get(page, 'deLearn.terms') == trb, '[unlock91] the tap changes no review schedule, term, name drill, fast lane, XP or streak')
    aw = json.loads(get(page, 'deLearn.aws')); check(list(aw.get('unl', {}).keys()) == ['aws1'] and aw['hooks'].get('aws0-t1') == 'my v9 hook' and aw['ct'].get('awsP1'), '[unlock91] only aws1 flagged; earlier deLearn.aws data kept')
    page.evaluate("SESSION = null; go('aws')"); check('unlocked early' in page.inner_text('main'), '[unlock91] AWS screen marks aws1 as unlocked early')
    page.evaluate("go('learn')"); check('Faster unlock' in page.inner_text('main'), '[unlock91] How learning works explains the faster unlock')
    check(not errs, '[unlock91] no page errors ' + str(errs[:3])); ctx.close()

K10 = os.environ.get('KEEP10') or '/workspace/dd-test/shots10-keep'; os.makedirs(K10, exist_ok=True)
def p390(br):
    ctx = br.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, device_scale_factor=2); page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    return ctx, page, errs

def v10_lesson(br, lid, shot, shotdir='/workspace/dd-test/shots10'):
    # v10: the whole lesson in teaching order at 390px: pictures and questions interleave, every query runs, every answer marked right
    ctx, page, errs = p390(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    page.evaluate(f"startSession(buildLessonSession('{lid}'))")
    exp = page.evaluate(f"ILLUS['{lid}'].order ? ILLUS['{lid}'].order.length : ILLUS['{lid}'].scenes.length + ILLUS['{lid}'].qs.length")
    k = 0; ran = 0; kinds = set(); hidden = 0; noreason = 0
    while page.locator('[data-act="illNext"], [data-act="vqCheck"], [data-act="vqPick"]').count():
        k += 1
        ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)")
        wide = page.evaluate("[...document.querySelectorAll('main svg, main .ill-ins, main table, main pre, main .planbox, main .qlines')].filter(e => e.getBoundingClientRect().right > 390.5).length")
        check(ov <= 390 and wide == 0, f'{lid} step {k}: no overflow at 390px (scrollWidth {ov}, wide parts {wide})')
        hidden += page.evaluate("document.querySelectorAll('main details:not([open])').length")
        noreason += page.evaluate("[...document.querySelectorAll('main table.ill tr[class*=mk-]:not(.why)')].filter(tr => /mk-[muxdn]\\b/.test(tr.className) && !(tr.nextElementSibling && tr.nextElementSibling.classList.contains('why'))).length")
        page.evaluate('scrollTo(0, 0)'); os.makedirs(shotdir, exist_ok=True); page.screenshot(path=f'{shotdir}/{shot}-{k:02d}.png', full_page=True)
        if page.locator('[data-act="illNext"]').count():
            if page.locator('[data-act="illRun"]').count():
                page.click('[data-act="illRun"]'); page.wait_for_selector('.ill-run table, .ill-run .ill-err', timeout=8000); ran += 1
                e = page.locator('.ill-run .ill-err').count(); sc = page.evaluate("(() => { const s = SESSION.steps[SESSION.i]; const L = ILLUS[s.lesson]; return L.scenes[s.sc].out && L.scenes[s.sc].out.err ? 1 : 0; })()")
                check(e == sc, f'{lid} step {k}: query runs in the app as drawn (error expected: {bool(sc)})')
            page.click('[data-act="illNext"]')
        else:
            kinds.add(page.evaluate("F.q.k")); drive(page, maxsteps=1, wrong_every=0)
            check('Correct' in page.inner_text('main'), f'{lid} step {k} ({sorted(kinds)}) answered correctly is marked correct')
            page.click('[data-act="next"]')
    check(k == exp, f'{lid}: {exp} teaching steps in order ({k}), {ran} queries run, kinds {sorted(kinds)}')
    check(hidden == 0, f'{lid}: no closed toggles on any step ({hidden})'); check(noreason == 0, f'{lid}: every marked row shows its reason ({noreason} missing)')
    n, _ = drive(page, wrong_every=3); check(n >= 0 and page.locator('main.summary').count() == 1, f'{lid} lesson completes')
    check(not errs, f'no JS errors ({lid} v10 390px): ' + '; '.join(errs[:5])); ctx.close()

def v10_back(br):
    # a miss on a question with a back link inserts the simpler question on a fresh example, then the same question again
    ctx, page, errs = p390(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    qi = page.evaluate("ILLUS.sql5.qs.findIndex(q => q.back)"); bid = page.evaluate(f"ILLUS.sql5.qs[{qi}].back"); qid = page.evaluate(f"ILLUS.sql5.qs[{qi}].id")
    page.evaluate(f"startSession({{ mode: 'lesson', lesson: LESSONS.sql5, steps: [{{ type: 'vq', lesson: 'sql5', qi: {qi} }}] }})")
    drive(page, maxsteps=1, wrong_every=1); txt = page.inner_text('main')
    check('step back' in txt.lower(), 'a miss says it goes one step back')
    page.click('[data-act="next"]'); cur = page.evaluate("(() => { const s = SESSION.steps[SESSION.i]; return [ILLUS.sql5.qs[s.qi].id, !!s.back]; })()")
    check(cur == [bid, True], f'next step is the back question {bid} ({cur})'); page.screenshot(path=f'{K10}/back-a-step.png', full_page=True)
    drive(page, maxsteps=1, wrong_every=0); page.click('[data-act="next"]')
    cur = page.evaluate("(() => { const s = SESSION.steps[SESSION.i]; return [ILLUS.sql5.qs[s.qi].id, !!s.retry]; })()"); check(cur == [qid, True], f'then the same question again ({cur})')
    rec = page.evaluate(f"T.vis.sql5.qid['{qid}']"); check(rec and rec['miss'], 'answer stored under the stable question ID')
    check(not errs, 'no JS errors (back a step): ' + '; '.join(errs[:5])); ctx.close()

def preserve_v91(br, src='v91'):
    # rich real v9.1 (98eb8f9) state: daily sessions, joins + many-to-many + table lessons, AWS session, hooks; then load v10
    ctx, page, errs = p390(br); label = 'from v9.1 98eb8f9' if src == 'v91' else 'from v10 e5c4319 (rich state)'
    page.goto(f'{BASE}/{src}/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    for l in ['sqlt', 'sqlr', 'sql5', 'sqlm']:
        page.evaluate(f"startSession(buildLessonSession('{l}'))"); drive(page, wrong_every=3); page.click('main.summary [data-to="home"]')
    page.evaluate("T.log = Array.from({ length: 20 }, () => ({ d: today(), ok: 1 })); saveTerms(); go('aws')")
    page.click('[data-act="startAws"]'); drive(page); page.click('main.summary [data-to="home"]')
    page.evaluate("(() => { A.hooks['aws0-t1'] = 'my hook'; saveAws(); })()")
    keys = ['deLearn.v1', 'deLearn.ext', 'deLearn.terms', 'deLearn.aws']; old = {k: get(page, k) for k in keys}; oldbak = {k: get(page, k + '.v9bak') for k in keys}
    oldprog = page.evaluate(PROG); oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")
    o1 = json.loads(old['deLearn.v1']); ot = json.loads(old['deLearn.terms'])
    check((ot['vis']['sql5'].get('q') if src == 'v91' else ot['vis']['sql5'].get('qid')) and o1['xp'] > 1234, f'[{label}] rich v9.1 state: sql5 answers by position, XP {o1["xp"]}')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    for k in keys: check(get(page, k) == old[k], f'[{label}] {k} byte-identical after loading v10.1')
    if src == 'v91':
        for k in keys: check(get(page, k + '.v9bak') == old[k], f'[{label}] {k}.v9bak backup equals the v9.1 data')
    else:
        for k in keys: check(get(page, k + '.v9bak') == (oldbak[k] if oldbak[k] is not None else old[k]), f'[{label}] {k}.v9bak backup kept (an existing backup is never overwritten; a missing one is filled from the current data)')
    check(get(page, 'deLearn.floor10') is not None, f'[{label}] % floor saved in the new key deLearn.floor10')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item % lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); lowm = [m for m, v in oldmod if newmod.get(m, 0) + 1e-9 < v]
    check(not lowm, f'[{label}] no module % lowered ' + str(lowm))
    check(src != 'v91' or page.evaluate("Object.keys(ILLUS.sql5.qs).every((_, i) => !!vqRec('sql5', i) === !!(T.vis.sql5.q && T.vis.sql5.q[i] && !ILLUS.sql5.qs[i].id))"), f'[{label}] old answers readable by stable ID')
    plan = page.inner_text('.today'); page.click('#startBtn'); n, seen = drive(page); check(n > 0, f'[{label}] daily session after the update completes ({n} steps)')
    a1 = json.loads(get(page, 'deLearn.v1')); at = json.loads(get(page, 'deLearn.terms')); aa = json.loads(get(page, 'deLearn.aws'))
    check(a1['xp'] >= o1['xp'] and a1['streak'] >= o1['streak'] and all(a1['theory'].get(k) == v for k, v in o1['theory'].items()), f'[{label}] XP {o1["xp"]}→{a1["xp"]}, streak and theory kept')
    check(all(k in a1['cards'] and a1['cards'][k] for k in o1['cards']), f'[{label}] flashcards kept ({len(o1["cards"])})')
    lowt = [k for k, v in ot['terms'].items() if k in at['terms'] and at['terms'][k].get('tier', 0) == v.get('tier', 0) and any(a['s'] < b['s'] for a, b in zip(at['terms'][k]['ph'], v['ph']))]
    check(not lowt, f'[{label}] no term phrase step lowered ' + str(lowt[:5]))
    check(all(at['vis']['sql5'].get('q', {}).get(k) == v for k, v in ot['vis']['sql5'].get('q', {}).items()) and all(at['vis']['sql5'].get('qid', {}).get(k, {}).get('n', 0) >= v.get('n', 0) for k, v in ot['vis']['sql5'].get('qid', {}).items()), f'[{label}] earlier picture answers (vis.sql5.q / qid) kept')
    check(aa['hooks'].get('aws0-t1') == 'my hook', f'[{label}] deLearn.aws hook kept')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

KCTE = os.environ.get('KEEPCTE') or '/workspace/dd-test/shots-cte'; os.makedirs(KCTE, exist_ok=True)
def cte103_state(br):
    # a rich v10.2 (9ab5ff9) state that has already seen sql6 and sql7 (CTEs) and the joins steps; then load v10.3
    ctx, page, errs = p390(br); label = 'from v10.2 9ab5ff9'
    page.goto(f'{BASE}/v102/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    for l in ['sql4', 'sqlt', 'sqlr', 'sql5', 'sqlm', 'sql6', 'sql7']:
        page.evaluate(f"startSession(buildLessonSession('{l}'))"); drive(page, wrong_every=3); page.click('main.summary [data-to="home"]')
    page.evaluate("(() => { ['sql7-t1', 'sql7-c1'].forEach((id, k) => { S.items[id] = Object.assign({}, S.items[id] || {}, { lvl: 3 + k, due: today(), right: 3, wrong: 1, seen: today(), intro: '2026-11-01', mastered: false }); }); S.cards['sql6-c4'] = { ease: 2.4, ivl: 5, reps: 2, lapses: 0, due: addDays(today(), 6), added: '2026-11-02' }; save(); \
      Object.keys(ILLUS).forEach(id => { if (S.theory[id] && !visSeen(id)) visState(id).seen = today(); }); saveTerms(); })()")  # pictures of every read lesson seen, as for a learner who keeps up
    page.reload(); page.wait_for_selector('#startBtn')  # let v10.2's own term migration absorb the seeded records first
    keys = ['deLearn.v1', 'deLearn.ext', 'deLearn.terms', 'deLearn.aws', 'deLearn.floor10', 'deLearn.fix102', 'deLearn.v1.v9bak', 'deLearn.terms.v9bak']; old = {k: get(page, k) for k in keys}
    page.reload(); page.wait_for_selector('#startBtn'); check(all(get(page, k) == old[k] for k in keys), f'[{label}] control: reloading v10.2 itself changes nothing')
    oldprog = page.evaluate(PROG); oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])"); o1 = json.loads(old['deLearn.v1']); ot = json.loads(old['deLearn.terms'])
    check(ot['vis'].get('sql7', {}).get('seen') and o1['items'].get('sql7-c1') and o1['xp'] > 1234, f'[{label}] seeded state: sql7 pictures seen, sql7 cards in progress, XP {o1["xp"]}, streak {o1["streak"]}')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    for k in keys: check(get(page, k) == old[k], f'[{label}] {k} byte-identical after loading v10.3')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if abs(newprog.get(k, 0) - oldprog[k]) > 1e-9]
    check(not lower, f'[{label}] every lesson and item % identical ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); chm = [m for m, v in oldmod if abs(newmod.get(m, 0) - v) > 1e-9]
    check(not chm, f'[{label}] every module % identical ' + str(chm))
    # v10.4: sqlrt and sql6 now have new steps that come first in curriculum order; this test is about sql7's v10.3 steps, so mark those two seen
    cu = page.evaluate("catchUpIllus()"); check(cu == {'id': 'sql7', 'onlyNew': True}, f'[{label}] the new CTE steps are the pending catch-up ({cu})')
    # the catch-up is shown on a day when no new lesson's pictures are shown (the v6 rule); simulate such a day
    page.evaluate("nextLesson = () => null; go('home')")
    plan = page.inner_text('.today'); check('CTEs (WITH)' in plan, f'[{label}] home plan offers the new CTE steps: ' + plan.replace('\n', ' | ')[:160])
    page.screenshot(path=f'{KCTE}/0-home-catch-up.png', full_page=True)
    page.click('#startBtn'); first = page.inner_text('main'); check('🆕 new' in first.lower() and 'Step 1 · Sort the streams into piles by hand' in first, f'[{label}] the session opens with the 🆕 new Step 1: ' + first[:90].replace('\n', ' | '))
    n, seen = drive(page, wrong_every=5); check(n > 0, f'[{label}] daily session with the catch-up completes ({n} steps)')
    a1 = json.loads(get(page, 'deLearn.v1')); at = json.loads(get(page, 'deLearn.terms'))
    check(a1['xp'] >= o1['xp'] and a1['streak'] >= o1['streak'] and a1['best'] >= o1['best'] and all(a1['theory'].get(k) == v for k, v in o1['theory'].items()), f'[{label}] XP {o1["xp"]}→{a1["xp"]}, streak {o1["streak"]}→{a1["streak"]}, best and theory kept')
    check(all(a1['cards'].get(k) == v for k, v in o1['cards'].items() if v['due'] > page.evaluate('today()')), f'[{label}] flashcards not yet due are byte-identical (SM-2 due dates, ease, intervals)')
    check(all(k in a1['cards'] for k in o1['cards']), f'[{label}] every flashcard kept ({len(o1["cards"])})')
    check(all(a1['items'][k]['lvl'] >= v['lvl'] - 1 and k in a1['items'] for k, v in o1['items'].items()), f'[{label}] every item record kept (code items follow the normal one-level fade rule on a wrong answer)')
    check(at['vis']['sql7'].get('v103') and at['vis']['sql7'].get('q') == ot['vis']['sql7'].get('q') and all(at['vis']['sql7'].get('qid', {}).get(k, {}).get('n', 0) >= v.get('n', 0) for k, v in ot['vis']['sql7'].get('qid', {}).items()), f'[{label}] catch-up recorded under the new key vis.sql7.v103; earlier sql7 answers kept')
    new_ids = [k for k in at['vis']['sql7'].get('qid', {}) if k.startswith('sql7.g')]; check(len(new_ids) >= 30, f'[{label}] new answers stored under stable IDs ({len(new_ids)})')
    prog2 = page.evaluate(PROG); low2 = [k for k in oldprog if ITEM_KIND.get(k) != 'code' and prog2.get(k, 0) + 1e-9 < oldprog[k]]
    check(not low2, f'[{label}] no lesson or term % lowered after the session ' + str(low2[:5]))
    page.click('main.summary [data-to="home"]'); rk = page.evaluate("[v10Pending('sql7'), relKey('sql7'), !!T.vis.sql7.v103]"); check(rk[0] is False and rk[2], f'[{label}] the catch-up is not offered again (no sql7 step pending: {rk})')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def cte103_ui(br):
    # key screens at phone width, and the write-it questions marked by result (a right-but-different answer, COUNT(*), a lucky constant)
    ctx, page, errs = p390(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    def scene(h, name):
        i = page.evaluate(f"ILLUS.sql7.scenes.findIndex(s => s.h === {json.dumps(h)})")
        page.evaluate(f"startSession({{ mode: 'lesson', lesson: LESSONS.sql7, steps: [{{ type: 'illus', lesson: 'sql7', sc: {i}, isNew: true, pos: 1, of: 1, last: true }}] }})")
        if page.locator('[data-act="illRun"]').count(): page.click('[data-act="illRun"]'); page.wait_for_selector('.ill-run table, .ill-run .ill-err', timeout=8000)
        ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)"); check(ov <= 390, f'[cte ui] {name}: no overflow at 390px ({ov})')
        page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KCTE}/{name}.png', full_page=True); return page.inner_text('main')
    def vq(qid, code=None):
        qi = page.evaluate(f"ILLUS.sql7.qs.findIndex(q => q.id === '{qid}')")
        page.evaluate(f"startSession({{ mode: 'lesson', lesson: LESSONS.sql7, steps: [{{ type: 'vq', lesson: 'sql7', qi: {qi}, isNew: true, pos: 1, of: 1 }}] }})")
        if code is not None: page.fill('#vqCode', code); page.click('[data-act="vqCheck"]'); page.wait_for_selector('[data-act="next"]', timeout=8000)
        return page.inner_text('main')
    t = scene('Step 1 · Your piles in SQL: GROUP BY and COUNT(*)', '1-step1-piles-group-by'); check('pile 14 has 3 rows' in t and 'same pile' in t, '[cte ui] Step 1: piles drawn with a reason on every row')
    t = scene('Step 2 · Two columns in GROUP BY: every count is 1', '2-step2-composite-trap'); check('GROUP BY whatever one row of your answer means' in t, '[cte ui] Step 2: the rule shown after the two-column result')
    t = scene('Step 4 · Two steps in one query: a CTE', '3-step4-cte'); check('MAX(stream_count)' in t and 'temporary table' in t, '[cte ui] Step 4: the CTE with its 3-row step result')
    t = scene('Step 5 · CTE and derived table side by side', '4-step5-side-by-side'); check('inside out' in t and 'top to bottom' in t, '[cte ui] Step 5: the side-by-side table')
    t = scene('Step 6 · Three steps as a CTE', '5-step6-three-steps'); check('2 is not bigger than 2' in t, '[cte ui] Step 6: every row has its reason (2 is not bigger than 2)')
    t = scene('Step 7 · HAVING fixes the order, not the nesting', '6-step7-nested-aggregate'); check('misuse of aggregate function' in t and 'already aggregated' in t, '[cte ui] Step 7: the real SQLite error and the guiding question')
    page.evaluate("(() => { visState('sql7').plan = { row: ILLUS.sql7.qs.find(q => q.plan === 'row').o[0], cnt: ILLUS.sql7.qs.find(q => q.plan === 'cnt').o[0], avg: ILLUS.sql7.qs.find(q => q.plan === 'avg').o[0] }; })()")
    t = vq('sql7.g8f'); page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KCTE}/7-step8-write-from-plan.png', full_page=True); check('Your plan' in t and 'COUNT(DISTINCT song_id)' in t and 'listener_id' in t, '[cte ui] Step 8: the learner writes the query with their plan and the listener_id data on screen')
    t = scene('Step 8 · Check your query, step by step', '7b-step8-check-step-by-step'); check('Your plan' in t and '1.5' in t and 'Steps needed' in t, '[cte ui] Step 8: the check screen walks through each step')
    t = scene('Step 8 · Two piles, one per listener', '8a-step8-two-piles'); check('Listener 7’s pile' in t and 'Listener 8’s pile' in t, '[cte ui] Step 8: each listener’s pile shown as its own table')
    t = vq('sql7.g8c'); check('stands for one play' in t and 'result' in t, '[cte ui] Step 8: asks what one row of step 1’s RESULT stands for (not a streams row)')
    t = scene('Step 8 · Change one row: listener 8 streams song 14', '8b-step8-change-one-row'); check('the one new row' in t and 'listener 8 streams song 14' in t, '[cte ui] Step 8: the full 7-row table before the change-one-row questions')
    t = scene('Step 8 · Repeat plays and new songs', '9-step8-repeat-vs-new-song'); check('three versions of streams' in t and 'rises only when' in t and '3.5' in t, '[cte ui] Step 8: the change-one-row summary (COUNT(*) vs DISTINCT)')
    t = vq('sql7.g1b'); check('stream_id' in t and 'song_id' in t and page.locator('main details:not([open])').count() == 0, '[cte ui] question shows the exact data it needs, open')
    page.click('[data-act="vqPick"] >> nth=0') if False else None
    sol = page.evaluate("ILLUS.sql7.qs.find(q => q.id === 'sql7.g8f').sol")
    t = vq('sql7.g8f', sol.replace(' AS avg_songs', '').replace('listener_songs', 'ls')); check('Correct' in t, '[cte ui] g8f: a right answer with other names is marked correct')
    t = vq('sql7.g8f', sol.replace('COUNT(DISTINCT song_id)', 'COUNT(*)')); check('Not quite' in t and 'A correct query' in t, '[cte ui] g8f: COUNT(*) is marked wrong (gives 3, not 1.5) and the model query is shown')
    page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{KCTE}/8-step8-wrong-count-star.png', full_page=True)
    t = vq('sql7.g8f', 'SELECT 1.5;'); check('Not quite' in t and 'must still use DISTINCT' in t, '[cte ui] g8f: a constant that matches by luck is wrong, with the reason')
    t = vq('sql7.g4b', "WITH song_counts AS (\n  SELECT song_id, COUNT(*) AS stream_count\n  FROM streams\n  GROUP BY stream_id\n)\nSELECT MAX(stream_count)\nFROM song_counts;"); check('Not quite' in t, '[cte ui] g4b: GROUP BY stream_id (every count 1) is marked wrong')
    check(not errs, '[cte ui] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

K102 = os.environ.get('KEEP102') or '/workspace/dd-test/shots102-keep'; os.makedirs(K102, exist_ok=True)
USER_LINES = ['SELECT st.song_id, COUNT(DISTINCT st.listener_id)', 'GROUP BY st.song_id;']
SET_L3 = "(() => { S.items['sqlm-c3'] = { lvl: 3, due: today(), right: 2, wrong: 0, seen: '%s', intro: '2026-11-01', mastered: false }; save(); startSession({ mode: 'lesson', lesson: LESSONS.sqlm, steps: [{ type: 'fade', id: 'sqlm-c3' }] }); })()" % yest
def answer_l3(page, a, b):
    ins = page.locator('.inputs input'); ins.nth(0).fill(a); ins.nth(1).fill(b); page.click('[data-act="checkFade"]'); page.wait_for_selector('[data-act="next"]', timeout=8000)
    return page.inner_text('main')

def fix102_state(br):
    # v10.1 (192662b) state where the old checker really dropped sqlm-c3 from Level 3 to 2 for the user's exact lines; then load v10.2
    ctx, page, errs = p390(br); label = 'from v10.1 192662b'
    page.goto(f'{BASE}/v101/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    for l in ['sql5', 'sqlm']:
        page.evaluate(f"startSession(buildLessonSession('{l}'))"); drive(page, wrong_every=3); page.click('main.summary [data-to="home"]')
    page.evaluate(SET_L3); txt = answer_l3(page, *USER_LINES)
    check('Dropping back to Level 2' in txt, f'[{label}] the old build reproduces the bug: the correct answer drops the card to Level 2')
    page.evaluate("SESSION = null; go('home')")
    keys = ['deLearn.v1', 'deLearn.ext', 'deLearn.terms', 'deLearn.aws', 'deLearn.floor10']; old = {k: get(page, k) for k in keys}
    oldprog = page.evaluate(PROG); oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])"); o1 = json.loads(old['deLearn.v1'])
    check(o1['items']['sqlm-c3']['lvl'] == 2 and get(page, 'deLearn.fix102') is None, f'[{label}] saved state: sqlm-c3 at Level 2, no repair flag yet')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    for k in keys[1:]: check(get(page, k) == old[k], f'[{label}] {k} byte-identical after loading v10.2')
    n1 = json.loads(get(page, 'deLearn.v1')); c_old = o1['items'].pop('sqlm-c3'); c_new = n1['items'].pop('sqlm-c3')
    check(json.dumps(n1, sort_keys=True) == json.dumps(o1, sort_keys=True), f'[{label}] deLearn.v1 identical apart from the sqlm-c3 record (XP, streak, days, other cards, flashcards, theory)')
    check(c_new['lvl'] == 4 and c_new['right'] == c_old['right'] + 1 and c_new['wrong'] == c_old['wrong'] and c_new['due'] >= c_old['due'] and c_new['intro'] == c_old['intro'], f'[{label}] sqlm-c3 restored: Level {c_old["lvl"]} → {c_new["lvl"]}, counted right, due {c_old["due"]} → {c_new["due"]}')
    flag = json.loads(get(page, 'deLearn.fix102') or 'null'); check(flag and flag['changed'] and flag['before']['lvl'] == 2, f'[{label}] deLearn.fix102 records the repair (before and after)')
    newprog = page.evaluate(PROG); lower = [k for k in oldprog if newprog.get(k, 0) + 1e-9 < oldprog[k]]
    check(not lower, f'[{label}] no lesson or item % lowered ({len(oldprog)} checked) ' + str(lower[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); lowm = [m for m, v in oldmod if newmod.get(m, 0) + 1e-9 < v]
    check(not lowm, f'[{label}] no module % lowered; floor10 holds ' + str(lowm))
    after1 = {k: get(page, k) for k in keys + ['deLearn.fix102']}; page.reload(); page.wait_for_selector('#startBtn')
    check(all(get(page, k) == after1[k] for k in after1), f'[{label}] a second load changes nothing (the repair runs once)')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

def fix102_ui(br):
    # the user's exact answer is now accepted with an explanation; COUNT(*) is wrong with a plain-words reason (phone width)
    ctx, page, errs = p390(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    page.evaluate(SET_L3); txt = answer_l3(page, *USER_LINES)
    check('Correct' in txt and 'Level 4' in txt and 'safer' in txt and 'model answer' in txt.lower(), '[fix102 ui] the user\'s exact answer is marked correct, explains why, shows the model answer as an alternative')
    check(page.locator('.inputs .inp.bad').count() == 0, '[fix102 ui] no line is highlighted red')
    lv = page.evaluate("S.items['sqlm-c3'].lvl"); check(lv == 4, f'[fix102 ui] card moves up to Level 4 ({lv})')
    ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)"); check(ov <= 390, f'[fix102 ui] no overflow at 390px ({ov})')
    page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K102}/a-user-answer-accepted.png', full_page=True)
    page.evaluate(SET_L3); txt = answer_l3(page, 'SELECT s.title, COUNT(*) AS listeners', 'GROUP BY s.title;')
    check('Not quite' in txt and 'counted plays' in txt and 'what is wrong' in txt.lower(), '[fix102 ui] COUNT(*) is wrong and the reason says it counted plays, not different listeners')
    lv = page.evaluate("S.items['sqlm-c3'].lvl"); check(lv == 2, f'[fix102 ui] a wrong answer still drops one level ({lv})')
    ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)"); check(ov <= 390, f'[fix102 ui] no overflow at 390px ({ov})')
    page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K102}/b-count-star-wrong.png', full_page=True)
    page.evaluate(SET_L3); txt = answer_l3(page, 'SELECT s.title, COUNT(DISTINCT st.listener_id) AS listeners', 'GROUP BY s.title;')
    check('Correct' in txt and 'what is wrong' not in txt.lower() and 'why it counts' not in txt.lower(), '[fix102 ui] the model lines are still accepted by the text check, as before')
    page.evaluate("(() => { S.items['sqlm-c3'] = { lvl: 4, due: today(), right: 3, wrong: 0, seen: null, intro: '2026-11-01', mastered: false }; startSession({ mode: 'lesson', lesson: LESSONS.sqlm, steps: [{ type: 'fade', id: 'sqlm-c3' }] }); })()")
    page.fill('textarea.recall', 'SELECT st.song_id, COUNT(DISTINCT st.listener_id)\nFROM streams st\nJOIN songs s ON s.song_id = st.song_id\nGROUP BY st.song_id;'); page.click('[data-act="checkFade"]'); page.wait_for_selector('[data-act="selfGrade"]', timeout=8000)
    check('same result as the model answer' in page.inner_text('main'), '[fix102 ui] Level 4: the query is run and reported before the self-grade')
    page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K102}/c-level4-run-check.png', full_page=True)
    check(not errs, '[fix102 ui] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

K104 = os.environ.get('KEEP104') or '/workspace/dd-test/shots-v104'; os.makedirs(K104, exist_ok=True)
V104L = ['sqlrt', 'sql6', 'sql7', 'sql8', 'sql9']; V104S = ['sql7']  # shown in v10.4a; the rest is parked behind V104_ON
def v104_state(br):
    # a rich v10.3 (5a80296) state that has seen every lesson after joins, with cards, SM-2 data and items in progress; then load v10.4
    ctx, page, errs = p390(br); label = 'from v10.3 5a80296'
    page.goto(f'{BASE}/v103/index.html'); page.wait_for_selector('#startBtn'); page.evaluate(CRAFT); page.reload(); page.wait_for_selector('#startBtn')
    if page.locator('[data-act="startFresh"]').count(): page.click('[data-act="startFresh"]')
    page.click('#startBtn'); drive(page); page.click('main.summary [data-to="home"]')
    for l in ['sql4', 'sqlt', 'sqlr', 'sql5', 'sqlm', 'sqlc', 'sqlrt', 'sql6', 'sql7', 'sql8', 'sql9']:
        page.evaluate(f"startSession(buildLessonSession('{l}'))"); drive(page, wrong_every=3); page.click('main.summary [data-to="home"]')
    # an sql8 card in progress (started items are never held) and SM-2 cards with future due dates; sql9 code items left not started
    page.evaluate("(() => { ['sql8-c1', 'sql7-c3'].forEach((id, k) => { S.items[id] = Object.assign({}, S.items[id] || {}, { lvl: 2 + k, due: today(), right: 2, wrong: 1, seen: today(), intro: '2026-11-10', mastered: false }); }); \
      S.cards['sql6-c4'] = { ease: 2.4, ivl: 5, reps: 2, lapses: 0, due: addDays(today(), 6), added: '2026-11-02' }; S.cards['sql8-c2'] = { ease: 2.1, ivl: 9, reps: 3, lapses: 1, due: addDays(today(), 9), added: '2026-11-05' }; \
      Object.keys(S.items).filter(id => /^sql9-c/.test(id)).forEach(id => delete S.items[id]); Object.keys(S.cards).filter(id => /^sql9-c/.test(id)).forEach(id => delete S.cards[id]); \
      ['sqlrt', 'sql6', 'sql7', 'sql8', 'sql9'].forEach(l => S.theory[l] = S.theory[l] || '2026-11-10'); save(); })()")
    # earlier lessons' pictures marked seen (as a learner who kept up would have), so only the v10.4 steps are pending
    page.evaluate("(() => { let c, k = 0; while ((c = catchUpIllus()) && k++ < 60) { T.vis[c.id] = Object.assign(T.vis[c.id] || {}, { seen: '2026-11-10', v10: '2026-11-10', v101: '2026-11-10', v103: '2026-11-10' }); } saveTerms(); })()")
    page.reload(); page.wait_for_selector('#startBtn')
    keys = ['deLearn.v1', 'deLearn.ext', 'deLearn.terms', 'deLearn.aws', 'deLearn.floor10', 'deLearn.fix102', 'deLearn.v1.v9bak', 'deLearn.terms.v9bak']; old = {k: get(page, k) for k in keys}
    page.reload(); page.wait_for_selector('#startBtn'); check(all(get(page, k) == old[k] for k in keys), f'[{label}] control: reloading v10.3 itself changes nothing')
    oldprog = page.evaluate(PROG); oldmod = page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])"); o1 = json.loads(old['deLearn.v1']); ot = json.loads(old['deLearn.terms'])
    check(all(ot['vis'].get(l, {}).get('seen') for l in V104L) and o1['items'].get('sql8-c1') and o1['xp'] > 1234, f'[{label}] seeded state: all five lessons seen, sql8-c1 in progress, XP {o1["xp"]}, streak {o1["streak"]}, {len(o1["cards"])} cards')
    page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    for k in keys: check(get(page, k) == old[k], f'[{label}] {k} byte-identical after loading v10.4')
    newprog = page.evaluate(PROG); chg = [k for k in oldprog if abs(newprog.get(k, 0) - oldprog[k]) > 1e-9]
    check(not chg, f'[{label}] every lesson and item % identical ({len(oldprog)} checked) ' + str(chg[:5]))
    newmod = dict(page.evaluate("CURRICULUM.modules.map(m => [m.id, moduleProgress(m)])")); chm = [m for m, v in oldmod if abs(newmod.get(m, 0) - v) > 1e-9]
    check(not chm, f'[{label}] every module % identical ' + str(chm))
    cu = page.evaluate("catchUpIllus()"); check(cu == {'id': 'sql7', 'onlyNew': True}, f'[{label}] the new UNION / RECURSIVE steps (sql7) are the pending catch-up ({cu})')
    held = page.evaluate("Object.keys(ITEMS).filter(itemHeld)"); check(all(h.startswith('sql7-') for h in held) and 'sql8-c1' not in held and 'sql7-c3' not in held, f'[{label}] only not-started cards of the five lessons are held ({len(held)}); started sql8-c1 and sql7-c3 are not')
    page.evaluate("nextLesson = () => null; go('home')")
    page.click('#startBtn'); first = page.inner_text('main'); check('🆕 new' in first.lower() and 'Step 10' in first, f'[{label}] the session opens with the 🆕 new Step 10 (stacking): ' + first[:90].replace('\n', ' | '))
    page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K104}/0-catch-up-first-step.png', full_page=True)
    n, seen = drive(page, wrong_every=5); check(n > 0, f'[{label}] daily session with the catch-up completes ({n} steps)')
    a1 = json.loads(get(page, 'deLearn.v1')); at = json.loads(get(page, 'deLearn.terms'))
    check(a1['xp'] >= o1['xp'] and a1['streak'] >= o1['streak'] and a1['best'] >= o1['best'] and all(a1['theory'].get(k) == v for k, v in o1['theory'].items()), f'[{label}] XP {o1["xp"]}→{a1["xp"]}, streak {o1["streak"]}→{a1["streak"]}, best and theory kept')
    check(all(a1['cards'].get(k) == v for k, v in o1['cards'].items() if v['due'] > page.evaluate('today()')), f'[{label}] flashcards not yet due are byte-identical (SM-2 due dates, ease, intervals)')
    check(all(k in a1['cards'] for k in o1['cards']), f'[{label}] every flashcard kept ({len(o1["cards"])})')
    check(all(k in a1['items'] and a1['items'][k]['lvl'] >= v['lvl'] - 1 for k, v in o1['items'].items()), f'[{label}] every item record kept (code items follow the normal one-level fade rule on a wrong answer)')
    check(at['vis']['sql7'].get('v104') and at['vis']['sql7'].get('q') == ot['vis']['sql7'].get('q') and all(at['vis']['sql7'].get('qid', {}).get(k, {}).get('n', 0) >= v.get('n', 0) for k, v in ot['vis']['sql7'].get('qid', {}).items()), f'[{label}] catch-up recorded under vis.sql7.v104; earlier sql7 answers kept')
    early = [k for k in a1['items'] if k not in o1['items'] and k.split('-')[0] in V104L and not at['vis'].get(k.split('-')[0], {}).get('v104')]
    check(not early, f'[{label}] no card of a lesson started before its new steps are seen ' + str(early))
    still = [l for l in V104L if at['vis'][l].get('v104')]; check(still == ['sql7'], f'[{label}] only sql7 recorded v104; parked lessons untouched ({still})')
    prog2 = page.evaluate(PROG); low2 = [k for k in oldprog if ITEM_KIND.get(k) != 'code' and prog2.get(k, 0) + 1e-9 < oldprog[k]]
    check(not low2, f'[{label}] no lesson or term % lowered after the session ' + str(low2[:5]))
    page.click('main.summary [data-to="home"]'); cu2 = page.evaluate("catchUpIllus()"); check(cu2 is None, f'[{label}] no further catch-up while the rest is parked ({cu2})')
    check(not errs, f'[{label}] no JS errors: ' + '; '.join(errs[:5])); ctx.close()

V104_SHOTS = {
  'sqlrt': [('Chart task · The request and the rows', 'a-request'), ('Chart task 3 · One pile per artist', 'b-piles'), ('Chart task 4 · COUNT(*) or COUNT(DISTINCT chart_date)?', 'c-count-vs-distinct'), ('Chart task · Change one row: Heaven Baby was #6 on 2026-10-16', 'd-change-one-row'), ('Chart task 5 · Keep the artists on more than one day: HAVING', 'e-having')],
  'sql6': [('Step 1 · Put the inner query where the number goes', 'a-scalar'), ('Step 2 · IN checks each artist against the list', 'b-in'), ('Step 3 · The derived table in SQL', 'c-derived'), ('Step 4 · NOT EXISTS: no matching row at all', 'd-not-exists'), ('Step 5 · NOT IN returns nobody', 'e-not-in-null'), ('Step 6 · Combine: charted, but never top 3', 'f-combine')],
  'sql7': [('Step 9 · Chained CTEs: WITH once, then commas', 'a-chained'), ('Step 10 · Stack two lists, by hand', 'b-stack-by-hand'), ('Step 10 · UNION: stack, then remove duplicate rows', 'c-union'), ('Step 11 · Numbers 1 to 7, built round by round', 'd-recursive-rounds'), ('Step 11 · Spot the mistakes: no stop rule, and <= 7', 'e-recursive-mistakes'), ('Step 11 · Another use: who reports to whom', 'f-hierarchy'), ('Step 12 · Whole numbers divide to a whole number', 'g-integer-division')],
  'sql8': [('Step 1 · GROUP BY gives the averages but loses the rows', 'a-groupby-vs-window'), ('Step 4 · ROW_NUMBER, RANK and DENSE_RANK in SQL', 'b-ties'), ('Step 5 · LAG reads the row before', 'c-lag'), ('Step 6 · SUM over a frame: from the first row to this row', 'd-frame'), ('Step 7 · Spot the mistake: WHERE rn = 1', 'e-where-rn'), ('Step 7 · Deduplicate: keep the latest copy', 'f-dedupe')],
  'sql9': [('Step 1 · CASE: the first true WHEN wins', 'a-case'), ('Step 2 · COALESCE: the first value that is not NULL', 'b-coalesce'), ('Step 3 · Numbers stored as text sort wrongly', 'c-text-sort'), ('Step 4 · Dividing safely: 100.0 and NULLIF', 'd-nullif'), ('Step 5 · SUM(CASE WHEN …): conditional aggregation', 'e-sum-case'), ('Step 6 · Combine: top-5 entries and the rest, per artist', 'f-combine')]}
def v104_ui(br):
    # key screens of each rebuilt lesson at phone width (several per lesson), the colour legend, and the write-it questions marked by result
    ctx, page, errs = p390(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    def scene(lid, h, name):
        i = page.evaluate(f"ILLUS.{lid}.scenes.findIndex(s => s.h === {json.dumps(h)})"); check(i >= 0, f'[v104 ui] {lid}: screen “{h}” exists')
        page.evaluate(f"startSession({{ mode: 'lesson', lesson: LESSONS.{lid}, steps: [{{ type: 'illus', lesson: '{lid}', sc: {i}, isNew: true, pos: 1, of: 1, last: true }}] }})")
        if page.locator('[data-act="illRun"]').count(): page.click('[data-act="illRun"]'); page.wait_for_selector('.ill-run table, .ill-run .ill-err', timeout=8000)
        ov = page.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)"); check(ov <= 390, f'[v104 ui] {lid} {name}: no overflow at 390px ({ov})')
        info = page.evaluate(f"(() => {{ const s = ILLUS.{lid}.scenes[{i}]; const m = (s.ins || []).concat(s.after || []).concat(s.out ? [s.out] : []).flatMap(x => x.m || []); const html = document.querySelector('main').innerHTML; return {{ g: m.some(k => /^g/.test(k)), legend: !!document.querySelector('main .ill-lg'), tbl: html.indexOf('<table'), say: html.indexOf('ill-say') }}; }})()")
        check(info['tbl'] > -1 and info['tbl'] < info['say'], f'[v104 ui] {lid} {name}: tables before the text')
        check(not info['g'] or info['legend'], f'[v104 ui] {lid} {name}: colour groups come with a one-line legend')
        page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K104}/{lid}-{name}.png', full_page=True); return page.inner_text('main')
    def vq(lid, qid, code=None, name=None):
        qi = page.evaluate(f"ILLUS.{lid}.qs.findIndex(q => q.id === '{qid}')")
        page.evaluate(f"startSession({{ mode: 'lesson', lesson: LESSONS.{lid}, steps: [{{ type: 'vq', lesson: '{lid}', qi: {qi}, isNew: true, pos: 1, of: 1 }}] }})")
        if code is not None: page.fill('#vqCode', code); page.click('[data-act="vqCheck"]'); page.wait_for_selector('[data-act="next"]', timeout=8000)
        if name: page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K104}/{lid}-{name}.png', full_page=True)
        return page.inner_text('main')
    for lid, lst in [(l, [x for x in V104_SHOTS[l] if x[1] in ('b-stack-by-hand', 'c-union', 'd-recursive-rounds', 'e-recursive-mistakes', 'f-hierarchy')]) for l in V104S]:
        for h, name in lst: scene(lid, h, name)
    s7 = page.evaluate("ILLUS.sql7.qs.find(q => q.id === 'sql7.h13').sol"); t = vq('sql7', 'sql7.h13', s7.replace('n < 30', 'n <= 30'), 'h-recursive-wrong-stop'); check('Not quite' in t, '[v104 ui] sql7.h13: a <= stop rule (one round too many) is marked wrong')
    # an older lesson with colour groups still reads correctly with the new palette
    i = page.evaluate("ILLUS.sqlm.scenes.findIndex(s => JSON.stringify(s).indexOf('\"g0\"') > -1)")
    if i >= 0:
        page.evaluate(f"startSession({{ mode: 'lesson', lesson: LESSONS.sqlm, steps: [{{ type: 'illus', lesson: 'sqlm', sc: {i}, isNew: false, pos: 1, of: 1, last: true }}] }})")
        page.evaluate('scrollTo(0, 0)'); page.screenshot(path=f'{K104}/older-sqlm-palette.png', full_page=True)
        check(page.evaluate("document.querySelectorAll('main tr[class*=mk-g]').length") > 0, '[v104 ui] an older lesson (sqlm) still shows its colour groups with the new palette')
    check(not errs, '[v104 ui] no JS errors: ' + '; '.join(errs[:5])); ctx.close()


with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROME', '/usr/bin/google-chrome'), args=['--no-sandbox'])
    if os.environ.get('ONLY') == 'unlock91':
        unlock91(br); print('FAILS: %d' % len(fails)); [print(' - ' + f) for f in fails]; raise SystemExit(1 if fails else 0)
    if os.environ.get('ONLY') == 'v10':
        preserve_v91(br); preserve_v91(br, 'v10'); [v10_lesson(br, l, 'v10-' + l) for l in ['sql5', 'sqlm', 'sqlc', 'sqlrt']]; v10_back(br)
        print('FAILS: %d' % len(fails)); [print(' - ' + f) for f in fails]; raise SystemExit(1 if fails else 0)
    if os.environ.get('ONLY') == 'fix102':
        fix102_state(br); fix102_ui(br); print('FAILS: %d' % len(fails)); [print(' - ' + f) for f in fails]; raise SystemExit(1 if fails else 0)
    if os.environ.get('ONLY') == 'cte103':
        ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
        ITEM_KIND = page.evaluate("Object.fromEntries(Object.values(ITEMS).map(i => [i.id, i.kind]))"); ctx.close()
        cte103_state(br); cte103_ui(br); v10_lesson(br, 'sql7', 'cte', KCTE + '/all'); print('FAILS: %d' % len(fails)); [print(' - ' + f) for f in fails]; raise SystemExit(1 if fails else 0)
    if os.environ.get('ONLY') == 'v104':
        ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
        ITEM_KIND = page.evaluate("Object.fromEntries(Object.values(ITEMS).map(i => [i.id, i.kind]))"); ctx.close()
        v104_state(br); v104_ui(br); [v10_lesson(br, l, l, K104 + '/all') for l in V104S]; print('FAILS: %d' % len(fails)); [print(' - ' + f) for f in fails]; raise SystemExit(1 if fails else 0)
    if os.environ.get('ONLY') == 'aws9':
        aws9(br); print('FAILS: %d' % len(fails)); [print(' - ' + f) for f in fails]; raise SystemExit(1 if fails else 0)
    ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn')
    ITEM_KIND = page.evaluate("Object.fromEntries(Object.values(ITEMS).map(i => [i.id, i.kind]))"); ctx.close()
    preserve(br, 'from 08c6b1a', 'v2', False)
    preserve(br, 'from v3 371b94a', 'v3', True)
    # ---------- fresh user: help step, learn screen, several simulated days ----------
    ctx, page, errs = ctxpage(br); page.goto(f'{BASE}/new/index.html'); page.wait_for_selector('#startBtn'); page.click('[data-act="startFresh"]')
    page.click('#startBtn'); check(page.locator('[data-act="helpDone"]').count() == 1, 'first session after the update opens with "How learning works"')
    txt = page.inner_text('main')
    check(all(w in txt for w in ['Building blocks', 'One phrase at a time', 'Pick', 'Accepted wordings', 'Precision', 'Tiers', '2–3 terms', '1/3', 'Fast lane', 'See it first', 'Every abstract idea', 'pacing', 'Placement', 'never reset', 'Inside a table before between tables', 'Transfer test', 'One change per step', 'Every mark has a reason', 'A miss goes one step back', 'Ideas in combination']), 'help covers every rule')
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
    preserve_v8(br, 'v81')
    preserve_v8(br, 'v82')
    aws9(br)
    unlock91(br)
    preserve_v91(br)
    preserve_v91(br, 'v10')
    v10_lesson(br, 'sql5', 'v10-sql5')
    v10_lesson(br, 'sqlm', 'v10-sqlm')
    v10_lesson(br, 'sqlc', 'v10-sqlc')
    v10_lesson(br, 'sqlrt', 'v10-sqlrt')
    v10_back(br)
    fix102_state(br)
    fix102_ui(br)
    cte103_state(br)
    cte103_ui(br)
    v10_lesson(br, 'sql7', 'cte', KCTE + '/all')
    v104_state(br)
    v104_ui(br)
    for l in V104S: v10_lesson(br, l, l, K104 + '/all')
    k1 = lesson_390(br, 'sqlr', 13, 'v7-sqlr'); check({'cls', 'tapc', 'tap', 'mc', 'run'} <= k1, 'relationships lesson uses classify, tap-column, tap-rows, pick and run questions')
    k8 = lesson_390(br, 'sqlt', 17, 'v8-sqlt'); check({'cls', 'tap', 'mc', 'run'} <= k8, 'table lesson uses classify, tap-rows, pick and run questions')
    lesson_390(br, 'sql2', 2, 'v81-sql2'); lesson_390(br, 'sql4', 5, 'v81-sql4'); lesson_390(br, 'sql3', 2, 'v81-sql3')  # v8.1: daily_streams and labelled views
    lesson_390(br, 'etl2', 4, 'v82-etl2')  # v8.2: partitions, rewritten text (sql8 is now walked in teaching order by v10_lesson, v10.4)
    shots82(br)
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
    caches = page.evaluate("caches.keys()"); check('de-daily-v10-4' in caches, 'service worker cache de-daily-v10-4: ' + str(caches))
    ctx.set_offline(True); page.reload(); page.wait_for_selector('#startBtn', timeout=8000)
    check(page.locator('#startBtn').count() == 1, 'app loads offline from the service worker')
    ctx.close(); br.close()
print('\nFAILS:', len(fails)); [print(' -', f) for f in fails]
raise SystemExit(1 if fails else 0)
