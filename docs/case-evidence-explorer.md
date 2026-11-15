# Case details: evidence explorer and location hierarchy

## Observed problem

At 1394px wide with the global sidebar collapsed, the existing case workspace used a short contextual rail but an extremely wide Findings card with three nested group headers, repeated status copy and long expanded interpretation. The title and global breadcrumb also referred to “Investigation” without identifying the actual preview case or the selected subview. This makes it difficult to answer *which case? which view? what do we know? and what is the next meaningful action?*

## References reviewed

- [Tailark documentation](https://tailark.com/docs): its block catalog is primarily marketing sections, feature/bento, statistics and page kits; importing a full block would fight the FortMind design system, so **no Tailark component or CSS bundle was installed**.
- [shadcn/ui blocks](https://ui.shadcn.com/blocks): constrained sidebar/navigation, responsive workspace sections and tables; patterns were adapted using existing project components.
- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/base/collapsible): progressive disclosure and keyboard-accessible detail content.
- [Radix Themes Data List](https://www.radix-ui.com/themes/docs/components/data-list): one clear key–value set instead of repeated descriptions; inspiration for source and limitation details.
- [Vercel dashboard navigation](https://vercel.com/changelog/dashboard-navigation-redesign-rollout): consistent scoping and de-emphasized secondary navigation.
- [Geist Tabs guidelines](https://vercel.com/geist/tabs): only sibling primary views use tabs; contextual navigation belongs in a quieter local control.

## Implemented

### 1. Location always visible

- Global top-bar preview crumb now reads `Workspace / Cases / Case 13845102`, derived from the actual fixture ID, instead of `Workspace / Cases / Investigation` (which duplicated a primary tab).
- All eleven detail sections gain a consistent overline with **category and view position** (`INVESTIGATION · 01 / 03`), above a concise noun title.
- Context rail identifies its parent category, shows the number of subviews and uses a small left selection marker rather than another competing underline row.

### 2. Evidence explorer

- A compact index shows all five actual source findings. Each row contains one title, a source-status label and severity only for relevant concern findings.
- Four evidence-relevance filters: **All (5), Concern (2), Unresolved (1), Not corroborated (2)**. Counts come from the same fixture. Filtering affects presentation only, never case conclusions.
- Selection reveals one clearly labeled **interpretation and limits** area, the recorded source and a conservative interpretation of evidentiary limits. No invented risk scores or new backend telemetry.
- Desktop/container >=720px: compact list and adjacent inspector.
- Mobile/narrow case container: the active finding's explanation appears **directly underneath the selected row**, avoiding the need to jump to a detached panel.
- Existing `#finding-*` anchors, source-reference links, browser history, and URL-driven tab/view navigation remain valid. A finding link after filtering reselects its target and restores All, even though `pushState` does not natively emit `hashchange`.
- The index is an accessible set of buttons with pressed state; all filters are native buttons. No hover-only functionality.

### 3. Decision content

- The two concern signals on the Decision tab are now compact linked cards instead of long duplicated provenance rows. The source-status distribution still shows one alert-only claim, two tool-result records and two missing-corroboration records.
- Existing local-only verdict review, proposed assessment, open questions, and action plan remain unchanged.

## Evidence integrity

- **Alert-only** = reported, not independently verified.
- **Tool result** = a recorded lookup result, not proven causal relationship.
- **No matching records** = no hits in the supplied lookup window, not evidence that the incident is benign.
- Severity is attached to the recorded finding, not converted into a fake AI confidence score.
- `FindingExplorer` is read-only: no mutation, containment, approval, retry or assignment operations.

## Review / QA

1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
2. `node scripts/case-overview-browser-check.mjs`: 11 tabs, 5 findings, filter counts, single desktop inspector, mobile inline disclosure, source deep links after filtering, history, local verdict modal, screenshot snapshots.
3. `node scripts/content-width-browser-check.mjs` and `node scripts/topbar-breadcrumb-browser-check.mjs`.
4. Inspect light/dark at **320/390/900/1280/1440/1920px**, especially collapsed sidebar at 1920px and narrow mobile case container.
5. Confirm no horizontal page overflow; focus and keyboard interactions; source disclaimer remains visible.

Stack this PR on the case-detail navigation PR (#10), then rebase to main once the preceding PRs have landed. Keep draft until browser QA.
