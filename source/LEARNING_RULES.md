# DE Daily: learning rules (v10.4)

This file is the reference for how terminology is taught and scheduled. The code is in `app.js`: data in the **v4 TERMINOLOGY DATA** block (after `PLACE_BANK`), logic in the **v4 TERM ENGINE** block (before `ACTIONS`). The in-app summary is More → **How learning works** (`learnHowHTML()`). It is also shown once, as the first step of the first session after the update.

## 0. See it first: illustrate shape-changing concepts (v6)

**Rule:** any concept that changes the *shape* of data (which rows, how many, which columns) is taught **picture first**:
1. **Illustration** (`illus` steps): small input tables → the query → a diagram → the result table.
2. **Visual questions** (`vq` steps), grounded in those same tables: tap the rows that survive, predict the row count, explain why a NULL appears, name the LEFT/RIGHT table, run the query yourself.
3. Only then **theory**, then **building blocks** and **definition phrases** (sections 1–6, unchanged).

Illustrated lessons: sql2 (WHERE and NULL), sql3 (ORDER BY + LIMIT, DISTINCT), sql4 (GROUP BY, WHERE vs HAVING), sql5 (joins), sql6 (subquery filter), sql7 (CTEs, UNION ALL vs UNION), sql8 (window functions: PARTITION BY + LAG and ROW_NUMBER keep every row), sql9 (cleaning with CASE/COALESCE/CAST), etl1 (raw → staging), etl2 (plain INSERT retry duplicates vs delete-then-insert), etl4 (zero-row quality check, dedupe), pj3 (flattening nested JSON), pj4 (primary key refusing a duplicate, delete-then-insert), pj5 (model that keeps rows vs one that collapses them). sql1 has no illustration, so a new learner's first lesson is the same as before. The building block **condition** also shows a before/after picture.

**Joins (sql5)** use one tiny data set throughout: artists (1 Burna Boy, 2 Tems, 3 Asake) and songs (10 Last Last→1, 11 Free Mind→2, 12 Mystery Song→9). The six pictures are: which table is LEFT, then INNER, LEFT, RIGHT, FULL OUTER, and the swap. **LEFT/RIGHT is only about written order**: the table after `FROM` is LEFT and the table after `JOIN` is RIGHT. Swapping them swaps the roles, so any RIGHT JOIN can be written as a LEFT JOIN with the tables swapped. The sql.js bundled in the app is **SQLite 3.49.1**, so RIGHT and FULL OUTER JOIN really run in the app (SQLite has supported them since 3.39). The lesson notes the MySQL workaround (LEFT JOIN UNION RIGHT JOIN).

**What the pictures show:** the input tables side by side in written order, with a role label (e.g. "⬅ LEFT (FROM)"). Each row is marked with a colour and a symbol, so colour is never the only signal:

| Mark | Symbol | Meaning |
|---|---|---|
| m | ✓ | kept / matched |
| u | ◐ | kept with no match (NULLs fill the other side) |
| x | ✕ | dropped (struck through) |
| d | ⧉ | duplicate |
| n | ＋ | new or changed |
| g0–g3 | (colour) | same group |

NULL cells are shown as a dashed red **NULL** badge. Leading and trailing spaces are shown as ␣. A column the query adds is outlined. Joins also get a Venn diagram, and other concepts get a row-flow figure ("N rows in → M rows out"). The legend lists only the marks that are present. Every picture with a query has **▶ Run this query**, which runs it on real SQLite with exactly those tables.

**Scheduling:**
- **Lesson session** (Roadmap → lesson): pictures → visual questions → theory → code items → terms → problems.
- **Daily session:** when the next lesson is new and illustrated, its pictures and questions come just before its theory. They are *not* counted as "other practice", so they don't enlarge the term budget.
- A lesson's terms only start **after** its pictures were seen (`newTermQueue` checks `visSeen`). In practice this means from the next day.
- **Existing learners** (theory read before v6): at most **one** unseen lesson's pictures are added a day, before the term block. Lessons with terms already in progress come first, then curriculum order. No catch-up on a day a new lesson's pictures are shown. Terms already in progress continue untouched; only *not yet started* terms of an un-illustrated lesson wait.
- A missed visual question comes back once at the end of the session. XP: +5 per correct visual question, +5 the first time a lesson's pictures are finished.

**State (additive):** `deLearn.terms.vis[lessonId] = {seen: day|null, q: {[i]: {n, ok: day, miss: day}}}`. Nothing else is written; v1 and ext are untouched.

### Authoring an illustration
Data lives in `ILLUS` in `app.js` (block "v6 ILLUSTRATIONS", just before `GROUND`). The format is documented in its header comment.
- Keep tables to **2–5 rows and 2–3 columns** so two fit side by side at 390px. Use the same tables for every scene and question in a lesson.
- Include at least one row that is *not* kept (no match, a NULL, a duplicate), because the contrast is the lesson.
- A scene is `{h, say, ins: [{t, m, role}], sql, fig, vl, out: {c, r, m, nc} | {err}, lg, note, norun, ordered}`. `out` must be exactly what SQLite returns: `t6_illus.js` runs every scene and fails if the drawing and the real result differ (unordered unless `ordered`; `err` must be contained in the error message).
- For scenes with no SQL (e.g. raw JSON in pj3), use `ins: [{raw, role}]` and `code` instead of `sql`.
- Questions: `{k:'mc', q, o:[correct first, …], why}` (options are shuffled), `{k:'tap', t, ans:[row idx], why}`, `{k:'run', code: '… ____ …', sol, forbid?, why}`. `run` is checked by comparing the result with `sol` on the lesson's tables. `forbid` is a regex that marks a correct-looking answer wrong when it uses a banned keyword (e.g. "without RIGHT JOIN").
- Order scenes from the simplest to the most surprising, and put the definition words in `say` only *after* the picture shows the behaviour.

## 0a. STANDING RULE (v7): every abstract concept is taught visually, from several angles

This applies to **every module**, not only SQL: data modelling, pipelines, orchestration, cloud, streaming, testing, and anything added later. A beginner cannot learn an abstract idea from a definition alone. Before any definition phrase, show the idea as pictures from **at least two angles**, for example:

- the data itself (before/after tables, with marked rows);
- a diagram of the structure (an ERD, a DAG, an architecture box-and-arrow diagram);
- change over time (a timeline of events, a value being overwritten, a schedule);
- a counter-example: what goes wrong without the idea (the messy single table, a duplicated load, a missed dependency).

