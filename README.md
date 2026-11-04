# DE Daily: learn data engineering

Open `index.html` in any browser. It's one self-contained file and works offline, including on Android.
Progress is saved in the browser's localStorage. Use **More → Export progress** to back it up.

- `index.html`: the whole app, including inline sql.js (SQLite compiled to WebAssembly)
- `manifest.json`, `sw.js`, `icon-*.png`: optional PWA extras, which only take effect when the folder is served over http(s) (e.g. GitHub Pages)
- `build/`: sources (`src/`), `build.js` (rebuilds index.html), `validate.js` (runs every SQL item and solution), `test.js` (headless Chrome test)

To add content, edit `build/src/c*.js` (curriculum data), then run `cd build && node build.js`.

## v10: joins taught step by step, then in combination
- **Joins (J1–J12):** joins are now built one change at a time: follow one pointer by hand, then one row per many-side row, the SQL, a second pointer, fan-out, join order, a pointer to nothing, join then count, and CROSS JOIN. A wrong answer goes one step back to a fresh example.
- **New lessons:**
  - *Joins in combination* (four drills, each with a spot-the-mistake);
  - *Real task: the shop's best customers* (plan, build, check, then the same plan on the naija chart).
- **Every marked row explains itself:** each ✓ ◐ ✕ 2× ＋ mark has a one-line reason. The legend shows only the marks used, tables are open by default, and two tables stack on phones.
- **Progress is kept:**
  - saved data is backed up once to `*.v9bak`;
  - percentages can only go up (`deLearn.floor10`);
  - old answers are read through stable question IDs.
- The rules are in `source/LEARNING_RULES.md` §0g and in the app under More → How learning works.

## Master Project 1: Naija Chart Pipeline (new in v2)

A 10-lesson module that teaches your own repo, [naija-chart-pipeline](https://github.com/orimogunjetolu/naija-chart-pipeline), line by line. It covers architecture, `extract.py`, `transform.py`, `load.py`, the SQL models, the tests, the GitHub Actions workflow and `run_pipeline.py`. Then come hands-on tasks on a sample `chart_entries` table and a 10-question mock interview.

- Every code drill uses real lines from the repo. The build checks them against the source files.
- SQL runs in the app with SQLite. The repo uses DuckDB, so where the syntax differs (`CREATE OR REPLACE VIEW`), the app runs an equivalent and tells you.
- The sample chart's songs are real, but the positions are invented. They're set up so that every case shows: a new entry, a re-entry, droppers with a tie, and songs that drop out.
- The module appears in the daily flow once you've started ETL lessons 1–4. You can open it from the Roadmap at any time.
- Your progress carries over. The v1 save data is upgraded in place, with nothing lost.
- AWS Course 4 Module 1 has an optional "Unlock next lesson now" button after each finished lesson, to keep pace with Coursera deadlines. Spaced review is unchanged and progress is never reset.
