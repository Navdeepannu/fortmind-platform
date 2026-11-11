# Overview — purpose-first operations and impact

## Audit and decisions

The page previously duplicated closure information across the four-metric strip, chart, and Performance card. The old chart largely compared OSCAR and analyst closures; the separate Performance selector did not affect that chart. Priority, verdict and performance then appeared as three equal-width cards even though only two of those describe case distributions.

This iteration removes information without an operational purpose:

1. **Overview summary**: four compact links/metrics — Needs you, Running, OSCAR closed in the 7-day sample, Failed. The OSCAR count is explicitly a 7-day sample; other numbers remain current fixture snapshots. These are not added together.
2. **Active work**: existing investigator is pre-selected to a known active sample rather than initially rendering an empty detail panel. Its phases remain truthfully unknown where telemetry is absent. Header ornament and repetitive lifecycle string are removed.
3. **Human decisions**: the repeated urgent alert strip is removed; urgency stays in the snapshot tile and per-case priority badge. Next actions and direct case review remain.
4. **OSCAR impact**: replaces a closure-comparison chart plus an unrelated KPI card with two linked charts — autonomous closures per day/interval and cumulative *estimated* analyst hours returned — plus closure count, estimated hours and autonomous share. **One period selector** controls both charts and metrics. Analyst closures and failed runs remain available in the tooltip/footnote for denominator context.
5. **Distributions**: Priority (current open workload, Needs you + Running) and Verdict (fixed 7-day closed sample) are separate side-by-side half-width cards with neutral proportional bars. Their denominators and differing time windows are explicit.
6. **Navigation**: search is in the collapsible sidebar and remains an icon in the compact top bar; Cmd/Ctrl+K still works. At **very wide layouts only**, a sticky on-page contents rail links to running investigations, human review, impact, and case mix. The rest of the UI retains the original page width and existing shell.

## Measured versus estimated

The only numeric ingredients for time savings are **OSCAR closed cases** and the existing settings-controlled `analystMinutes` assumption. The cumulative area chart uses `OSCAR closures × assumed minutes per case`. It is not measured productivity, not the time an actual analyst worked, and not a claim of causal speed improvement.

The 7-day series uses the supplied preview fixture (Oct 28–Nov 3, 2026). The 30/90-day series are existing deterministic generated examples and explicitly labeled as such. The cumulative trend has no invented starting baseline before the selected period. Failures are not treated as resolved cases or a known run-level failure rate.

Priority and verdict are **not comparable cohorts**: priority describes open workload, verdict describes a fixed set of closed cases. Their side-by-side layout is for concise distribution reading, not cross-division.

## Files

- `lib/overview-data.ts`: deterministic bucket aggregation with cumulative estimated hours.
- `components/fortmind/overview/impact.tsx`: unified impact chart/card section, two distribution cards.
- `components/fortmind/overview/overview.tsx`: concise layout and optional right on-page navigation.
- `components/fortmind/overview/investigations.tsx`: preselected run and removal of visual filler.
- `components/fortmind/overview/attention.tsx`: removal of redundant urgent strip.
- `components/fortmind/workspace-shell.tsx`: sidebar search and compact top bar.
- `scripts/overview-data.test.mjs`, `scripts/overview-browser-check.mjs`: added/updated data and interaction checks.

## Reviewer checklist

- Verify first selected run and source-grounded phases; selecting another updates the inspector.
- Verify status summary links and #oscar-impact navigation.
- Switch impact 7d/30d/90d: both charts, metrics and reporting dates must update in sync. In 7d sample, 18 autonomous closures × 20 min = 6h.
- Check light/dark at widths 390, 768, 1024, 1280, 1440, 1920; at 1720+ inspect page-side navigation; no horizontal page overflow.
- Check sidebar search, toolbar search icon, keyboard Cmd/Ctrl+K, dropdown notifications and mobile sidebar.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` and `scripts/overview-browser-check.mjs` with Playwright.

Preview fixtures only; the final design can connect to real telemetry later without showing unsupported claims today.


## Visual-density iteration — Nov 10

Research sources:
- [Dropzone AI Dashboard documentation](https://docs.dropzone.ai/platform/dashboard): compact priority/conclusion totals, activity chart and operational breakdown
- [Darktrace Threat Visualizer](https://www.darktrace.com/products/network): concise incident prioritization with drill-in context
- [Cloudflare custom dashboard guidance](https://developers.cloudflare.com/analytics/custom-dashboards/): trends for timeseries, bars for categories, metric blocks for key totals
- [Linear Dashboards](https://linear.app/docs/dashboards): interactive drill-down over additional static cards
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines): accurate state labels, text as needed, next action from each screen
- [EvilCharts](https://evilcharts.com/docs): higher craft in chart composition; **no new chart dependency installed**

Additional reductions:
- The Overview title and snapshot label now occupy one row; long guiding paragraphs, decorative headings and repeated reminders were removed.
- Top metric links are compact; the 7-day autonomous count is labeled separately from the current queue snapshot.
- OSCAR run activity is a **phase matrix**: five recorded-phase columns, four actual sample runs, click-to-inspect case details. Empty/unknown states do not show fake progress. The selected run's summary is truncated to two lines with full text on hover, plus a direct link to the case.
- Human intervention is three concise action rows rather than a table. Each shows identity, priority, case age and next step; context and verdict details live in the existing preview.
- Impact presents **one graph at a time**, switchable between stacked investigation throughput and cumulative estimated analyst hours. Its 7/30/90-day control is shared; exact denominators, assumptions and generated-demo disclosures are preserved.
- Two side-by-side priority/verdict mini distributions stay compact, with explicit cohort labels.
- Real-time execution totals, measured productivity, per-step completion, approval autonomy, failure rate or confidence shifts are **not** inferred or invented.

The new presentation is intended to minimize initial scanning time without removing evidence: substantive detail still lives in the case investigation.
