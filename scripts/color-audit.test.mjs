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

test("Shared surface roles and restrained brand actions follow the theme contract", () => {
  const primary = inventory.entries.find((e) => e.id === "global:--primary");
  assert.equal(primary.light, "oklch(0.2 0.006 265)");
  assert.equal(primary.dark, "var(--brand)");
  const brand = inventory.entries.find((e) => e.id === "global:--brand");
  assert.equal(brand.light, "oklch(0.7688460193 0.1687457279 161.948704)");
  assert.equal(brand.dark, brand.light);
  assert.equal(inventory.entries.find(e => e.id === "global:--accent").dark, "oklch(0.233609 0.008932 255.60)");
  assert.equal(inventory.entries.find(e => e.id === "global:--background").dark, "oklch(0.142283 0.003597 196.76)");
  assert.equal(inventory.entries.find(e => e.id === "global:--card").dark, "var(--background)");
  assert.equal(inventory.entries.find(e => e.id === "global:--popover").dark, "var(--surface-floating)");
  assert.equal(inventory.entries.find(e => e.id === "global:--surface").dark, "oklch(0.171887 0.001633 197.00)");
  assert.equal(inventory.entries.find(e => e.id === "global:--surface-elevated").dark, "var(--surface-floating)");
  assert.equal(inventory.entries.find(e => e.id === "global:--shell").dark, "var(--background)");
  assert.equal(inventory.entries.find(e => e.id === "global:--input").dark, "oklch(0.359444 0.011117 264.43)");
  assert.equal(inventory.entries.find(e => e.id === "global:--secondary").dark, "var(--control)");
  assert.equal(inventory.entries.find(e => e.id === "global:--sidebar").dark, "var(--shell)");
  assert.equal(inventory.entries.find(e => e.id === "global:--sidebar-border").dark, "var(--border)");
  const aliases = inventoryModule.readVariableBlocks(awaitableGlobals).find(block => block.selector === "@theme inline");
  assert.equal(aliases.declarations["--color-control"], "var(--control)");
  assert.equal(aliases.declarations["--color-table-stripe"], "var(--table-stripe)");
  assert.equal(aliases.declarations["--color-floating-hover"], "var(--floating-hover)");
  // Keyboard focus remains neutral; brand green is reserved for intentional actions.
  assert.equal(inventory.entries.find(e => e.id === "global:--ring").dark, "oklch(0.78 0.005 265)");
  const surfaceContract = {
    "--surface": ["oklch(1 0 0)", "oklch(0.171887 0.001633 197.00)"],
    "--surface-hover": ["oklch(0.957665 0.001718 247.84)", "oklch(0.233609 0.008932 255.60)"],
    "--surface-floating": ["oklch(1 0 0)", "oklch(0.255182 0.010408 260.70)"],
    "--border": ["oklch(0.924740 0.002906 264.54)", "oklch(0.270684 0.002912 196.98)"],
    "--control": ["oklch(0.976419 0.001323 286.38)", "oklch(0.217386 0.008416 264.38)"],
    "--floating-hover": ["oklch(0.957665 0.001718 247.84)", "oklch(0.270684 0.002912 196.98)"],
    "--shell": ["var(--background)", "var(--background)"],
    "--border-strong": ["oklch(0.866175 0.004672 258.33)", "oklch(0.359444 0.011117 264.43)"],
    "--input": ["oklch(0.866175 0.004672 258.33)", "oklch(0.359444 0.011117 264.43)"],
    "--table-stripe": ["oklch(0.978 0.0015 255)", "oklch(0.199330 0.006777 258.37)"],
  };
  const overrides = inventoryModule.readVariableBlocks(awaitableGlobals).find(block => block.selector === '.dark[data-visual-experiment="graphite"]');
  for (const [name, [light, dark]] of Object.entries(surfaceContract)) {
    const entry = inventory.entries.find(e => e.id === `global:${name}`);
    assert.equal(entry.light, light);
    assert.equal(entry.dark, dark);
    assert.equal(Object.hasOwn(overrides.declarations, name), false, `${name} stays shared by the experiment`);
  }
  for (const name of ["--background", "--shell", "--table-stripe", "--control", "--floating-hover", "--border-strong", "--input", "--sidebar-accent", "--sidebar-selected", "--foreground", "--muted-foreground"]) {
    assert.equal(Object.hasOwn(overrides.declarations, name), false, `${name} should not fork between default and graphite mode`);
  }
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
    "oklch(0.270684 0.002912 196.98)",
  );
});

