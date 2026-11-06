import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type ColorScope = "global" | "dashboard";
export type ColorMode = "light" | "dark";
export type VariableMap = Record<string, string>;
export interface ColorEntry {
  id: string;
  name: string;
  group: string;
  scope: ColorScope;
  light: string;
  dark: string;
  source: string;
  token: boolean;
}
export interface ColorInventory {
  entries: ColorEntry[];
  variables: Record<ColorMode, Record<ColorScope, VariableMap>>;
  sourceFiles: string[];
  issues: string[];
  iconImports: string[];
}
export interface CssBlock {
  selector: string;
  declarations: VariableMap;
}

export function readVariableBlocks(css: string): CssBlock[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: CssBlock[] = [];
  const stack: CssBlock[] = [{ selector: "", declarations: {} }];
  const collect = (body: string) => {
    for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      stack[stack.length - 1].declarations[match[1]] = match[2]
        .trim()
        .replace(/\s+/g, " ");
    }
  };
  // Tailwind's @theme also contains nested @keyframes; retain its outer declarations.
  let start = 0;
  for (let index = 0; index < clean.length; index++) {
    if (clean[index] === "{") {
      const segment = clean.slice(start, index);
      const boundary = segment.lastIndexOf(";") + 1;
      collect(segment.slice(0, boundary));
      const block = {
        selector: segment.slice(boundary).trim(),
        declarations: {},
      };
      blocks.push(block);
      stack.push(block);
      start = index + 1;
    } else if (clean[index] === "}") {
      collect(clean.slice(start, index));
      stack.pop();
      start = index + 1;
    }
  }
  return blocks;
}

