// v8.1 + v8.2 content checks: node source/tests/t9_content.js
// Every SQL code card, problem solution and placement answer runs on the practice dataset; no query reads artists.genre;
// genre lives on songs with exactly one NULL; the sqlt "more than one?" teaching is present.
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, '..');
global.window = global; eval(fs.readFileSync(path.join(dir, 'vendor-sqljs.js'), 'utf8'));
global.SQL_WASM_B64 = fs.readFileSync(path.join(dir, 'vendor-sql-wasm-b64.js'), 'utf8').match(/['"]([A-Za-z0-9+/=]+)['"]/)[1];
global.initSqlJs = window.initSqlJs || initSqlJs;
const H = require('./h.js'); let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
(async () => {
  const R = await H(`(async () => { const out = { runs: [] };
    const SQL = await getSQL(); const db = new SQL.Database(); db.exec(DATASET_SQL);
    const run = (id, q, setup, dbk) => { const d = new SQL.Database(); try { d.exec(dbk && DATASETS[dbk] ? DATASETS[dbk].sql : DATASET_SQL); if (setup) d.exec(setup); const r = d.exec(q); const last = r.length ? r[r.length - 1] : null; out.runs.push([id, !!last && last.values.length > 0, last ? JSON.stringify(last.values.slice(0, 4)) : '[]', q]); } catch (e) { out.runs.push([id, false, 'ERR ' + e.message, q]); } d.close(); };
    const mod = CURRICULUM.modules.find(m => m.id === 'sql');
    mod.lessons.forEach(L => { (L.code || []).filter(c => c.lang === 'sql').forEach(c => run(c.id, plain(c.code))); (L.problems || []).filter(p => p.kind === 'sql').forEach(p => run(p.id, p.solution, p.setup, p.db)); });
    PLACE_BANK.filter(p => p.kind === 'sql').forEach(p => run(p.id, p.sol));
    out.songGenres = db.exec('SELECT genre, COUNT(*) FROM songs GROUP BY genre ORDER BY genre')[0].values;
    out.artistCols = db.exec("SELECT name FROM pragma_table_info('artists')")[0].values.map(v => v[0]).join(',');
    db.close();
    const all = JSON.stringify(LESSONS) + JSON.stringify(ILLUS) + JSON.stringify(PLACE_BANK) + JSON.stringify(TERMS4);
    out.badRefs = (all.match(/[^.]{0,80}genre[^.]{0,80}FROM artists[^.]{0,40}|FROM artists[^;]{0,60}WHERE genre[^;]{0,40}|artists\\.genre/g) || []);
    out.sqltBody = LESSONS.sqlt.theory.body.join(' ');
    out.multiScene = ILLUS.sqlt.scenes.some(s => (s.ins || []).some(x => x.t === 'artists_list') && (s.ins || []).some(x => x.t === 'artists_dup') && (s.after || []).some(x => x.t === 'songs'));
    out.multiFig = typeof ILL_FIGS.multi === 'function' && ILLUS.sqlt.scenes.some(s => s.fig === 'multi');
    out.transfer = ILLUS.sqlt.qs.filter(q => /categor|phone/i.test(q.q)).length;
    // v8.1: no stored songs table carries streams or an artist name; wide tables with artist names are labelled views
    out.badSongs = []; out.unlabelled = [];
    Object.entries(ILLUS).forEach(([lid, I]) => {
      Object.values(I.tables || {}).forEach(t => { if (t.n === 'songs' && t.c.some(c => /stream|artist$|^name$/.test(c))) out.badSongs.push(lid + ':' + t.c.join(',')); });
      (I.scenes || []).forEach((sc, i) => (sc.ins || []).forEach(x => { const t = x.tab || (I.tables || {})[x.t]; if (t && t.c.includes('artist') && t.c.includes('streams') && !/view|result/i.test(x.role || '')) out.unlabelled.push(lid + ' scene ' + (i + 1) + ': ' + t.n); }));
    });
    out.scSongs = SC_SONGS; out.scChart = SC_CHART;
    return out; })()`, {});
  const bad = R.runs.filter(r => !r[1]);
  bad.forEach(r => console.log('   ', r[0], r[2], '\n     ', r[3].replace(/\n/g, ' ')));
  ok(bad.length === 0, R.runs.length + ' SQL code cards, solutions and placement answers run and return rows (' + bad.length + ' failing)');
  ok(R.artistCols === 'artist_id,name', 'artists has no genre column (' + R.artistCols + ')');
  ok(R.songGenres.length >= 3 && R.songGenres.filter(g => g[0] === null).length === 1 && R.songGenres.find(g => g[0] === null)[1] === 1, 'songs.genre: one NULL, others labelled (' + JSON.stringify(R.songGenres) + ')');
  ok(R.badRefs.length === 0, 'no content reads genre from artists' + (R.badRefs.length ? ': ' + R.badRefs.join(' | ') : ''));
  ok(/more than one/i.test(R.sqltBody) && /first normal form/i.test(R.sqltBody) && /Afrobeats, R&B/.test(R.sqltBody), 'sqlt theory teaches the "more than one?" test and names 1NF once');
  ok(R.multiScene && R.multiFig, 'sqlt has the genre before/after picture (list cell vs duplicated rows vs songs.genre) and the any-data test figure');
  ok(R.transfer >= 2, 'sqlt has transfer questions on product categories and student phones (' + R.transfer + ')');
  ok(R.badSongs.length === 0, 'no pictured songs table holds streams or an artist name ' + R.badSongs.join(' | '));
  ok(R.unlabelled.length === 0, 'every pictured table with artist names and streams is labelled a view or a result ' + R.unlabelled.join(' | '));
  ok(!/<th>artist<\/th>/.test(R.scSongs) && /<th>chart_date<\/th>/.test(R.scSongs) && /view/.test(R.scChart), 'building-block table is daily_streams (chart_date, song_id, streams); the chart example is labelled a view');
  v82();
  console.log(fails ? fails + ' FAILS' : 'ALL OK'); process.exit(fails ? 1 : 0);
})();
// v8.2: strict but simple. Tier 1 is never false-for-simplicity; each stricter item is pictured and tested.
function v82() {
  const V = H(`(() => { const o = { titleTabs: [], items: {} };
    Object.entries(ILLUS).forEach(([l, I]) => (I.scenes || []).forEach((sc, i) => [...(sc.ins || []), ...(sc.after || [])].forEach(x => {
      const t = x.tab || (I.tables || {})[x.t];
      if (t && t.c.includes('title') && !t.c.some(c => /song_id|track_id/.test(c)) && !/view|result|raw|bad design/i.test(x.role || '')) o.titleTabs.push(l + '#' + i + ' ' + t.n); })));
    const sc = (l, f) => ILLUS[l].scenes.some(f), tab = (s, n) => [...(s.ins || []), ...(s.after || [])].some(x => (x.t || (x.tab && x.tab.n)) === n);
    const qs = (l, re) => ILLUS[l].qs.filter(q => re.test(q.q + ' ' + (q.o || []).join(' ')));
    o.items = {
      events: [sc('sqlr', s => tab(s, 'payments')), qs('sqlr', /twice|charged/).some(q => q.w), qs('sqlr', /Bank|Hospital/).length],
      pk: [sc('sqlt', s => tab(s, 'listeners') && /never be NULL/.test(s.say)), qs('sqlt', /primary key/i).some(q => q.w), qs("sqlt", /Hospital.*patient_id/).length],
      groupby: [sc('sql4', s => s.norun && /arbitrary/.test(s.say)) && sc('sql4', s => /functionally dependent/.test(s.say)), qs('sql4', /title|primary key/).some(q => q.w), qs('sql4', /Shop/).length],
      partition: [sc('etl2', s => /logical/.test(s.say)) && sc('etl2', s => /physically/.test(s.say)), qs('etl2', /partition/).some(q => q.w), qs('etl2', /Shop/).length],
      label: [sc('sqlr', s => /release_label/.test(s.say)), qs('sqlr', /Spaceship to Atlantic|current_label/).some(q => q.w), qs('sqlr', /Hospital/).length],
      alias: [sc('sqlt', s => tab(s, 'artist_aliases')), qs('sqlt', /Starboy/).some(q => q.w), qs('sqlt', /Èkó/).length],
      songid: [sc('sql8', s => tab(s, 'chart_named')), qs('sql8', /Love/).some(q => q.w), qs('sql8', /Shop/).length] };
    const t1 = Object.values(TERMS4).map(t => t.t1 && t.t1.def || '').join(' | ');
    o.t1false = (t1.match(/[^|]{0,60}(never chang|can never be changed|never edited)[^|]{0,40}/g) || []);
    o.evDef = (CURRICULUM.modules.flatMap(m => m.lessons).find(L => L.id === 'sqlr').terms || []).find(t => t.id === 'sqlr-t3');
    const txt = JSON.stringify(CURRICULUM) + JSON.stringify(LESSONS);
    o.mb = /1 MB a day|about 1 MB per day/.test(txt); o.kb = /10 to 100 KB/.test(txt); o.tries = /up to 3 times/.test(txt);
    o.bites = Object.keys(ITEMS).filter(id => isBite(id)).length;
    o.groupTitle = /GROUP BY s\.title;/.test(JSON.stringify(ILLUS));
    return o; })()`);
  ok(V.titleTabs.length === 0, 'every pictured table keyed by title (no song_id/track_id) is labelled a view, result, raw data or bad design ' + V.titleTabs.join(' | '));
  Object.entries(V.items).forEach(([k, [scene, mcw, transfer]]) => ok(scene && mcw && transfer >= 1, 'v8.2 ' + k + ': picture, mc with every wrong option explained, non-music transfer question (' + [scene, mcw, transfer] + ')'));
  ok(V.t1false.length === 0, 'no tier-1 definition says something "never changes" ' + V.t1false.join(' | '));
  ok(V.evDef && /normally not edited/.test(V.evDef.def), 'event definition: "normally not edited" (corrections, not edits)');
  ok(!V.mb && V.kb && V.tries, 'pipeline wording verified against the repo: 10 to 100 KB per DB copy (not 1 MB/day), "up to 3 times"');
  ok(V.bites === 96, 'the set of bite-style terms is unchanged (96): a new TERM_BITES entry or a definition growing past ' + 15 + ' words would add deLearn.ext records (' + V.bites + ')');
  ok(!V.groupTitle, 'no pictured query groups songs by title alone');
}
