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
4. In `sw.js`, bump `CACHE = 'de-daily-v2'` to the next number so installed phones update.
5. Commit and push. GitHub Pages republishes within about a minute.
