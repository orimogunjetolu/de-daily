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
4. In `sw.js`, bump `CACHE = 'de-daily-v6'` to the next number (v6, ...) so installed phones update.
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
- **Fast lane**: after 90%+ term accuracy on 4 study days in a row, up to 5 terms and 2 new a day. It turns off at once on a slip (a day under 90% or recent answers under 85%).
- **2–3 terms in parallel**; the session is about 1/3 terms (short block first, quick review last) and 2/3 code and problems, by item count. Pacing changes only new term material.
- State lives in `localStorage['deLearn.terms']`; v4 never rewrites `deLearn.v1` or `deLearn.ext`.
- **Placement test** (first launch, or More → Placement test): adaptive across 5 levels (SQL basics → joins/grouping → window functions/CTEs → ETL → Project 1), with real SQL checked by sql.js, predict-the-output and scenario questions. Includes "I don't know"; when results are shaky it places one level lower. It unlocks lessons up to that level and schedules their items as flashcards, so they still get reviewed. It never removes progress.

v6: shape-changing concepts (joins, GROUP BY, window functions, UNION, DISTINCT, WHERE vs HAVING, ORDER BY/LIMIT, CTEs, cleaning, dedupe, delete-then-insert) are taught picture first: before/after tables, then visual questions, then theory and terms. See `LEARNING_RULES.md` §0. Tests: `node source/tests/t6_illus.js`.

v7: a new lesson before JOINs, *Entities, events & relationships* (why data is split, entity / state / event / relationship, PK/FK arrows, relationship kinds, ERD), plus *Many-to-many: two joins* after JOINs. The dataset gains listeners, streams, playlists and playlist_songs. Standing rule: every abstract concept in every module is taught visually from several angles (`LEARNING_RULES.md` §0a). Tests: `node source/tests/t7_relations.js`.

v8: a new lesson before *Entities, events & relationships*, *What's inside a table* (`sqlt`): table anatomy (name, column, row, cell, data type, PK, FK, schema), the grain, how to decide which table a column belongs in (wide table vs split tables), blueprint cards for all seven practice tables, and why the ID sits on the many side. Its assessment tests transfer: most questions use shop, hospital, school and bank tables, and every wrong answer is explained. New terms: Cell, Data type, Redundancy. Rules: `LEARNING_RULES.md` §0b. Tests: `node source/tests/t8_tables.js`.

v8.1: `genre` moved from artists to songs (an artist can have several genres; a cell holds one value). Each song has one main genre; waf has a NULL genre. *What's inside a table* now teaches the "more than one value for one thing? then it can't be one column" test with a before/after picture (a list cell "Afrobeats, R&B", duplicated artist rows, genre on songs), transfer questions on product categories and student phones, and names first normal form once. A content correctness audit fixed several errors (see `LEARNING_RULES.md` §0c). Tests: `node source/tests/t9_content.js`.