Then ask visual questions on the same pictures (tap, classify, pick, run), and only then teach the theory and terms. A lesson that introduces an abstract concept without an `ILLUS[lessonId]` entry is incomplete. Figures available in the engine: before/after tables (`ins`/`out`/`after`), Venn, LEFT/RIGHT, row flow, `erd` (boxes + FK→PK lines with crow's feet), `bip` (who links to whom; dashed = created by an event), `ent`, `state`, `events`, `kinds`. Add a new figure function to `ILL_FIGS` when a module needs one (for example a DAG for orchestration).

Question kinds: `mc`, `tap` (rows), `tapc` (tap a column header, `ans: [colIdx]`), `cls` (sort items into categories, `cats`, `items: [[html, catIdx]]`), `run` (fill the ____ and run).

**v7 lessons.** *Entities, events & relationships* (`sqlr`, before JOINs) covers why data is split (the update and typo problems), entity / state / event / relationship (what exists on its own, and what exists only because an event happened), primary and foreign keys as arrows, one-to-many, one-to-one and many-to-many, a small ERD, and which tables can and cannot be joined. JOINs now open with "a join follows the arrow". *Many-to-many: two joins* (`sqlm`, after JOINs) covers linking tables and two-join queries. Primary key and foreign key reuse the existing sql1 terms, so they are not duplicated. New building block: `entity`.

**Adding lessons for existing learners.** Mark a lesson inserted into an existing module with `added: <version>`. `gapLesson()` offers a not-started lesson that sits before one the learner has already started or tested out of first, one a day in the normal new-lesson slot. It is never locked, its pictures come first, and its terms wait for the pictures. Fresh learners meet it in curriculum order. `moduleProgress` never shows less than the average over the original lessons, so an added lesson cannot pull a module's percentage down. Placement only marks lessons as placed when a test is taken, so new placement items do not change anyone's stored placement. (v8: the floor is kept for every release. For each `added` version v, the average over the lessons that existed before v is a floor, so a v7 learner who started the v7 lessons never sees the module % drop when v8 adds a lesson.)

## 0b. STANDING RULES (v8): inside a table before between tables; assess by transfer

**Table anatomy comes before relationships.** A learner must be able to picture what is *inside* one table before learning how tables connect. Lesson `sqlt` *What's inside a table* (added in v8, between *Grain* `sql4` and *Entities, events & relationships* `sqlr`) teaches, in pictures first:
- the parts of a table on the real `songs` table, with numbered pins: table name, column, row (record), cell, data type, primary key, foreign key; then the same table as its `CREATE TABLE` blueprint (the schema), and a real `pragma_table_info` query;
- the grain: one row = one what (proved with a GROUP BY that returns one row per chart day);
- how to decide where a column goes: ask *what does this fact describe?* and *does it exist only because something happened?* A before/after shows one wide chart table (artist name and genre copied on every row = redundancy) split into `artists`, `songs` and `chart_entries`; a counter-example shows what happens when an event fact (position) is put on an entity (it gets overwritten and the history is lost);
- where the ID goes: the foreign key sits on the **many** side (a song has one artist → `songs.artist_id`, never a list of song IDs in `artists`), and an event table carries the IDs of everything involved (`streams.song_id`, `streams.listener_id`);
- a blueprint card for every practice table (`artists`, `songs`, `listeners`, `playlists`, `chart_entries`, `streams`, `playlist_songs`): entity / event / link, the grain, every column with its type, PK/FK tag and the reason it lives there, and a real sample row. `t8_tables.js` fails if a blueprint's columns differ from the dataset.

New terms (with tiers, near-miss distractors and building blocks): **Cell**, **Data type**, **Redundancy**. Table, Primary key, Foreign key, Schema and Grain are reused, not duplicated.

**Assess by transfer.** Understanding is shown by applying the idea to data the learner has not seen. A lesson's visual questions must include tables from other domains, not only the music practice data. `sqlt` has 16 questions; 13 are outside music: a shop (customers, products, orders, order_items, carts), a hospital (patients, doctors, appointments), a school (students, courses, enrolments) and a bank (accounts, transactions). Question types: which table does this column belong in; entity / state / event; which table holds the linking ID; spot the badly designed table (repeated columns, a list in one cell, copied details); and what one row stands for. Every wrong answer is explained:
- `mc` questions can carry `w: [null, why option 1 is wrong, …]` (aligned with `o`; index 0 is the correct option). After answering, the learner sees *Why the other answers are wrong*, with their own pick first and highlighted.
- `cls` items can carry a third element, `[html, catIdx, why]`. After checking, each item shows its correct box (if it was sorted wrongly) and why.
- `show: html` draws a table into the question itself (for "spot the problem"); `ref: false` hides the lesson's *Show the tables* block when the question is about other data.

New figures in `ILL_FIGS`: `anat` (numbered table anatomy), `ddl` (CREATE TABLE with PK/FK tags), `place` (column → what it describes → table), `bp` (blueprint cards), `ask` (the three questions to ask, with a shop ERD). `state` takes `fp.thing` and `fp.lost` labels.

## 0c. STANDING RULE (v8.1): content correctness review before shipping
The learner is new to most of this material and cannot catch our mistakes, so every lesson must be right before it ships.
1. **Modelling sanity test for every column.** Ask: *can this fact have more than one value for one thing?* If yes (an artist's genres, a product's categories, a student's phone numbers), it cannot be one column on that thing's table. Put it on the thing it really describes (genre on songs) or in its own table with one row per value (`song_genres(song_id, genre)`). Never show a list in a cell or a duplicated entity row as correct design. The rule is called first normal form (1NF); name it, but teach the test. The same care applies to every pictured table, even a 3-row teaching example: a count that changes every day (streams) never sits on an entity table such as songs; it goes in a daily/event table (`daily_streams`, `chart_entries`). A table that shows the artist name next to song facts must be labelled a view or a query result (or the deliberate wide-table bad example).
2. **Verify every claim against the data.** Every number, name, ranking or "X has no Y" in a theory text, explanation or picture must be checked against the real dataset (`DATASET_SQL`, `PROJECT_SQL`). Every SQL card, solution and placement answer must run in sql.js (`t9_content.js`).
3. **Engine differences.** When a rule depends on the engine (integer division, NULL sort order, LIKE case, type enforcement, GROUP BY strictness), say which engines behave which way, especially SQLite (this app) and DuckDB (the learner's pipeline).
4. **No useful lies; label made-up examples.** Never simplify a statement into something false (see §0d): say "events are normally not edited; mistakes get a correction", not "events never change". A made-up example (such as a label change) must say it is made up. Do not present a teaching example as a real-world fact.
5. **Consistency across lessons.** The same fact must be classified the same way everywhere (e.g. a chart position is an event fact, not state).
6. **Audit, then list.** Before a release, read all content. Fix clear errors. List debatable points for the owner instead of changing them silently.
7. **Never break progress.** Content fixes keep every lesson, item and term id; deLearn.v1/.ext/.terms stay byte-identical on update. A curriculum definition of 15 or more words, or a new `TERM_BITES` entry, turns a term into a bite item, and `migrateExt()` then writes a new `deLearn.ext.bites` record on load. When you reword a definition, keep it on the same side of 15 words (v8.2: found by `browser_test.py`; `t9_content.js` now guards the bite count).

## 0d. STANDING RULES (v8.2): strict but simple
The owner approved these wordings. Apply them to every new or changed lesson, picture, question and term.
1. **"Strict but simple: tier 1 must be correct, never false-for-simplicity; nuance goes in deeper tiers."** Teach the standard version from the first exposure. A tier-1 definition may leave detail out, but it must never say something false (no "never changes", no "a primary key cannot be NULL in SQLite" without the quirk, no "GROUP BY needs every column" as a law). Engine quirks (SQLite accepting NULL in a primary key, lenient GROUP BY) go in a footnote or a deeper tier. Example models are normalized and keyed by an ID (`song_id`, `artist_id`) unless the table is labelled a deliberately bad design, a view, a query result or raw source data. Titles and names are attributes, not keys.
2. **"Make it easy with illustrations, never with inaccurate simplification."** When a stricter statement is harder to read, add a picture (a before/after table, a correction row, a partition diagram) instead of making the sentence less true. Each stricter idea gets its own picture.
3. **"Show it (picture), then test it (choose between alternatives) for every idea."** After each picture comes at least one multiple-choice question whose distractors are near misses, including the old simplified version. Every wrong option is explained (`w`). At least one question per idea uses non-music data (shop, hospital, bank, school, cities) to test transfer.
4. **"Text must be coherent: connected sentences that walk through the picture."** Each say/caption/note and theory paragraph reads in order: what you see, what it shows, why it matters, and the link to the next step. Name the tables, rows and columns you mean. Define a term before using it. No fragments, and no arrows (→) used as prose; arrows are fine inside diagrams, schema lists and ordered-step notation. Rewriting for coherence never changes meaning or IDs.

`node source/tests/t9_content.js` checks parts of these rules automatically (title-keyed tables are labelled, each v8.2 item has a picture, an explained mc and a transfer question, no tier-1 "never changes").

## 0e. STANDING RULES (v9.0): the AWS track and memory hooks

**A separate track.** "AWS for Data Engineering" follows the Coursera specialization *AWS Certified Data Engineer Associate Exam Prep* (LearnKartS) lesson by lesson, in Coursera's order and vocabulary. Coursera is the baseline; where a lesson is wrong or vague we keep its words and add a "Coursera says / Precisely" note checked against AWS documentation. All text is our own words. AWS lessons, items and problems carry `track: 'aws'` and never appear in the SQL daily session, READY, CURRICULUM, module % or the Roadmap progress; the AWS session is started from the AWS screen. New-term counts for AWS go to `T.dayAws`.

**Memory hooks reinforce spaced repetition; they never replace or reduce it.**
- Every AWS term has a hook (`AWS_HOOKS[id] = { k, t, j }`). Vary the kind: `origin` (a documented name origin, fact only, with its source), `image`, `split`, `contrast`. Anything that is not a documented fact is labelled "Memory aid".
- The hook card is shown at the first meeting of a term (tier 1, phrase 1), **before** the definition, and again as a hint after a miss. "Use my own hook" saves the learner's own hook next to ours.
- Every AWS term still gets its normal path: building blocks, phrases with pick → type → spot on different days, tiers, flashcards and SM-2 reviews in `deLearn.terms`, exactly like the SQL terms.
- The **name-recall drill** (step `nr`: show the job, pick the name, later type it) is an extra step. It keeps its own interval in `deLearn.aws.nr` (pick right: 1 day; first typed right: 2 days; later typed right: ×2, or ×3 under 8 seconds, max 60; a miss: back to 1 day, hook shown). It never writes term state, never logs to `T.log` and never feeds the fast lane, so fast recall cannot skip any flashcard or review step. The term engine's own fast-lane rules (§5) are unchanged.

**Console click-throughs** (step `ct`, `AWS_CT`) are drawn screens labelled "Practice drawing, not a real AWS screenshot". Each opens after the theory of its lesson is read; every wrong choice is explained; the Coursera demo's slips are corrected in place (e.g. 10.0.0.1.0/24, us-east-1a in a us-west-1 VPC, `s3:*` shown as the "before").

**Storage.** One new key, `deLearn.aws` = `{ v: 1, hooks, nr, ct }`, created only when the learner uses a hook, drill or click-through. `deLearn.v1/.ext/.terms` stay byte-identical on load. AWS term definitions stay under 15 words (no new bite records).


## 0f. STANDING RULE (v9.1): faster unlock, AWS Course 4 Module 1 only

To keep pace with Coursera deadlines, a finished C4M1 lesson (theory read and every code/Q&A item started) shows an opt-in button, **Unlock next lesson now**, on the session summary and the lesson page. It is off unless tapped, appears only for `AWS_C4M1` (aws0–aws14), and opens only the next C4M1 lesson. Next to it the learner reads: "Your spaced review still runs on its normal schedule, and this button only exists so you can keep pace with your Coursera deadlines." The tap writes only `deLearn.aws.unl[lessonId] = date` (inside the existing key; created on first use). It never moves an SM-2 flashcard, item, term, tier or name-drill date and never touches the fast lane, the SQL session or lessons, streak, XP or percentages. Tests: `node source/tests/t11_unlock.js`; `browser_test.py` `unlock91` (from a v9.0 7f59624 saved state).

## 0g. STANDING RULES (v10): the teaching sequence (rules 1–14)
These apply to every new or rewritten picture lesson. The v10 plan calls this section "§0c"; it is numbered 0g here because 0c already holds the v8.1 correctness rule.
1. **One change per step.** Each scene changes exactly one thing (one table, one clause, one row) from the step before.
2. **Check thinking before naming a rule.** The learner shows the idea with a question first; the rule's name comes after.
3. **By hand before predicting.** Tap or count the rows yourself before predicting a query's output.
4. **A miss goes one step back.** A wrong answer on a question with `back` inserts that simpler question on a fresh example next, then the same question again.
5. **Question → fact → result.** Every scene's text reads in this order. A scene with a question (`ask`) shows it above the tables. When rows are marked against a query, the query is drawn before the marked table.
6. **Link to the last conclusion.** Each step opens with `link`: one sentence restating what the previous step showed.
7. **Never make learners guess.** Everything needed to answer is on screen. A closed toggle counts as not visible, so tables are open by default.
8. **Every mark has a reason.** Every ✓ ◐ ✕ 2× ＋ row carries a specific one-line reason (`why`, or the `ILL_WHY` overlay). t6 fails when any reason is missing. The legend lists only the marks that are used, and duplicates are shown as "2×".
9. **Full sentences.** Prompts, reasons and feedback are full sentences, with no shorthand.
10. **Technically correct.** Every scene's SQL runs in sql.js and matches its drawing, including drawn errors (the `err` text must match).
11. **Before/after tables for every change in data shape.**
12. **Phone first.** Two tables side by side stack below 480px. Nothing may overflow at 390px.
13. **Rungs.** Rung 1 covers single ideas. Rung 2 (`sqlc`) has combination drills, each with a spot-the-mistake. Rung 3 (`sqlrt`) is one real task: plan it (grain, tables, filter, test), build it in pieces, check it, then use the same plan on new data. Rung questions marked `rv` get light spaced reviews (1, then ×2.3 per right answer, capped at 60 days; a miss resets to 1). Rung 2 opens after the v10 joins and many-to-many steps are seen. Rung 3 opens after rung 2.
14. **Cold-read clarity pass before shipping.** Read every new screen as a newcomer would, at phone width, and list what you fixed in the release notes.

**Stable IDs and progress (v10).** New questions carry `id`. Legacy questions keep `lid.position` (arrays are append-only, and the teaching order lives in `L.order`). Answers are written to `vis[lid].qid[id]`. `vis[lid].q` (by position) is never rewritten. The one-time `visMigrate` copies it into `qid`. On first load, v10 also does the following, using new keys only:
- it copies `deLearn.v1/.ext/.terms/.aws` to `<key>.v9bak` once;
- it writes each lesson and module % to `deLearn.floor10`, and no later % can fall below it.

Learners who already saw a lesson get only its new steps as catch-up, labelled "🆕 New in v10".

## 0h. STANDING RULE (v10.2): mark SQL by its result, not its spelling
A correct query must never be marked wrong because it is written differently from the model.
- **Code cards, Level 3** (type whole lines): the typed lines are first compared with the model text as before. When that fails, they are put back into the card and the whole query is run on the card's own data (`gradeSqlExec`). It is right when it returns the same rows and values as the model query. Column names, aliases, column order, case, spaces and the final `;` do not matter. Row order matters only when the model query ends with its own `ORDER BY`. A label column may be swapped for the matching ID or name of the same table (`song_id` for `title`, or both), only where the model shows that column, and only when the swap is one-to-one in the data.
- **The card's keywords must stay.** Every `[[keyword]]` on the blanked lines must still be in the answer, so a query that matches only by luck on the small data set (for example `COUNT(*)` where nobody repeats) is not accepted. `AS` before an alias is optional SQL and is the one keyword whose absence never changes a result.
- **Not run:** cards with `run: false`, DuckDB-only cards (`runSql`), non-SQL cards and models that return no rows keep the text check only.
- **Level 4** also runs the query and shows the result next to the model's before the self-grade.
- **Feedback.** Right but different: the two result tables, why it counts (for an ID label: grouping by the ID is safer, because two songs can share a title), the model answer as another correct way, and the card's `alt` (safest version) if it has one. Wrong: the two result tables and what is actually wrong in plain words (a syntax error with SQLite's message, a missing GROUP BY, counting rows instead of different values via the card's `hint.nodistinct`, a wrong row or column count, a wrong order).
- **Problems, placement and run questions** were already checked by result (`compareResults`); v10.2 also accepts the same columns in a different order there. They do not swap labels, because their tasks name the columns.
- **Repair:** `fix102()` runs once (flag `deLearn.fix102`) and only raises the record of `sqlm-c3` that the old check dropped: a miss at Level 2 seen on or after 2026-10-29 becomes Level 4 (what a correct Level 3 answer gives), counted right, due the next day; a Level 3 record whose retry already passed becomes Level 4. Nothing else is written, and the stored typed answer does not exist, so it cannot be re-checked. Tests: `node source/tests/t14_v102.js`; `browser_test.py` `fix102_state` and `fix102_ui` (`ONLY=fix102`).

## 0i. STANDING RULES (v10.3): CTEs and derived tables, by hand first
*CTEs (WITH)* (`sql7`) opens with Steps 1–8, all on the same six rows of `streams`: (1,14) (2,14) (3,14) (4,22) (5,31) (6,31). `listener_id` is shown only in Step 2's two-column example and Step 8's real task (tset `l`); everywhere else the drawn table is `streams(stream_id, song_id)` with a label saying listener_id is left out (tset `p`). Song IDs 22 and 31 are practice values; the steps never show song titles. The shop transfer table is `orders(order_id, customer_id)` (tset `shop`). No table outside the app is used; `song_counts`, `avg_count` and `listener_songs` are always step results, never stored tables.
1. **Piles by hand** (sort the rows by song; 14→3, 22→1, 31→2), then GROUP BY is named: “put rows with the same value into one pile; the column after GROUP BY is what you pile by”. COUNT(*) counts each pile.
2. **Two-column trap by hand**: piles only when stream_id and song_id both match give 6 piles of 1. Rule: GROUP BY whatever one row of your answer means. Valid use: `GROUP BY listener_id, song_id`.
3. **Aggregate**: a function that squashes many rows into one number (COUNT, SUM, AVG, MAX, MIN); 6 stream rows → 3 counts → 1 average (2).
4. **Two steps as a CTE**: the highest count by hand (3) before the query; one change: MIN gives 1.
5. **The same steps as a derived table**: why the alias is needed (the bracketed table exists nowhere else; MySQL refuses it without one, as did Postgres before 16), and a side-by-side table of the two forms.
6. **Three steps**: average 2 by hand, song 14 above it (2 is not bigger than 2), `FROM song_counts, avg_count` as a pairing of every song with the one average row; one change `<` gives song 22; the derived version needs step 1 twice, so a CTE wins once there are 3+ steps or a step is reused.
7. **Spot the mistake** with the real SQLite errors: WHERE runs before the piles exist (HAVING tests piles), and one aggregate cannot sit inside another in one pass. Guiding question: “Am I aggregating something already aggregated? Then add a step.”
8. **Real task, planned first** (streams (1,7,14) (2,7,14) (3,7,14) (4,8,22) (5,8,31) (6,8,31), table always shown before any question): tap listener 7’s streams; each listener’s pile shown as its own table; count different songs by hand (1 and 2); (a) “one row of streams = one play; what does one row of step 1’s RESULT stand for?” → one listener; (c) COUNT(*) (3, 3, avg 3) next to COUNT(DISTINCT song_id) (1, 2, avg 1.5), DISTINCT defined as “count each song once”, step 2 divides by the number of listeners; (d) no step 3: reread the question and stop once it is answered; then the learner writes the query with the plan on screen (`planShow`) and a check screen (1.5). The note says listeners with no streams are left out and how to include them. (e) Change one row at a time, full table each time (tsets `l7`, `l8`): + (7,8,14) → COUNT(*) 3, 4 avg 3.5, DISTINCT 1, 3 avg 2; + (8,7,14) → COUNT(*) avg 4, DISTINCT stays 2; summary table: COUNT(*) rises on every play including repeats, DISTINCT only on a song new to that listener. Step 2’s valid two-column example uses the same listener 7/8 rows.

**Engine (v10.3).** New steps carry `v103` (and `tf`, tables first). `relKey(lid)` picks the release whose new steps a learner still has to see (v10 → v10.1 → v10.3), and `v10Pending` counts v10.3 steps as pending (never for rung unlocking). Finishing the lesson's last step writes `vis[lid].v103`. A `run` question can carry `need: [[regex, label], …]`: the result must match **and** each keyword must stay, as on v10.2 code cards, so `SELECT 3` cannot pass by luck. A question can show the learner's plan (`planShow`). Picture step labels are now numbered in the order they are drawn, a scene can put its query first (`qfirst`) and rename its first table block (`lab`), and the run editor is tall enough for the whole query. No term, code card or problem was added (a new item would change lesson %), so all practice of writing these queries is in result-checked `run` questions.

## 0j. STANDING RULES (v10.4): every SQL lesson after joins, traced by hand first
The chart task (`sqlrt`), *Subqueries* (`sql6`), the rest of *CTEs (WITH)* (`sql7` Steps 9–12), *Window functions* (`sql8`) and *Cleaning* (`sql9`) follow the v10.3 method: **trace by hand → the whole idea in SQL → one-change checks → spot the mistake → a shop transfer → combine 2–3 pieces → the lesson's own practice, planned first** (what one result row means, which pieces, in what order, how many rows to expect).
- **sqlrt (Top-5 artists on more than one day):** 7 real `chart_entries` rows (2026-10-16 and 2026-10-17) with their `songs` and `artists`. Filter the top 5, reach the artist through songs, pile by artist, COUNT(*) vs COUNT(DISTINCT chart_date) (the trap: two top-5 songs on one day), change one row, HAVING; a plan (grain, pieces, order, rows), a guided write, then a blank write. Marked by result, and the write must keep the top-5 filter and `HAVING COUNT(DISTINCT …)`.
- **sql6:** scalar subquery, IN subquery, derived table (points to sql7 Step 5), EXISTS / NOT EXISTS (correlated), the NOT IN NULL trap (a practice copy of `streams` with a NULL listener_id), then a combined task.
- **sql7 Steps 9–12:** chained CTEs (WITH once, then commas); UNION ALL vs UNION by hand (stacking is not joining; same column count; duplicates) on the `chart_mon`/`chart_tue` views; WITH RECURSIVE round by round (anchor `SELECT 1`, repeat rule `n + 1` after UNION ALL, stop rule `n < 7`, why 7 < 7 stops; one change: < 5, start 3, n + 2; mistakes: no stop rule, `<= 7` gives 8, a missing RECURSIVE; a practice `staff` hierarchy); percentages (70/150 = 0, 100.0 * first, ROUND), so sql7-p1 no longer relies on an untaught `100.0 *`.
- **sql8:** GROUP BY vs a window, PARTITION BY, ORDER BY inside OVER, ROW_NUMBER / RANK / DENSE_RANK with a tie, LAG / LEAD and the NULL first row, a running total with its frame (UNBOUNDED PRECEDING to CURRENT ROW by hand), filtering a window needs a CTE (top-N, dedupe), and the climbers task planned first.
- **sql9:** CASE (first true WHEN wins), COALESCE, CAST (text sorts as text), integer division and NULLIF, SUM(CASE WHEN …), and a combined per-artist task.
- **SQLite vs Postgres, said where it matters:** SQLite lets a CTE name a later CTE and runs a recursive CTE without the word RECURSIVE (Postgres needs it); in SQLite x / 0 is NULL (Postgres raises an error). Screens never claim an error SQLite does not give.

**Diagrams (v10.4 renderer, all lessons).** Four colour-blind-safe group colours (blue ●, vermilion ▲, green ■, purple ◆; Okabe–Ito based, with dark-mode variants), each row tinted with a 5 px stripe in its colour, the same colour and shape for the same thing in input, piles and output, and a shape in the mark column so colour is never the only cue. Figures read top to bottom: input → ↓ step label → output, at most 4 tables, and a one-line legend whenever groups are used. Older lessons keep their marks; only the colours became stronger.

**v10.4a: what is shown.** `V104_ON` (end of the v10.4 block) decides which v10.4 steps are shown; parked lessons are removed at load and run exactly as in v10.3 (no catch-up, no held card). Live now: sql7 Steps 10–11. Steps 9 and 12 carry `v105`.

**No early keywords (gating).** `v104Held(lid)` is true while a lesson has v10.4 steps the learner has not seen. While it is true, a card or problem of that lesson that has **not been started** is not introduced (`itemHeld`, `problemHeld`), and a not-started term of that lesson is not started (`newTermQueue`); a session that includes the lesson's v10.4 steps may introduce them after the steps. Items already started (any record in `items` or `cards`) are never held, changed or moved. So RECURSIVE, UNION and the window cards are never tested before their steps are seen.

**Engine (v10.4).** New steps carry `v104` and `tf`; `relKey` order v10 → v10.1 → v10.3 → v10.4; finishing the new steps writes `vis[lid].v104`; the catch-up shows one lesson a day, only its new steps, labelled 🆕 New. Replaced screens are listed in `L.retired` (kept in the source, not shown). No term, code card, problem or ID was added or removed, so no % can change.

## 1. Building blocks (grounding)
- Building-block words (`GROUND`, 20 blocks): row, column, value, table, query, result rows, expression, condition, clause, key, data type, schema, function, pipeline, run, batch, partition, event, API, test.
- Each block has a teach card and 2 questions built on a real mini table, query and output. A question is either "tap the actual thing" (`tap`) or multiple choice (`o`).
- **A block is grounded** after a correct answer on **2 different calendar days**. A miss before it is grounded clears the first correct day. A block appears at most once per day.
- **Gate:** a term's first phrase starts only when all its blocks (`TERM_BLOCKS[id]`) are grounded. Blocks are shared, so a block grounded once serves every term that uses it.
- Daily grounding limit: slow 1, normal 2, fast 3 questions.

## 2. Phrases and the three forms
- Each tier of a term is a definition split into phrases, written as `{phrase}` in the tier text.
- **One phrase at a time.** The next phrase starts only after the current one is mastered.
- Each phrase climbs 3 steps (`ph.s`):

| `ph.s` | Next form needed |
|---|---|
| 0 | **PICK**: choose the exact phrase from options. |
| 1 | **TYPE**: write it with no options. |
| 2 | **SPOT**: identify or apply it in a real query, table or scenario. |
| 3 | Mastered. |

- **A step needs a correct answer on a different calendar day from the previous step.** A term moves at most **one step per day** (`ts.lastUp`), so the next phrase also starts on another day.
- **A miss drops one step** (minimum 0) and blocks step-ups for that phrase for the rest of the day. Same-day retries are practice only.
- **Whole-tier check:** when all phrases are mastered, the learner writes the whole tier definition on a later day. The app shows which phrases it found, with their precision words, and the learner self-grades. Passing completes the tier. A miss drops nothing, and the check is tried again another day.
- **Mastered-phrase reviews:** the first is due 3 days after mastery, then the interval doubles (capped at 60 days). The review form alternates between TYPE and a precision-word drill. A missed review sets the phrase back to s=2, so the phrase becomes active again and only SPOT is needed.

## 3. Accepted wordings and precision words
- Each phrase has up to **3 accepted wordings** (`a`): the phrase itself plus at most 2 more. Typing any one of them counts. The alternatives are shown at a phrase's introduction and after every answer.
- **Typing tolerance** (`checkPhrase`):
  - About 75% of the content words must be present.
  - Words of 5 or more letters may differ by one letter, which covers typos and most plurals (column/columns).
  - If a phrase has `ord: true`, every word must appear in order. This is used for clause-order lists.
- **Precision words must be exact:** one or more, at least one, exactly one, each, every, all, only, before, after, first, last, previous, next, left, right, TRUE, FALSE, never, not, by, many, new.
  - If the matched wording contains one of these words, the typed answer must contain it too. Otherwise the answer is **wrong**, and the app explains why (e.g. "on" instead of "by").
  - Adding "not", "never" or "no" when the wording has none is also wrong.
  - This is stricter than v3, where these small words were ignored as stop-words.
- **Distractors** (wrong options) are used in this order:
  1. Hand-written near-misses (`d: [[text, why]]`).
  2. Automatic precision swaps (`PREC_SWAP`, e.g. each→one, by→on, one or more→one), each with its reason.
  3. As a last resort, phrases of other terms in the same lesson.
- **Precision drill:** this review form blanks the precision word of a mastered phrase and offers the related small words (`PREC_GROUPS`, e.g. each / every / one / all).

## 4. Tiers
- **Tier 1 (beginner):** the simplest wording a junior would say in an interview, still professional. Terms with no hand-written tier 1 use the app's existing definition as tier 1.
- **Tier 2 (intermediate):** for hand-written terms (`TERMS4`, 29 terms), tier 2 is the existing, fuller definition.
- **Tier 3 (advanced):** written for 6 terms: ORDER BY, grain, LEFT JOIN, window function, idempotency and partition.
- Every tier covers all the parts of its definition, because the phrases together form the whole definition.
- Finishing tier 1 marks the item mastered in `deLearn.v1` and adds an SM-2 flashcard. The next tier becomes eligible **7 days** later (`TIER_WAIT_DAYS`).
- Terms mastered before v4 count as having finished tier 2 (hand-written terms) or tier 1 (other terms). Their next tier, where one exists, becomes eligible 7 days after the card was added.

## 5. Terms in parallel and pacing
- **Active terms:** 2 at normal pace and 2 at slow pace. A 3rd joins at fast pace.
- **Filling free slots**, in this order:
  1. Paused or migrated terms, most progress first.
  2. New terms in curriculum order (only from lessons whose theory has been read, or today's lesson), alternating with eligible next tiers.
- At most **1 new term per day**. At slow pace, a new term starts only if none is active.
- **Pacing** looks at the last 20 term answers (`T.log`):

| Pace | Condition | Effect |
|---|---|---|
| Slow | at least 8 answers and more than 35% missed | No new term; up to 2 extra weak-phrase reviews; a note on Home. |
| Fast | at least 12 answers and less than 12% missed | A 3rd active term; 3 grounding questions. |
| Normal | anything else | 2 active terms; 2 grounding questions. |

### Fast lane (v5): only with consistent accuracy
- **Counted study day:** a day with at least 5 term answers (`FAST_MIN_N`). Days with fewer answers, or no study, neither count nor break the run.
- **Turns on** when a session is planned and:
  - the last 4 counted days (`FAST_DAYS`) were each at least 90% correct (`FAST_DAY_ACC`);
  - those days all come after the last switch-off, so after a slip a fresh run of 4 is always needed;
  - the rolling accuracy over the last 20 term answers is at least 85% (`FAST_ROLL_ACC`), when there are 10 or more.
- **While on:**
  - Up to 5 active terms (`FAST_MAX_ACTIVE`), up to 2 new terms per day (`FAST_NEW_PER_DAY`) and 3 grounding questions.
  - Every per-term rule is unchanged: building blocks first, one phrase at a time, PICK, TYPE and SPOT on different days, and precision words.
  - The term budget (the 1/3 split) is unchanged. More terms means they take turns: the active terms asked least recently go first (`ts.asked`). The term block does not get longer, and code is identical.
  - Home shows "⚡ Fast lane on: consistent accuracy". The session summary repeats it.
- **Turns off at once**, checked after every term answer, when:
  - today has at least 5 answers and is under 90% correct; or
  - the rolling accuracy over the last 20 answers (with at least 10) falls below 85%.
- **When it turns off:**
  - Home (that day and the next) and the session summary show "⚡ Fast lane off: …".
  - The pace returns to normal: 2–3 active terms and at most 1 new term per day.
  - At the next plan, active terms beyond 3 are paused, starting with the ones with least progress. They keep every phrase step and get gentle maintenance until a slot frees up. Shown progress never drops.
- **State:** additive fields in `deLearn.terms`:
  - `daily {date: {n, ok}}`: the last 60 days.
  - `fast {on, since, off, why}`.
  - `terms[id].asked`.
- Overriding a wrong answer also restores today's count and the lane state.

- Pacing affects **only new term material**. Code, Q&A and problems are planned first and identically, whatever the term state. A test checks this.

## 6. Daily session layout and the 1/3 : 2/3 split
- **Order:**
  1. "How learning works", only once.
  2. **Opening term block:** grounding questions, then one advancing question per active term, or its whole-tier check.
  3. Code flashcards.
  4. Code and Q&A fade reviews.
  5. Theory.
  6. New code and Q&A items.
  7. One problem.
  8. **Closing term review**, interleaved: weak-phrase extras (slow pace), due mastered-phrase reviews, maintenance of paused terms, due term flashcards, and a same-day practice pick per active term.
- **Split by item count:**
  - `other` = number of code, theory and problem steps.
  - Term budget = `round(other / 2)`, clamped to 2–10. So terms are at most about 1/3 of the items, and code about 2/3.
  - Closing review = `max(1, round(budget / 3))`; the opening block gets the rest.
  - Code is never shortened for terms, and terms that don't fit wait for another day. The Home screen shows the split.
- Lesson practice (Roadmap → lesson): theory, then code and Q&A, then up to half as many term steps (the next step for each started term from that lesson), then problems.
- Lessons count as started and finished from their code and Q&A items only, so slow terms never hold lessons or module unlocks back.

## 7. State keys and the never-reset rule
| Key | Contents | Written by v4? |
|---|---|---|
| `deLearn.v1` | Original progress: XP, streak, days, items (fade levels, mastered), SM-2 cards, theory, problems, settings | Only by normal use (XP, cards, code levels, a term becoming mastered). Never by a migration. |
| `deLearn.ext` | v3: bite ladders, placement, onboarding, v3 pacing log | Never by v4. It stays byte-identical, and only placement or onboarding changes it. |
| `deLearn.terms` | v4: `ground`, `terms`, `log`, `day`, `lastFill`, `helpSeen`, `migratedAt`; v5 adds `daily`, `fast`; v6 adds `vis` | Yes |

- **Grounding record** `ground[b] = {ok, done, miss, n, seen}`: `ok` is the first correct day and `done` the day it was grounded.
- **Term record** `terms[id] = {st, tier, ph[], start, lastUp, whole, done{tier:day}, lapses, floor, peak, origin, mdue, mivl, wait}`
  - `st` is `active | paused | wait | done`.
  - Phrase record `ph[i] = {s, up, miss, due, ivl, seen, rn, credit}`.
- **Migration** (`migrateTerms`, idempotent; it only adds records for terms that have none):
  - v3 bite piece "known" → s=2, so only SPOT is missing. "Typing" → s=1. A combo level above 0 → all phrases s=2. When v3 pieces differ from v4 phrases, credit is given proportionally.
  - Old fade level only: L2 → first phrase s=1; L3 → all phrases s=1; L4 → all phrases s=2.
  - Migrated terms start `paused`. The 2 with the most progress become active at the next session. The others get gentle maintenance questions (about 2 a day, staggered) until a slot frees up. They still have to ground their building blocks.
  - Mastered terms and placement cards stay flashcards.
- **Shown progress never decreases:** `itemProgress(term)` is the maximum of the v1/v3 progress, the migration `floor`, the best v4 progress so far (`peak`), and the current v4 progress (0.9 × Σs / 3n, or 1 once tier 1 is done). XP only goes up. Overriding a wrong answer restores the state as it was before that answer, and XP is not taken back.
- Backups (More → Export) include `_ext` and `_terms`. Import restores them and re-runs both migrations. Reset clears all three.

## 8. Authoring new terms
1. **Building blocks:** add the term id to `TERM_BLOCKS` with the 1–4 blocks a beginner must picture first. If a needed word is missing, add a `GROUND` entry with `name`, `tip`, `teach` (html, ideally `SCENE` or an `MT()` table) and 2 questions. Each `tap` question must have exactly one part flagged `1`; flag the other parts `0` (wrong) or `null` (plain text).
2. **Tier 1** in `TERMS4[id].t1.def`: one sentence, 2–3 `{phrases}` of 3–8 words each. Keep it not so basic that it is misunderstood, and not so simple that it is boring.
3. **Per phrase** (`ph[i]`):
   - `a`: up to 2 extra wordings, only truly equivalent ones that keep every precision word.
   - `d`: 3 near-miss distractors, each with a one-line why. Change the small word wherever it matters (each→one, by→on, rows→columns, result→table).
   - `spot`: a question on a real table, query or scenario (`show:` with `MT()`/`QY()`, then `o:[correct, ...]` or `tap:`).
   - `ord: true` for ordered lists.
4. **Tier 3** (optional) `TERMS4[id].t3`: an advanced definition with `{phrases}`. Tier 2 is always the existing definition from the curriculum.
5. Run `node source/tests/t4_logic.js`. Its data-integrity test checks every phrase has 3 distractors and a valid SPOT question, and every block exists.
- Terms without `TERMS4` still work: tier 1 is the existing definition, split by `TERM_BITES` pieces or `autoPieces()`. SPOT comes from v3 aspects, otherwise "spot the accurate definition" among versions with this phrase swapped for its near-misses.

## 9. Tests

v8.2: `t9_content.js` adds the strict-but-simple checks (§0d): every pictured table keyed by a title is labelled a view, result, raw data or bad design; events, primary-key NULL, GROUP BY, partitions, record labels, aliases and song_id each have a picture, an mc with every wrong option explained and a non-music transfer question; no tier-1 definition says something "never changes"; the pipeline wording matches the repo. `browser_test.py` adds v8.1 (1f045a9) saved state: deLearn.v1, .ext and .terms byte-identical after loading v8.2, no lesson, item, module or term step lowered.

v8.1: `node source/tests/t9_content.js` runs every SQL code card, problem solution and placement answer on a fresh copy of its dataset, checks that genre lives on songs (artists has only artist_id and name, one song has a NULL genre, nothing refers to artists.genre), and that sqlt teaches the "more than one?" test with the genre before/after picture and transfer questions. `browser_test.py` adds v8 (60df8f4) saved state: deLearn.v1, .ext and .terms byte-identical after loading v8.1, no lesson, item or module % lowered.

v8: `node source/tests/t8_tables.js` checks the order sql4 → sqlt → sqlr, that a v7 learner (everything up to many-to-many read) gets sqlt as the next, unlocked gap lesson with nothing stored changed and no lesson or module % lowered, that fresh learners are unaffected, that sqlt's code and problem run on the dataset, that every blueprint matches the real table, 12+ pictures and 12+ questions with most outside music and all four transfer domains present, that every mc wrong option and every sorting item is explained, and that the new terms are fully wired. `browser_test.py` adds v7 (19df660) saved state: deLearn.v1, deLearn.ext and deLearn.terms byte-identical after loading v8, then a v8 daily session.

v7: `node source/tests/t7_relations.js` checks lesson order, gap scheduling for existing learners, that fresh learners are unaffected, that placement and stored progress are untouched, and that every new code item and problem runs on the dataset. `t6_illus.js` also validates `cls` and `tapc` questions.

- `node source/tests/t4_logic.js`: logic and data tests, including a simulated 60 days.
- `node source/tests/t5_fastlane.js`: fast lane. It turns on only after a consistent run (a small day neither counts nor breaks the run; a counted slip resets it) and turns off at once on a slip or a rolling dip. It also checks the caps (5 active, 2 new a day), the term budget, one step a day, identical code, and that paused terms keep their credit.
- `node source/tests/t6_illus.js`: illustrations. Every scene's SQL runs on real sql.js and must match the drawn result. Every visual question's answer is checked (tap indexes, unique mc options, `run` solutions run and respect `forbid`). It also checks the flow: pictures → questions → theory in lesson and daily sessions, no terms from a lesson on the day its pictures are first shown, and terms starting once the pictures are seen. For existing learners it checks one catch-up lesson a day, terms in progress first, catch-up before term practice, and no progress lowered.
- `python3 source/tests/browser_test.py` (needs Playwright with Chrome): checks that saved state from commits 08c6b1a, 371b94a, c35b2c9 (v4) and 051a0fb (v5) survives untouched (v5→v6: one lesson's pictures, `vis` added, nothing lowered); the joins lesson at 390px (no page overflow, RIGHT/FULL JOIN run in the app, screenshots `v6-joins-*.png` when `SHOTS` is set); that v1 and ext are byte-identical after loading, and that no progress is lowered; full daily and lesson sessions; 8 simulated days for a fresh learner; the help and learn screens; offline service worker.

v9.0: `node source/tests/t10_aws.js` checks the AWS track is separate from the SQL session, stores stay byte-identical, every AWS lesson has pictures and explained wrong options, every term has a labelled hook and the full pick/type/spot path, the name drill is additive (intervals, never touches term state or the fast lane), the hook card comes before the definition, and every click-through step is explained and labelled. `browser_test.py` adds a v8.2 (b4f492d) saved state and the `aws9` checks (`ONLY=aws9` runs just those).

v10.1: `node source/tests/t13_v101.js` checks the Step 9 rewrite (new question IDs for new questions, kept IDs for existing ones, tables before text, thinking checked before fan-out and INNER JOIN are named, a choice question after each screen), that learners who finished v10 get only the rewritten steps as a catch-up, and that the rewrite never re-locks the combination drills. `browser_test.py` adds a rich v10 (e5c4319) saved state.

v10.3: `node source/tests/t15_v103.js` checks the sql7 Steps 1–8 (new IDs, legacy positions and text kept, Steps 1–8 before the legacy pictures, a screen, a choice question with every wrong option explained and a shop transfer question in every step, the same six rows everywhere with listener_id only in Steps 2 and 8, no made-up tables, by hand before every rule, tables before text), marks the three write-it questions by result (other aliases, names and column order right; GROUP BY stream_id, MIN, `<`, `>=`, COUNT(*), COUNT(song_id), MAX and lucky constants wrong), and checks the catch-up (only the new steps, labelled new, once) and that no lesson, term, code card or problem changed against 9ab5ff9. `browser_test.py` adds a v10.2 (9ab5ff9) saved state with sql4–sql7 played (`cte103_state`: every key byte-identical, every lesson, item and module % identical, the catch-up runs and is recorded only in `vis.sql7.v103`, XP, streak, flashcards and theory kept), `cte103_ui` (key screens at 390px, right-but-different, COUNT(*) and lucky answers) and the whole sql7 lesson at 390px (`ONLY=cte103`).

v10.2: `node source/tests/t14_v102.js` checks result-based marking on sqlm-c3 (the reported answer, title, both columns, aliases and order accepted; COUNT(*), missing DISTINCT, missing GROUP BY, wrong or missing label and syntax errors wrong, each with its reason), that every runnable SQL card's model lines still pass and that removing any blanked keyword never passes, that `compareResults` accepts swapped columns and keeps old verdicts, and that `fix102` is one-time and never lowers anything. `browser_test.py` adds a v10.1 (192662b) saved state where the old build really drops the card, then checks the repair and that every other key is byte-identical.

v10.4: `node source/tests/t16_v104.js` checks the five rebuilt lessons (unique new IDs, every v10.3 question kept unchanged, tables before text, a link and a question on every screen, a reason on every mark, a one-line legend wherever colour groups are used, at most 4 tables per figure, every wrong option explained, a shop transfer in each lesson, only app tables or labelled practice copies, the write-it questions marked by result with wrong answers refused), the catch-up (sqlrt first, only new steps), the gating of not-started cards and problems, and that lessons, items, item text, problems and terms equal v10.3. `ONLY=v104 python3 source/tests/browser_test.py` seeds a v10.3 state and checks every key byte-identical, every lesson, item and module % identical, XP, streak, SM-2 cards and started items kept, and no held card started; it also saves the 390 px screens to `/workspace/dd-test/shots-v104/`.

## Benchmark: check before shipping

Run `node source/tests/changed_screens.js <last-live-commit>` to list every screen and question a build adds or changes. Score each listed item against all 13 points below, fix every fail, and include the table (item, pass/fail per point, fix) in the release report. Nothing ships with a fail.

1. **Technically correct** by industry standards; no inaccurate simplification.
2. **Table or picture first**, and the text walks through it in order.
3. **Every technical term defined** in plain words on first use.
4. **Opens by linking to the previous step's conclusion**; one idea leads to the next.
5. **One change per step**; the same small tables.
6. **Checks thinking on what is visible before naming the rule**; by hand before predicting.
7. **Never makes learners guess**: everything needed is visible (no closed toggles) or already taught.
8. **Every mark has its own reason.**
9. **Coherent, connected full sentences.**
10. **A choice question with plausible wrong options**, each one explained.
11. **A transfer example outside music** wherever the step teaches a rule.
12. **Before/after tables** for any change in data shape.
13. **Progress untouched**: all tests pass, saved states byte-identical, no percentage drops.