test("workspace, filter controls, and floating content consume the layered palette", async () => {
  const files = [
    "components/fortmind/workspace-shell.tsx",
    "components/fortmind/case-table.tsx",
    "components/ui/button.tsx",
    "components/ui/input.tsx",
    "components/ui/textarea.tsx",
    "components/ui/native-select.tsx",
    "components/ui/select.tsx",
    "components/ui/dropdown-menu.tsx",
    "components/ui/popover.tsx",
    "components/ui/tooltip.tsx",
    "components/ui/hover-card.tsx",
  ];
  const sources = Object.fromEntries(await Promise.all(files.map(async (path) => [
    path,
    await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
  ])));
  assert.match(sources["components/fortmind/workspace-shell.tsx"], /data-ui="utility-bar"\s+className="[^"]*bg-shell/);
  assert.match(sources["components/fortmind/workspace-shell.tsx"], /data-ui="inset"\s+className="[^"]*bg-background/);
  assert.match(sources["components/fortmind/case-table.tsx"], /data-ui="filter-row"\s+className="[^"]*bg-surface/);
  assert.match(sources["components/fortmind/case-table.tsx"], /data-ui="table-shell"\s+className="[^"]*bg-surface/);
  assert.match(sources["components/ui/button.tsx"], /border-border-strong bg-transparent text-foreground/);
  for (const path of ["input", "textarea", "native-select", "select"]) {
    assert.match(sources[`components/ui/${path}.tsx`], /bg-control/, `${path} uses the shared control fill`);
  }
  for (const path of ["dropdown-menu", "popover", "tooltip", "hover-card", "select"]) {
    assert.match(sources[`components/ui/${path}.tsx`], /bg-surface-floating/, `${path} uses the shared floating surface`);
  }
  for (const path of ["dropdown-menu", "select"]) {
    assert.match(sources[`components/ui/${path}.tsx`], /focus:bg-floating-hover/, `${path} uses an elevated hover state`);
  }
});

test("only FortCases tbody rows are striped, without hiding selected or hovered states", () => {
  assert.match(awaitableGlobals, /\[data-ui="case-table"\] tbody tr:nth-child\(even\)/);
  for (const guard of [":not(:hover)", ':not([data-state="selected"])', ':not([data-preview-selected="true"])']) {
    assert.ok(awaitableGlobals.includes(guard), `stripe guards ${guard}`);
  }
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
  assert.equal(ink.light, "oklch(0.512199 0.014072 259.82)");
  assert.equal(ink.dark, "oklch(0.721033 0.007985 260.73)");
});

test("shared design colors use OKLCH literals or semantic aliases", () => {
  assert.doesNotMatch(awaitableGlobals.replace(/\/\*[\s\S]*?\*\//g, ""), /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i);
  for (const entry of inventory.entries.filter(entry => entry.token && entry.source === "app/globals.css")) {
    for (const mode of ["light", "dark"]) {
      assert.match(entry[mode], /^(?:oklch|var)\(/, `${entry.name} ${mode}`);
    }
  }
});


test("semantic primary, accent and muted tokens reuse the finalized palette in both modes", () => {
  for (const role of ["danger", "warning", "success", "info", "unresolved"]) {
    const base = role === "unresolved" ? "neutral" : role;
    for (const part of ["primary", "accent", "muted"]) {
      const entry = inventory.entries.find(e => e.id === `global:--${role}-${part}`);
      assert.ok(entry, `${role}-${part} exists`);
      const existing = inventory.entries.find(e => e.id === `global:--${base}${part === "primary" ? "" : `-${part}`}`);
      for (const mode of ["light", "dark"]) {
        assert.equal(inventoryModule.isColorVariable(entry.name, inventory.variables[mode].global), true);
        const aliasesExisting = role === "unresolved" || part === "primary";
        assert.equal(entry[mode], aliasesExisting ? `var(${existing.name})` : existing[mode]);
      }
    }
  }
});
