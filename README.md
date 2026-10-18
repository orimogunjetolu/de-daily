# DE Daily: learn data engineering

Open `index.html` in any browser. It's one self-contained file and works offline, including on Android.
Progress is saved in the browser's localStorage. Use **More → Export progress** to back it up.

- `index.html`: the whole app, including inline sql.js (SQLite compiled to WebAssembly)
- `manifest.json`, `sw.js`, `icon-*.png`: optional PWA extras, which only take effect when the folder is served over http(s) (e.g. GitHub Pages)
- `build/`: sources (`src/`), `build.js` (rebuilds index.html), `validate.js` (runs every SQL item and solution), `test.js` (headless Chrome test)

To add content, edit `build/src/c*.js` (curriculum data), then run `cd build && node build.js`.

## Master Project 1: Naija Chart Pipeline (new in v2)

A 10-lesson module that teaches your own repo, [naija-chart-pipeline](https://github.com/orimogunjetolu/naija-chart-pipeline), line by line. It covers architecture, `extract.py`, `transform.py`, `load.py`, the SQL models, the tests, the GitHub Actions workflow and `run_pipeline.py`. Then come hands-on tasks on a sample `chart_entries` table and a 10-question mock interview.

- Every code drill uses real lines from the repo. The build checks them against the source files.
- SQL runs in the app with SQLite. The repo uses DuckDB, so where the syntax differs (`CREATE OR REPLACE VIEW`), the app runs an equivalent and tells you.
- The sample chart's songs are real, but the positions are invented. They're set up so that every case shows: a new entry, a re-entry, droppers with a tie, and songs that drop out.
- The module appears in the daily flow once you've started ETL lessons 1–4. You can open it from the Roadmap at any time.
- Your progress carries over. The v1 save data is upgraded in place, with nothing lost.
