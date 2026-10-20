"""Rebuild ../index.html from the files in this folder.

Usage (from the repo root):  python source/build.py
Edit app.js (curriculum data is at the top), then run this and push.
"""
from pathlib import Path

here = Path(__file__).parent
html = (here / "template.html").read_text()
for name in ["vendor-sqljs.js", "vendor-sql-wasm-b64.js", "app.js"]:
    html = html.replace(f"/*@@{name}@@*/", (here / name).read_text(), 1)
(here.parent / "index.html").write_text(html)
print("Built index.html")
