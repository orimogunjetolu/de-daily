"""Browser tests for DE Daily (needs playwright + Chrome).
Run from the repo root after `python3 source/build.py`:
    python3 source/tests/browser_test.py
It builds a scratch web root in source/tests/.www with
  v2/  = index.html of commit 08c6b1a (before v3: only deLearn.v1)
  v3/  = index.html of commit 371b94a (v3: deLearn.v1 + deLearn.ext)
  new/ = the current build (index.html, sw.js, manifest, icons)
and checks that saved progress from both old versions survives the update untouched."""
import json, os, shutil, subprocess, threading, http.server, functools, datetime
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..')); WWW = os.path.join(HERE, '.www')
shutil.rmtree(WWW, ignore_errors=True)
for name, rev in [('v2', '08c6b1a'), ('v3', '371b94a')]:
    os.makedirs(os.path.join(WWW, name)); open(os.path.join(WWW, name, 'index.html'), 'wb').write(subprocess.check_output(['git', 'show', rev + ':index.html'], cwd=REPO))
os.makedirs(os.path.join(WWW, 'new'))
for f in ['index.html', 'sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png']: shutil.copy(os.path.join(REPO, f), os.path.join(WWW, 'new', f))
PORT = 8766
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=WWW)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'; SHOTS = os.environ.get('SHOTS')
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
        for a in ['helpDone', 'biteIntro', 'theoryDone', 'showCard', 'next', 'probDone']:
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
    check(get(page, 'deLearn.v1') == v1, f'[{label}] deLearn.v1 byte-identical after loading v4')
    if ext is not None: check(get(page, 'deLearn.ext') == ext, f'[{label}] deLearn.ext byte-identical after loading v4')
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
    check(all(w in txt for w in ['Building blocks', 'One phrase at a time', 'Pick', 'Accepted wordings', 'Precision', 'Tiers', '2–3 terms', '1/3', 'pacing', 'Placement', 'never reset']), 'help covers every rule')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v4-help.png', full_page=True)
    n, seen = drive(page); check(n > 0 and 'term:ground:None' in seen, f'fresh session completes with grounding ({n} steps; {sorted(seen)})')
    page.click('main.summary [data-to="home"]'); page.click('#startBtn')
    check(page.locator('[data-act="helpDone"]').count() == 0, 'help step shown only once'); page.click('[data-act="quit"]') if False else None
    page.evaluate("SESSION = null; go('home')")
    page.click('nav [data-to="settings"]'); page.click('[data-act="go"][data-to="learn"]')
    check('How learning works' in page.inner_text('header') and 'Pick → ⌨️ Type' in page.inner_text('main'), 'More → How learning works screen')
    if SHOTS: page.screenshot(path=f'{SHOTS}/v4-learn.png', full_page=True)
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
    check(not errs, 'no JS errors (fresh user): ' + '; '.join(errs[:5]))
    ctx.close()
    # ---------- PWA offline ----------
    ctx = br.new_context(); page = ctx.new_page(); page.goto(BASE + '/new/'); page.wait_for_selector('#startBtn')
    page.evaluate("navigator.serviceWorker.ready.then(() => true)"); page.wait_for_timeout(1500)
    caches = page.evaluate("caches.keys()"); check('de-daily-v4' in caches, 'service worker cache de-daily-v4: ' + str(caches))
    ctx.set_offline(True); page.reload(); page.wait_for_selector('#startBtn', timeout=8000)
    check(page.locator('#startBtn').count() == 1, 'app loads offline from the service worker')
    ctx.close(); br.close()
print('\nFAILS:', len(fails)); [print(' -', f) for f in fails]
raise SystemExit(1 if fails else 0)
