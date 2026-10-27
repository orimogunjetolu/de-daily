// Node harness: evaluates app.js up to the ACTIONS block with browser stubs.
// usage: require('./h.js')(codeString, initialLocalStorageObject) -> value of the last expression
const fs = require('fs'), path = require('path');
module.exports = (extra, store) => {
  global.localStorage = { _d: Object.assign({}, store || {}), getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };
  global.window = { addEventListener() {} }; global.document = { getElementById: () => null, addEventListener() {} }; global.history = { replaceState() {}, pushState() {} };
  const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8'); const cut = src.indexOf('/* ============================ ACTIONS');
  return eval(src.slice(0, cut) + ';S=loadState();E=loadExt();migrateExt();T=loadTerms();migrateTerms();' + extra);
};
