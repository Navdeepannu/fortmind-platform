# Client reference alignment — November 11, 2026

## Scope and truth boundary

The eight screenshots supplied for review show the **client's production interface**: Cases, Case Detail, Home (Operations and Impact), Integrations (Connected and Browse), Reports, and Settings. They are visual/product references, **not** evidence that this demo repository shares a codebase or live backend with `platform.fortmind.ai`.

This branch builds on the Geist typography work in PR #15. It is a UI approximation guided by the images, not a pixel-perfect reproduction. **Preserve FortMind's existing token palette**, restrained OSCAR green, semantic verdicts, and local demo fixture truth. Do not apply copied black/white values across the app or claim fake telemetry is live.

## Implemented page map

| Product surface | Client reference pattern | Local implementation | Important retained behavior |
| --- | --- | --- | --- |
| Global shell | One organization, vertical product navigation, compact top bar | Single Home/Cases/Integrations/Knowledge/Reports/Settings nav, org identity, Geist, global search/theme | Search, notifications, sidebar, account menu, responsive sidebar |
| Home | Operations/Impact tabs, KPI strip, action queue and reporting | Two-tab home, four current counters, analyst queue first, OSCAR activity, priority/verdict distributions, existing impact charts | Monitored phase-state truth, analyst next actions, actual demo reporting periods |
| Cases | Needs you/Running/Closed/Failed/All, dense table, quick filters and density | Lifecycle tabs plus optional analyst work views, 20 compact rows, Owner/Priority/Source/Verdict and autonomous filters | Sorting, column visibility, export, selection, preview, keyboard table access |
| Case Detail | Four primary tabs, boxed conclusion, contained evidence groups | Overview/Evidence/Actions/Activity with accessible, native expandable sections; existing eleven source views preserved | Technical evidence, confidence distinction, verdict review, permalinks |
| Integrations | Connected list and Browse catalog | Connected list (including issues), Browse card grid and existing search/category/status/sort | Details, sample connection tests, warning states |
| Reports | Compact reporting metrics, tables, clear date presets | Denser 8-KPI grid, distribution cards and reports; duration deltas avoid misleading extreme percentages | Accurate demo period comparisons, working CSV; disabled PDF remains explicit |
| Settings | Shared platform shell, category navigation and on-page index | Reuses workspace shell with active Settings state, category links and responsive settings index | Seven browser-saved independent forms, validation, unsaved states |

## Visual system contract

- Geist Sans + Geist Mono. See `app/layout.tsx` and typography in `app/globals.css`.
- Neutral, near-black dark canvas and restrained border-led cards; the existing light theme remains required.
- CSS tokens are the only color source. Avoid hardcoded black, white or green in new components.
- Green is reserved for brand actions and OSCAR identity; malicious, suspicious, benign, inconclusive and priority semantics remain independent.
- Tables have explicit column and cell alignment. Compact means dense, **not illegible**.
- Breakpoints to review: 320/390/768/1024/1440/1920 CSS px, light/dark, keyboard, focus and touch.
- Include a short rationale and a screenshot diff before requesting approval. Keep functionality untouched unless explicitly stated.

## Prompt pack A — Cases polish

> First inspect `design.md`, `case-table.tsx`, `case-list-views.ts`, and existing primitives. Compare the Cases screenshot: priority-first table, compact density controls, and quick filters. Improve the alignment of Priority, Case, Source, Verdict, Owner, Age and row actions at 1440px; ensure the same column order in `thead` and `tbody`. On mobile, prioritize visible case title, priority and verdict while retaining keyboard-accessible scrolling and in-row context. Test selection, sorting, filter chips, status tabs, work views, and preview navigation. Do not replace business logic, remove more advanced analyst filters, or mutate data. Use existing neutral surface tokens and preserve security semantic colors.

## Prompt pack B — Case Detail polish

> Use the client reference: a concise title/status header, four top tabs (Overview/Evidence/Actions/Activity), a bounded Conclusion summary, and full-width contained expandable sections. Review `client-reference-tabs.tsx`, `investigation-section.tsx`, and `case-overview.tsx`. Reduce redundant headings and nested borders inside open accordions while preserving every interactive action and all eleven underlying source views. Keep deep links and hash targets working; ensure native details sections work with keyboard, focus, print, and touch. Verify one accordion, multiple accordions, a long finding, and a decision requiring review in light/dark at 390/1024/1440px.

## Prompt pack C — Home and OSCAR

> Keep the reference Home two-tab organization with a compact operational KPI strip and a queue of cases requiring human attention. Preserve the distinctive OSCAR run-inspection panel: selecting a run shows the supplied recorded phases, currently available evidence and next action without invented progress or timestamps. Use neutral border-led surfaces, semantic phase indicators, and restrained green. Verify the running/failed/needs-human distinction and accessible focus management. Do not make the home page a CRM or add a New Case CTA.

## Prompt pack D — Integrations

> Use Connected as a compact tool-health list and Browse as a searchable card directory. Keep issue states and connection-management destinations visible. Implement category, search and sort controls so they work in either view. Do not imply real credentials, authentication, live calls or test results when the prototype only contains fixtures. Review long tool names, disabled states, keyboard navigation and mobile wrapping.

## Prompt pack E — Reports and impact

> Use the reference compact metrics and clear 7/30/90-day controls but retain the demo's actual available reporting periods. Ensure denominators and sample sizes are visible; do not show a huge relative percentage when a tiny baseline makes it misleading. Show meaningful absolute changes in durations, preserve CSV export and explicit unavailable PDF state. Distinguish measured demo events from assumed minutes saved; validate zero denominators, empty periods, CSV and date range selection.

## Prompt pack F — Settings

> Keep the global product shell persistent in Settings. Show category tabs and a small on-page index for Investigations, Alerts, Escalation, Responses and Impact. Preserve the independently routed forms, browser persistence, field validation, disabled capabilities and unsaved-state notices. Reuse SettingsGroup and SettingRow; do not create a second theme or navigation system. Ensure the index remains navigable on a narrow screen with a single mobile disclosure.

## QA / merge gate

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- Browser checks listed in `README.md`; revisit legacy tests that assert the old four work-view tabs or five category case-detail navigation.
- Check 320, 390, 768, 1024, 1440 and 1920px, both themes.
- Verify no horizontal page overflow; empty/failed states, filters, tooltips, sticky bars and scrollable regions.
- Review marketing/brand logo asset changes **separately**; this alignment does not approve new FortMind or OSCAR artwork.
- Review and approve in PR before merging or sharing prompts with the client.

## Handoff rule

For each prompt delivered to Thinesh, include before screenshot, after screenshot, exact intended scope, prompt, acceptance criteria, and a short note about what was preserved. Test prompts against a local branch first; **never assume** the client's Claude agent has the same component names, data or routing as this demo.
