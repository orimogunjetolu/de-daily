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
3. Open `index.html` in a browser to test.
4. In `sw.js`, bump `CACHE = 'de-daily-v3'` to the next number (v4, ...) so installed phones update.
5. Commit and push. GitHub Pages republishes within about a minute.

## Saved progress (never break it)
- `localStorage['deLearn.v1']`: the original progress (XP, streak, fade levels, SM-2 flashcards, lessons). Its format is unchanged; new features never rewrite it.
- `localStorage['deLearn.ext']`: everything added in v3 (bite-size term ladders, placement result, pacing log). It is created on first load from what `deLearn.v1` already contains, and only ever adds.
- Backups (More → Export) include both.

## How terms are taught (v3)
- **Bite-size terms.** Long definitions (15+ words, or any term in `TERM_BITES`) are split into 3–4 pieces. Hand-written splits and "aspect" questions (scenarios, "which piece explains X") live in `TERM_BITES` near the top of `app.js`; other terms are split automatically by `autoPieces()`.
- Each piece goes **multiple choice → type it → known**. A new piece is introduced only when the earlier ones are past multiple choice. Once every piece is known, the term goes **2 pieces together → 3 pieces → whole definition**, then becomes an SM-2 flashcard.
- A step levels up only after a correct answer on **two different days**. A miss drops it back one step. Terms that were in progress before v3 are placed on the ladder according to their old level.
- **Automatic pacing.** The last 20 answers set today's pace: many misses means fewer new pieces and terms plus extra review of weak terms (with a note on the home screen); high accuracy means slightly more new material. There is always at least 1 new piece a day.
- **Placement test** (first launch, or More → Placement test): adaptive across 5 levels (SQL basics → joins/grouping → window functions/CTEs → ETL → Project 1), with real SQL checked by sql.js, predict-the-output and scenario questions. Includes "I don't know"; when results are shaky it places one level lower. It unlocks lessons up to that level and schedules their items as flashcards, so they still get reviewed. It never removes progress.
