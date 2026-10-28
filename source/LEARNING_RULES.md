# DE Daily: learning rules (v6)

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
- `node source/tests/t4_logic.js`: logic and data tests, including a simulated 60 days.
- `node source/tests/t5_fastlane.js`: fast lane. It turns on only after a consistent run (a small day neither counts nor breaks the run; a counted slip resets it) and turns off at once on a slip or a rolling dip. It also checks the caps (5 active, 2 new a day), the term budget, one step a day, identical code, and that paused terms keep their credit.
- `node source/tests/t6_illus.js`: illustrations. Every scene's SQL runs on real sql.js and must match the drawn result. Every visual question's answer is checked (tap indexes, unique mc options, `run` solutions run and respect `forbid`). It also checks the flow: pictures → questions → theory in lesson and daily sessions, no terms from a lesson on the day its pictures are first shown, and terms starting once the pictures are seen. For existing learners it checks one catch-up lesson a day, terms in progress first, catch-up before term practice, and no progress lowered.
- `python3 source/tests/browser_test.py` (needs Playwright with Chrome): checks that saved state from commits 08c6b1a, 371b94a, c35b2c9 (v4) and 051a0fb (v5) survives untouched (v5→v6: one lesson's pictures, `vis` added, nothing lowered); the joins lesson at 390px (no page overflow, RIGHT/FULL JOIN run in the app, screenshots `v6-joins-*.png` when `SHOTS` is set); that v1 and ext are byte-identical after loading, and that no progress is lowered; full daily and lesson sessions; 8 simulated days for a fresh learner; the help and learn screens; offline service worker.
