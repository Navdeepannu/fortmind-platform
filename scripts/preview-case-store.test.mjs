import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const { outputText } = ts.transpileModule(readFileSync(new URL("../lib/preview-case-store.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
function loadStore(storage) {
  const exports = {};
  runInNewContext(outputText, {
    exports, window: {}, sessionStorage: storage,
    require: () => ({ useSyncExternalStore(subscribe, snapshot) { subscribe(() => {}); return snapshot(); } }),
  });
  return exports;
}

test("a refreshed tab restores draft identities and allocates the next unique case ID", () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const first = loadStore(storage);
  assert.equal(first.addPreviewCase("First case", "Source context").id, "FM-LOCAL-001");
  const refreshed = loadStore(storage);
  const [restored] = refreshed.usePreviewCases();
  assert.equal(restored.id, "FM-LOCAL-001");
  assert.equal(restored.title, "First case");
  assert.equal(restored.summary, "Source context");
  assert.equal(refreshed.addPreviewCase("Second case", "Other context").id, "FM-LOCAL-002");
});

test("malformed or unavailable storage leaves the prototype usable", () => {
  for (const storage of [
    { getItem: () => "{broken", setItem() {} },
    { getItem() { throw Error("Blocked"); }, setItem() { throw Error("Blocked"); } },
    { getItem: () => '[{"id":"FM-LOCAL-001","title":"Valid case","context":"Context"},{"id":"FM-LOCAL-001","title":"Duplicate","context":"Context"},null,{"id":"bad","title":"Bad","context":"Context"}]', setItem() {} },
  ]) {
    const store = loadStore(storage);
    const records = store.usePreviewCases();
    assert.ok(records.length <= 1);
    const added = store.addPreviewCase("New case", "Context");
    assert.notEqual(added.id, records[0]?.id);
  }
});
