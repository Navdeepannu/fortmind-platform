import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";

async function loadTs(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
const inventoryModule = await loadTs("../lib/color-inventory.ts");
const resolution = await loadTs("../lib/color-resolution.ts");
const inventory = await inventoryModule.loadColorInventory();
const awaitableGlobals = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

test("source extraction retains Tailwind colors outside nested keyframes", () => {
  const blocks = inventoryModule.readVariableBlocks(`@import "tailwindcss";
    @theme default { --color-red-600: oklch(57.7% 0.245 27.325);
      @keyframes spin { to { transform: rotate(360deg); } }
    }
    .dark { --background: oklch(0.145 0 0); }
  `);
  assert.equal(
    blocks.find((b) => b.selector === "@theme default").declarations[
      "--color-red-600"
    ],
    "oklch(57.7% 0.245 27.325)",
  );
  assert.equal(
    blocks.find((b) => b.selector === ".dark").declarations["--background"],
    "oklch(0.145 0 0)",
  );
});

test("inventory covers every global color with one shared theme", () => {
  const globals = awaitableGlobals;
  for (const block of inventoryModule
    .readVariableBlocks(globals)
    .filter((b) => b.selector.split(",").some((selector) => [":root", ".dark", "@theme inline"].includes(selector.trim())))) {
    for (const name of Object.keys(block.declarations).filter((n) =>
      inventoryModule.isColorVariable(n, inventory.variables.light.global),
    )) {
      assert.ok(
        inventory.entries.some((e) => e.id === `global:${name}`),
        `${name} is presented`,
      );
    }
  }
  for (const role of ["danger", "warning", "success", "info", "neutral", "oscar", "escalation"]) {
    for (const part of ["", "-foreground", "-muted", "-border", "-accent", "-solid-foreground"]) {
      const entry = inventory.entries.find(
        (e) => e.id === `global:--${role}${part}`,
      );
      assert.ok(entry, `${role}${part} is presented`);
      assert.ok(entry.light && entry.dark);
    }
  }
  for (const role of ["danger", "warning", "information", "neutral", "positive", "failure", "agent", "escalation"]) {
    for (const part of ["", "-foreground", "-background", "-border"]) {
      assert.ok(inventory.entries.some((entry) => entry.id === `global:--semantic-${role}${part}`));
    }
  }
  assert.ok(!inventory.entries.some((e) => /--(?:font|radius)/.test(e.name)));
});

test("Neutral controls, restrained emerald branding and semantic accents stay separate", () => {
  const primary = inventory.entries.find((e) => e.id === "global:--primary");
  assert.equal(primary.light, "oklch(0.2 0.006 265)");
  assert.equal(primary.dark, "oklch(0.94 0.004 265)");
  const brand = inventory.entries.find((e) => e.id === "global:--brand");
  assert.equal(brand.light, "oklch(0.8 0.17 163)");
  assert.equal(brand.dark, brand.light);
  assert.notEqual(brand.dark, primary.dark);
  assert.equal(inventory.entries.find(e => e.id === "global:--background").dark, "oklch(0.193532 0.01849 274.8082)");
  assert.equal(inventory.entries.find(e => e.id === "global:--card").dark, "oklch(0.2204 0.0198 275.84)");
  const tint = inventory.entries.find((e) => e.id === "global:--danger-muted");
  assert.equal(tint.light, "oklch(0.9694 0.0152 12.42)");
  assert.equal(tint.dark, "oklch(0.2471 0.0378 3.36)");
  const oscar = inventory.entries.find((e) => e.id === "global:--oscar");
  assert.equal(oscar.light, "oklch(0.51 0.08 163)");
  assert.equal(oscar.dark, "oklch(0.74 0.09 163)");
  const escalation = inventory.entries.find((e) => e.id === "global:--escalation");
  assert.equal(escalation.light, "oklch(0.55 0.085 305)");
  assert.equal(escalation.dark, "oklch(0.7 0.07 305)");
  assert.equal(
    inventory.entries.find((e) => e.id === "global:--border").dark,
    "oklch(0.335 0.018 275.84)",
  );
});

test("aliases resolve as colors and cyclic or non-color variables do not", () => {
  const vars = {
    "--color": "oklch(.5 .1 30)",
    "--alias": "var(--color)",
    "--a": "var(--b)",
    "--b": "var(--a)",
    "--radius": ".625rem",
  };
  assert.equal(inventoryModule.isColorVariable("--alias", vars), true);
  assert.equal(inventoryModule.isColorVariable("--a", vars), false);
  assert.equal(inventoryModule.isColorVariable("--radius", vars), false);
});

test("alpha remains separate from native RGB conversion, including low-opacity fills", () => {
  for (const css of [
    "oklch(.7 .1 20 / 10%)",
    "oklab(.7 .1 .1 / 0.1)",
    "color(srgb 1 .2 .1 / 0.1)",
  ]) {
    const value = resolution.splitColorAlpha(css);
    assert.equal(value.alpha, 0.1);
    assert.ok(!value.opaque.includes("/"));
  }
  assert.deepEqual(resolution.splitColorAlpha("rgba(255, 128, 64, 0.035)"), {
    opaque: "rgb(255, 128, 64)",
    alpha: 0.035,
  });
  assert.equal(resolution.rgbaHex([255, 128, 64], 0.035), "#FF804009");
  assert.equal(resolution.rgbaHex([255, 255, 255], 0.1), "#FFFFFF1A");
  assert.equal(resolution.rgbaHex([0, 0, 0], 0), "#00000000");
  assert.equal(resolution.rgbaHex([255, 255, 255], 1), "#FFFFFF");
});

test("contrast computation uses WCAG luminance and composites translucent ink", () => {
  const black = { rgb: [0, 0, 0], alpha: 1 };
  const white = { rgb: [255, 255, 255], alpha: 1 };
  assert.equal(resolution.contrastRatio(black, white), 21);
  assert.equal(resolution.contrastRatio(white, white), 1);
  assert.ok(resolution.contrastRatio({ ...black, alpha: 0.5 }, white) < 4.5);
});

test("all semantic palette definitions are owned by globals.css", async () => {
  const { readdir } = await import("node:fs/promises");
  const root = new URL("../", import.meta.url);
  for (const folder of ["app", "components"]) {
    for (const file of await readdir(new URL(`${folder}/`, root), { recursive: true })) {
      if (!file.endsWith(".css") || `${folder}/${file}` === "app/globals.css") continue;
      const css = await readFile(new URL(`${folder}/${file}`, root), "utf8");
      assert.doesNotMatch(css, /--(?:semantic-[\w-]+|indicator-[\w-]+|(?:danger|warning|success|info|neutral|oscar)(?:-[\w-]+)?)\s*:/, `${file} must consume shared tokens`);
    }
  }
});


test("dashboard inspector reads shared neutral ink from globals.css", () => {
  const ink = inventory.entries.find(entry => entry.id === "global:--muted-foreground");
  assert.equal(ink.source, "app/globals.css");
  assert.equal(ink.light, "oklch(0.46 0.012 265)");
  assert.equal(ink.dark, "oklch(0.73 0.012 265)");
});

test("shared design colors use OKLCH literals or semantic aliases", () => {
  assert.doesNotMatch(awaitableGlobals, /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i);
  for (const entry of inventory.entries.filter(entry => entry.token && entry.source === "app/globals.css")) {
    for (const mode of ["light", "dark"]) {
      assert.match(entry[mode], /^(?:oklch|var)\(/, `${entry.name} ${mode}`);
    }
  }
});
