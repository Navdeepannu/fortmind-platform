# Case detail — evidence-first information architecture

## Why the former Decision page underperformed
The screenshot-based implementation already grouped eleven source sections under five primary categories. However the landing view was still a giant nested card repeating verdict, confidence, alert summaries, unknowns, and recommendations. An analyst had to read paragraphs before knowing *what is confirmed*, *what is only reported*, and *what to do next*.

This iteration reduces duplication without omitting captured evidence, creating a **briefing → investigation → provenance → response → history** reading sequence.

## Information hierarchy

| Layer | What appears | Action |
| --- | --- | --- |
| Persistent case header | Title, short alert summary, workflow status, priority, proposed verdict, entity identifiers, owner, timestamp, source, MITRE technique | Copy identifiers; choose a case workspace |
| Decision | Proposed verdict, concise assessment, phase confidence context, **finding provenance distribution**, two leading findings, two expandable uncertainty questions, first recommended next step | Confirm/override in local preview, inspect a finding, review response plan |
| How OSCAR decided | Five recorded execution phases, stage scores, exact handoff explanation and source times | Distinguish completed investigation from human-required case decision |
| Findings | Concern / unresolved context / missing corroboration groups, compact summary rows, expandable interpretation and provenance | Deep link into specific findings |
| Hypotheses | Side-by-side competing explanations with evidence for and against, agent score clearly marked *not probability* | Compare alternatives without implying either is verified |
| Attack path | Vertical-mobile / horizontal-desktop alert-reported user → process → target chain, explicit unverified label | Copy identifiers and review linked source finding |
| Entities | Responsive grouped entity cards instead of a 750px-wide table | Copy source identifiers; inspect their relationships and query sources |
| Evidence | Lookups grouped by actual source (Wazuh, Elasticsearch, Entra ID); keep each captured result unmodified | Read provenance without lateral scroll |
| Response | Numbered proposals with conditional actions called out; **Not executed** on each | No simulated approval/containment |
| Timeline | Latest five events by default, remaining seven behind native disclosure | Review full historical activity when required |

## Data integrity and security

- The data model (`CaseOverviewData`) is unchanged. Every displayed count or observation comes from existing fixture fields.
- The provenance strip is counts of **finding types**, not a risk/confidence score: one unverified alert report, two tool results, two lookups without corroboration in the example case.
- "No corroboration" describes the **reported lookup result**; it is not a claim of benign activity.
- "Confirmed affected" in the source screenshot is deliberately not presented as confirmed compromise.
- Stage confidence is a **phase assessment**, not a verdict probability; hypothesis scores are similarly labeled non-probabilistic.
- The decision UI remains local preview only. No network mutations, real approvals, isolation, containment or privilege changes were added.
- Source case `13845102-e81a-479e-87db-2cdb8ff21c1c` is a pre-confirmation reconstruction from the supplied screenshot. Historical later analyst activity is preserved in Timeline without changing the preview case status.
- Direct links to the original findings, actions and tabs retain canonical hashes and query-driven workspace selection.

## Layout and accessibility

- Preserve **Decision / Investigation / Evidence / Response / Timeline** and the existing eleven subviews. No new navigation level.
- Use one consistent section/card component with tighter padding and smaller descriptions.
- Keyboard-accessible native `details` for source findings, unresolved questions, review rationale and older timeline events.
- No viewport-wide table overflow on Entities/Evidence. Attack path reflows vertically on narrow widths.
- No additional chart/UI dependencies. Reuse semantic tokens and existing components.

## QA

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- `node scripts/case-overview-browser-check.mjs` — both themes and 320/390/900/1280/1440/1920px with sidebar expanded/collapsed
- `node scripts/content-width-browser-check.mjs`
- Check exact counts: 5 findings (2 concern + 1 context + 2 no corroboration), 2 hypotheses, 4 entities, 5 evidence results across 3 sources, 4 proposed actions, 12 legible events
- Verify `#finding-memory-access` and `#entity-host-fmlab-ws1` direct links, review-dialog persistence, copy actions, and top-bar Cases ancestor navigation.
- Visually verify sticky tabs, sticky decision rail, dark/light and especially 320px width before merging.

Scope: detailed screenshot-derived case page; standard `FM-*` details, Cases queue, Overview, and all backend behaviors remain unchanged.
