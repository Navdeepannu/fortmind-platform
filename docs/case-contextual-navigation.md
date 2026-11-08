# Case contextual navigation

The full investigation at `/platform/cases/case-detail` and `/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c` reuses all 11 existing view components. It renders one active subsection, rather than a category's sections in a scrolling document.

| Primary tab | Secondary views |
| --- | --- |
| Decision | Conclusion; How OSCAR decided |
| Investigation | Findings (5); Hypotheses (2); Attack path |
| Evidence | Entities (4); Evidence (5); Similar past cases (2) |
| Response | Actions (4); Analyst notes |
| Timeline | Timeline directly; no secondary tablist |

`lib/case-sections.ts` owns the hierarchy, valid URL selections, and legacy anchor mapping. `lib/platform-routes.ts` builds view URLs while preserving the case route and unrelated query parameters. `CaseCategoryTabs` reads App Router `useSearchParams`; Next.js's supported History API updates change local query state without fetching the case again or remounting forms. Its server composition has a local Suspense boundary so the shared header remains available while URL state resolves.

Examples: `?tab=investigation&view=hypotheses`, `?tab=decision&view=how-oscar-decided`, `?tab=evidence&view=entities#entity-host-fmlab-ws1`. Missing parameters open Decision / Conclusion. A category without a compatible view opens its first view. An unknown category falls back to Decision. A valid view supplied without a category infers its category. Legacy `#findings`, `#finding-memory-access`, `#decision-heading`, and `#case-category-response` links are normalized with `replaceState`, preserving their technical target. Ordinary tab changes clear stale fragments and create one history entry.

Both tab levels use existing shadcn/Base UI Tabs with line styling. Hidden panels remain mounted and inert, preserving local verdict review, unsaved rationale, and finding disclosures. Each tablist supports arrow keys, Home/End, and Tab into its panel. Mobile tablists scroll horizontally and bring the active tab into view; the document owns vertical scrolling. Tables retain their existing accessible horizontal overflow regions.

The shared header keeps case identity, full incident description, workflow, priority, verdict, completion, and technical metadata. Stage scores remain in the decision and handoff views, and assignment is shown once in the shared header. The desktop human decision panel stays within Conclusion and remains reachable through the primary bar's Review verdict action at all widths. Recommended responses retain their approval requirement and are never presented as executed actions.

Hypothesis support and limitations split the existing explanations without adding claims, hypotheses, thresholds, or scores. Findings retain native expandable technical detail, and the existing identifier-copy control is reused in Attack path. The fixture, raw-evidence limitations, historical timeline, local-only decisions, and disabled backend-dependent actions retain their previous boundaries.

Validation: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and a production build. `scripts/case-overview-browser-check.mjs` verifies all views, URL fallback/history/refresh, legacy links, review drafts and safeguards, copy controls, keyboard navigation, and 12 responsive light/dark layouts. Supply `PLAYWRIGHT_MODULE` and optionally `PLAYWRIGHT_EXECUTABLE` as described in the README.
