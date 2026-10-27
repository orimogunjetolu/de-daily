# DE Daily: editable source

`index.html` in the repo root is built from the files in this folder.

| File | What it is |
|---|---|
| `app.js` | All app logic **and the curriculum** (lessons, fade items, problems). Curriculum data is at the top. |
| `template.html` | The page layout and styles. |
| `vendor-sqljs.js`, `vendor-sql-wasm-b64.js` | sql.js 1.13 (MIT), the offline SQLite engine. Don't edit. |
| `build.py` | Rebuilds `index.html` from these files. |

## To change the app
1. Edit `source/app.js` (e.g. add a module to the curriculum; markup rules are explained at the top of the file).
2. From the repo root run `python source/build.py`.
3. Open `index.html` in a browser to test, and run the tests in `source/tests/` (see LEARNING_RULES.md §9).
4. In `sw.js`, bump `CACHE = 'de-daily-v4'` to the next number (v5, ...) so installed phones update.
5. Commit and push. GitHub Pages republishes within about a minute.

## Saved progress (never break it)
- `localStorage['deLearn.v1']`: the original progress (XP, streak, fade levels, SM-2 flashcards, lessons). Its format is unchanged; new features never rewrite it.
- `localStorage['deLearn.ext']`: everything added in v3 (bite-size term ladders, placement result, pacing log). It is created on first load from what `deLearn.v1` already contains, and only ever adds.
- `localStorage['deLearn.terms']`: v4 terminology state (building blocks, phrase steps, tiers). See LEARNING_RULES.md.
- Backups (More → Export) include all three.

## How terms are taught (v4)
Full rules, thresholds, state keys, migration and the authoring guide: **[LEARNING_RULES.md](LEARNING_RULES.md)**. In short:
- **Building blocks first** (row, column, result rows, expression, condition…): learned once on a real mini table, query and output, grounded after correct answers on 2 days.
- **One phrase at a time**, each mastered by **PICK → TYPE → SPOT** on different days; a miss drops one step. Up to 3 accepted wordings; precision words (each/one, by/on, one or more…) must be exact.
- **Tiers**: beginner → intermediate → advanced, the next unlocking 7 days after mastery.
- **2–3 terms in parallel**; the session is about 1/3 terms (short block first, quick review last) and 2/3 code and problems, by item count. Pacing changes only new term material.
- State lives in `localStorage['deLearn.terms']`; v4 never rewrites `deLearn.v1` or `deLearn.ext`.
- **Placement test** (first launch, or More → Placement test): adaptive across 5 levels (SQL basics → joins/grouping → window functions/CTEs → ETL → Project 1), with real SQL checked by sql.js, predict-the-output and scenario questions. Includes "I don't know"; when results are shaky it places one level lower. It unlocks lessons up to that level and schedules their items as flashcards, so they still get reviewed. It never removes progress.
