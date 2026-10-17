# DE Daily: learn data engineering

Open `index.html` in any browser. It's one self-contained file and works offline, including on Android.
Progress is saved in the browser's localStorage. Use **More → Export progress** to back it up.

- `index.html`: the whole app, including inline sql.js (SQLite compiled to WebAssembly)
- `manifest.json`, `sw.js`, `icon-*.png`: optional PWA extras, which only take effect when the folder is served over http(s) (e.g. GitHub Pages)
- `build/`: sources (`src/`), `build.js` (rebuilds index.html), `validate.js` (runs every SQL item and solution), `test.js` (headless Chrome test)

To add content, edit `build/src/c*.js` (curriculum data), then run `cd build && node build.js`.
