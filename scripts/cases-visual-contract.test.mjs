import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const shell = read("components/fortmind/workspace-shell.tsx");
const table = read("components/fortmind/case-table.tsx");
const inspector = read("components/fortmind/investigation-inspector.tsx");
const semantics = read("components/fortmind/semantic.tsx");
const globals = read("app/globals.css");
const caseDetail = read("components/fortmind/case-overview/case-overview.tsx");

test("the existing sidebar is inset, collapsible, and has a contextual header breadcrumb", () => {
  assert.match(shell, /variant="inset"/);
  assert.match(shell, /collapsible="icon"/);
  assert.match(shell, /<SidebarInset/);
  assert.match(shell, /aria-label="Breadcrumb"/);
  assert.match(shell, /<CopyTechnicalValue label="case ID"/);
  assert.doesNotMatch(caseDetail, /data-ui="breadcrumb-row"/);
  const sidebarBrand = shell.match(/data-ui="sidebar-brand"\s+className="([^"]+)"/)?.[1];
  assert.ok(sidebarBrand, "Sidebar brand is present");
  assert.doesNotMatch(sidebarBrand, /border-b/, "Logo row should not contain a divider");
  assert.match(shell, /function DesktopSidebarTrigger\(\)/);
  assert.match(shell, /<DesktopSidebarTrigger \/>/);
  assert.match(shell, /md:overflow-clip md:rounded-xl md:border-border/);
  assert.match(shell, /\[data-slot=sidebar-inner\]\]:rounded-xl/);

});

test("14px regular is the shared UI baseline; verdict and case title are medium weight", () => {
  assert.match(globals, /--text-body:\s*0\.875rem;/);
  assert.match(globals, /--text-label:\s*0\.875rem;/);
  assert.match(semantics, /text-body font-medium text-foreground/);
  assert.match(table, /text-body font-medium text-foreground/);
  assert.match(semantics, /rounded-\[2px\]/);
});

test("queue tabs and accessible menu filters sit above the bordered table", () => {
  const tabs = table.indexOf('data-ui="queue-top"');
  const filters = table.indexOf('data-ui="filter-row"');
  const surface = table.indexOf('data-ui="table-shell"');
  assert.ok(tabs > 0 && tabs < filters && filters < surface);
  assert.equal((table.match(/<CaseFilterDropdown/g) ?? []).length, 4);
  assert.doesNotMatch(table, /<select\b/);
  const more = table.slice(table.indexOf('aria-label="More filters"'), table.indexOf('aria-label="Display preferences"'));
  assert.match(more, /label="Status"/);
  assert.doesNotMatch(more, /label="Owner"|label="Priority"|label="Source"|checked=\{filters\.autonomous\}/);
});

test("priority is the first data column and the full table remains scrollable", () => {
  assert.match(table, /data-ui="col-select"[\s\S]*?data-ui="col-priority"[\s\S]*?data-ui="col-case"/);
  assert.match(table, /data-ui="case-table-scroll"/);
  assert.match(table, /min-w-\[960px\]/);
  assert.match(semantics, /<QueuePriorityIcon value=\{value\}/);
});

test("Cases preview reuses the OSCAR lifecycle and avoids the elevated dark panel", () => {
  assert.match(inspector, /<OscarCaseLifecyclePreview[\s\S]*?mode="timeline"/);
  assert.match(inspector, /data-ui="case-investigation-preview"/);
  assert.match(inspector, /bg-background shadow-none/);
  assert.match(globals, /--surface-floating:\s*var\(--background\)/);
  assert.match(globals, /--floating-hover:\s*oklch\(0\.208/);
});
