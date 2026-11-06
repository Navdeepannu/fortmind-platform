# Case investigation workspace preview

> Historical design/validation record. For current routes, file locations and checks, see [platform structure](platform-structure.md).

Route: `/design-preview/cases/lsass-memory-access`

The preview uses the existing FortMind sidebar, shadcn components, Inter and Geist Mono, theme tokens, and screenshot-derived case fixture. The production case detail route and live case services are untouched.

## Current composition

- The header separates the case title and incident description from priority, lifecycle status, OSCAR's proposed verdict, investigation completion, and technical metadata. The case ID, MITRE ID, and entity identifiers have copy controls.
- Conclusion places OSCAR's proposal, stage confidence, two linked evidence summaries, uncertainty, recommendations, and one analyst decision entry point together. The decision is local page state only. It does not close a case, execute a response, or train OSCAR.
- Entities use aligned rows for host, user, initiating process, and target process. Relationships and query sources remain distinct. The source's “Confirmed affected” label is not interpreted as confirmed compromise.
- Similar past cases use compact comparable references. The screenshot does not supply historical IDs or URLs, so the preview labels them unavailable and does not fabricate direct links. The typed contract accepts `caseId` and `href` once real data is available.
- Findings are five source-specific records. The original critical and high findings remain separate from the three low-severity user, Wazuh, and Entra checks. Collapsed rows show summary, evidence state, and relationship to OSCAR's conclusion. Native disclosure exposes source/provenance and the full explanation.
- How OSCAR decided distinguishes AI investigation completion from case workflow status, gives received/concluded times, and shows confidence by stage. The source gives received and concluded timestamps, not a distinct investigation-start timestamp.

The right “On this page” navigation has five real anchors in document order. The configuration retains all eleven future section destinations and enables them only when rendered. It stays sticky at 1440px and 1280px with the expanded app sidebar. A container query changes it to a horizontal strip when workspace width falls below 1000px or a future inspector reserves the right side. Active links follow scrolling, anchors keep the sticky offset, and reduced-motion preferences are respected.

`InvestigationSection` now gives all five sections the same external heading, optional description/count/metadata/actions, a 14px heading-to-surface gap, and a subtly bordered content surface. Overview and Investigation are separated with a restrained group divider. Internal layouts remain specific to the data: the entities table has aligned rows, similar cases share one container, and finding details use an elevated disclosure panel. The conclusion retains a distinct decision area and recommendations footer. Future sections can reuse the outer system without inheriting one interior layout.

The preview scopes its canvas, surface, elevated surface, border, separator, and secondary text colors to the case workspace. These are mixed from the existing shadcn theme variables, keeping the global sidebar and navigation tokens unchanged. In dark mode, the actual rendered canvas, card, and decision panel have progressively lighter surfaces; the light theme uses the same hierarchy with softer separation.

## Data boundaries

This is a reconstructed snapshot before the later analyst confirmation visible in the supplied screenshots. Assignment to `navdeepannu0` follows the latest visible “Took this case” event. Analyze and Report confidence are 70 (Medium); Plan is 90 (High). The source conflicts on the numeric autonomy threshold, so the UI states only that OSCAR's threshold was not met. Scores are not shown as verdict probabilities.

The LSASS access remains an alert-reported attempt with no independent process or memory confirmation. Elasticsearch returned six active host alerts and one user hit; the content of those records is not available in the capture. Wazuh returned no recent host/user alerts, and Entra matched no sign-ins. These results do not establish benign activity or compromise. The related investigations share `fmlab-ws1`; their analyst outcomes are unknown.

## Verification, November 3, 2026

- This section refinement passes `pnpm typecheck`, `pnpm lint`, `pnpm test:preview` (16 tests), `pnpm build --webpack`, and `git diff --check` in the workspace. The production build needed network access to fetch the project's existing Inter and Geist Mono fonts.
- The revised page was inspected in rendered 1440px and 1600px light/dark captures, plus 1280px dark and a full-page light capture. At 1600px the main document is 1090px wide. At 1440px and 1280px with the sidebar expanded, it is 930px and 770px wide. No horizontal overflow was found.
- The existing Playwright suite passed ten light/dark layouts, five finding disclosures, copy feedback, sticky anchors and active-section tracking, and the local confirm/correct/cancel/Escape verdict flow. Eleven axe scans reported zero WCAG A/AA violations. No mutation requests or browser runtime errors were recorded. Current captures are in `docs/screenshots/case-section-refinement/`.

## Changed in this refinement

- `components/fortmind/case-overview/investigation-section.tsx`: one reusable external section heading and contained surface.
- `components/fortmind/case-overview/case-overview.tsx`: Overview and Investigation grouping without changing case content or interactions.
- `app/design-preview/cases/case-overview.css`: scoped light/dark surface hierarchy, consistent section spacing, table separators, shared similar-case container, and distinct expanded finding panels.
- `docs/case-overview-preview.md` and `docs/screenshots/case-section-refinement/`: updated implementation notes and visual evidence.

The entity inspector, full investigation graph, technical evidence explorer, response approval workflow, and remaining complex sections are outside this iteration.