function variablesFor(blocks: CssBlock[], selector: string) {
  return Object.assign(
    {},
    ...blocks
      .filter((block) => block.selector.split(",").map((part) => part.trim()).includes(selector))
      .map((block) => block.declarations),
  ) as VariableMap;
}
export function isColorVariable(
  name: string,
  variables: VariableMap,
  seen = new Set<string>(),
): boolean {
  if (seen.has(name) || !variables[name]) return false;
  const next = new Set(seen).add(name);
  const value = variables[name];
  if (
    /^(?:oklch|oklab|lab|lch|rgb|hsl|hwb|color|color-mix)\(|^#|^(?:transparent|white|black|currentColor)$/.test(
      value,
    )
  )
    return true;
  return [...value.matchAll(/var\((--[\w-]+)/g)].some((match) =>
    isColorVariable(match[1], variables, next),
  );
}
function groupFor(name: string, scope: ColorScope) {
  if (name.startsWith("--color-")) return "Utility aliases";
  if (name.startsWith("--semantic-")) return "Semantic roles";
  if (name.startsWith("--indicator-")) return "Indicator inks";
  if (scope === "dashboard") return "Dashboard overrides";
  if (/^--(?:danger|warning|success|info|neutral|oscar)(?:-|$)/.test(name))
    return "Semantic palette";
  if (name.startsWith("--sidebar")) return "Sidebar";
  if (name.startsWith("--chart")) return "Chart defaults";
  if (/^--(?:primary|destructive)/.test(name)) return "Brand & actions";
  return "Surfaces & content";
}

export const interactionColors: ColorEntry[] = [
  [
    "primary-hover",
    "Primary action · hover",
    "color-mix(in oklch, var(--primary) 85%, transparent)",
    "color-mix(in oklch, var(--primary) 85%, transparent)",
    "app/globals.css · .bg-primary:hover",
  ],
  [
    "secondary-hover",
    "Secondary action · hover",
    "color-mix(in oklch, var(--secondary), var(--foreground) 5%)",
    "color-mix(in oklch, var(--secondary), var(--foreground) 5%)",
    "components/ui/button.tsx · secondary:hover",
  ],
  [
    "outline-surface",
    "Outline action · surface",
    "var(--background)",
    "color-mix(in oklab, var(--input) 30%, transparent)",
    "components/ui/button.tsx · outline",
  ],
  [
    "outline-hover",
    "Outline action · hover",
    "var(--muted)",
    "color-mix(in oklab, var(--input) 50%, transparent)",
    "components/ui/button.tsx · outline:hover",
  ],
  [
    "ghost-hover",
    "Ghost action · hover",
    "var(--muted)",
    "color-mix(in oklab, var(--muted) 50%, transparent)",
    "components/ui/button.tsx · ghost:hover",
  ],
  [
    "destructive-surface",
    "Destructive action · surface",
    "color-mix(in oklab, var(--destructive) 10%, transparent)",
    "color-mix(in oklab, var(--destructive) 20%, transparent)",
    "components/ui/button.tsx · destructive",
  ],
  [
    "destructive-hover",
    "Destructive action · hover",
    "color-mix(in oklab, var(--destructive) 20%, transparent)",
    "color-mix(in oklab, var(--destructive) 30%, transparent)",
    "components/ui/button.tsx · destructive:hover",
  ],
  [
    "destructive-focus",
    "Destructive action · focus",
    "color-mix(in oklab, var(--destructive) 20%, transparent)",
    "color-mix(in oklab, var(--destructive) 40%, transparent)",
    "components/ui/button.tsx · destructive:focus-visible",
  ],
  [
    "row-hover",
    "Table row · hover",
    "color-mix(in oklab, var(--muted) 50%, transparent)",
    "color-mix(in oklab, var(--muted) 50%, transparent)",
    "components/ui/table.tsx · hover:bg-muted/50",
  ],
  [
    "row-selected",
    "Table row · selected",
    "var(--muted)",
    "var(--muted)",
    "components/ui/table.tsx · data-state=selected",
  ],
  [
    "focus-ring",
    "Focus halo",
    "color-mix(in oklab, var(--ring) 50%, transparent)",
    "color-mix(in oklab, var(--ring) 50%, transparent)",
    "components/ui/button.tsx · ring-ring/50",
  ],
  [
    "input-surface",
    "Input · surface",
    "transparent",
    "color-mix(in oklab, var(--input) 30%, transparent)",
    "components/ui/input.tsx · dark:bg-input/30",
  ],
  [
    "invalid-ring",
    "Input · invalid halo",
    "color-mix(in oklab, var(--destructive) 20%, transparent)",
    "color-mix(in oklab, var(--destructive) 40%, transparent)",
    "components/ui/input.tsx · aria-invalid",
  ],
  [
    "menu-outline",
    "Menu & tooltip · outline",
    "color-mix(in oklab, var(--foreground) 10%, transparent)",
    "color-mix(in oklab, var(--foreground) 10%, transparent)",
    "components/ui/dropdown-menu.tsx · ring-foreground/10",
  ],
  [
    "menu-focus",
    "Menu item · focused",
    "var(--accent)",
    "var(--accent)",
    "components/ui/dropdown-menu.tsx · focus:bg-accent",
  ],
  [
    "sheet-overlay",
    "Sheet · scrim",
    "color-mix(in oklab, var(--color-black) 10%, transparent)",
    "color-mix(in oklab, var(--color-black) 10%, transparent)",
    "components/ui/sheet.tsx · bg-black/10",
  ],
  [
    "footer-surface",
    "Card footer · surface",
    "color-mix(in oklab, var(--muted) 50%, transparent)",
    "color-mix(in oklab, var(--muted) 50%, transparent)",
    "components/ui/card.tsx · bg-muted/50",
  ],
  [
    "inactive-tab",
    "Queue tab · inactive text",
    "color-mix(in oklab, var(--foreground) 60%, transparent)",
    "var(--muted-foreground)",
    "components/ui/tabs.tsx · text-foreground/60; dark:text-muted-foreground",
  ],
  [
    "invalid-border",
    "Control · invalid border",
    "var(--destructive)",
    "color-mix(in oklab, var(--destructive) 50%, transparent)",
    "components/ui/input.tsx · aria-invalid:border-destructive; dark:aria-invalid:border-destructive/50",
  ],
  [
    "destructive-focus-border",
    "Destructive action · focus border",
    "color-mix(in oklab, var(--destructive) 40%, transparent)",
    "color-mix(in oklab, var(--destructive) 40%, transparent)",
    "components/ui/button.tsx · focus-visible:border-destructive/40",
  ],
  [
    "disabled-input",
    "Input · disabled surface before control opacity",
    "color-mix(in oklab, var(--input) 50%, transparent)",
    "color-mix(in oklab, var(--input) 80%, transparent)",
    "components/ui/input.tsx · disabled:bg-input/50; dark:disabled:bg-input/80; control opacity=50%",
  ],
  [
    "unboxed",
    "Unboxed indicator · surface / border",
    "transparent",
    "transparent",
    "app/globals.css · priority/status treatments",
  ],
].map(([id, name, light, dark, source]) => ({
  id: `effect:${id}`,
  name,
  group: "Interaction colors",
  scope: "dashboard",
  light,
  dark,
  source,
  token: false,
}));

export async function loadColorInventory(
  projectRoot = process.cwd(),
): Promise<ColorInventory> {
  const sourceFiles = [
    "app/globals.css",
    "node_modules/tailwindcss/theme.css",
  ];
  const [globalCss, tailwindCss] = await Promise.all(
    sourceFiles.map((file) => readFile(resolve(projectRoot, file), "utf8")),
  );
  const globalBlocks = readVariableBlocks(globalCss);
  const tailwind = Object.assign(
    {},
    ...readVariableBlocks(tailwindCss).map((block) => block.declarations),
  ) as VariableMap;
  const aliases = variablesFor(globalBlocks, "@theme inline");
  const globalLight = {
    ...tailwind,
    ...aliases,
    ...variablesFor(globalBlocks, ":root"),
  };
  const globalDark = { ...globalLight, ...variablesFor(globalBlocks, ".dark") };
  const dashboardLight = globalLight;
  const dashboardDark = globalDark;
  const variables = {
    light: { global: globalLight, dashboard: dashboardLight },
    dark: { global: globalDark, dashboard: dashboardDark },
  };
  const entries: ColorEntry[] = [];
  for (const [scope, declarations] of [
    ["global", { ...aliases, ...variablesFor(globalBlocks, ":root") }],
  ] as const) {
    for (const name of Object.keys(declarations)) {
      if (!isColorVariable(name, variables.light[scope])) continue;
      entries.push({
        id: `${scope}:${name}`,
        name,
        group: groupFor(name, scope),
        scope,
        light: variables.light[scope][name],
        dark: variables.dark[scope][name],
        source: "app/globals.css",
        token: true,
      });
    }
  }
  const iconSources = [
    "components/fortmind/overview/overview.tsx",
    "components/fortmind/case-table.tsx",
    "components/fortmind/workspace-shell.tsx",
    "components/ui/checkbox.tsx",
    "components/ui/dropdown-menu.tsx",
    "components/ui/sheet.tsx",
    "components/ui/native-select.tsx",
    "lib/semantic-states.ts",
  ];
  const texts = await Promise.all(
    iconSources.map((file) => readFile(resolve(projectRoot, file), "utf8")),
  );
  const iconImports = [
    ...new Set(
      texts.flatMap((text) =>
        [
          ...text.matchAll(
            /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g,
          ),
        ].flatMap((match) =>
          match[1]
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name && !name.startsWith("type "))
            .map((name) => name.replace(/Icon$/, "")),
        ),
      ),
    ),
  ].sort();
  return {
    entries: [...entries, ...interactionColors],
    variables,
    sourceFiles: [...sourceFiles, ...iconSources, "components/ui/button.tsx"],
    issues: [],
    iconImports,
  };
}
