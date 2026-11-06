// Load the project's TypeScript/TSX in Node for component and domain-contract checks.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const requireDependency = createRequire(new URL("../package.json", import.meta.url));
const cache = new Map();
export function loadProjectModule(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path).exports;
  const record = { exports: {} };
  cache.set(path, record);
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const require = specifier => {
    if (specifier.startsWith("@/") || specifier.startsWith(".")) {
      const base = specifier.startsWith("@/") ? resolve(root, specifier.slice(2)) : resolve(dirname(path), specifier);
      const source = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
      if (source) return loadProjectModule(source);
    }
    return requireDependency(specifier);
  };
  new Function("require", "module", "exports", outputText)(require, record, record.exports);
  return record.exports;
}
