# OSCAR supervision workspace — reference-inspired UI iteration

## Intent

The November 2026 references (Mandate's agent approval/risk screens, Reeve's agent autonomy and supervision screens) suggest **operational trust** should be made visible: show what the agent is doing, what evidence exists, and where a person must decide.

This implementation deliberately changes the **actual Overview UI and its interactions**. It is not a palette or token pass, and it does not introduce a fictional permissions service.

## Changed experience

1. **Command center hierarchy.** The page header is followed by one compact four-metric strip; each metric retains its exact existing queue destination. The agent-work and human-review panels now sit together in an explicit Operations section.
2. **OSCAR run inspector.** The former passive accordion becomes a master-detail view. Select a run to inspect its supplied phase tracker, summary, host, and source elapsed value (or explicitly labeled case age). Run selections are keyboard-operable, single-select, dismissible, and have a real deep link to the case.
3. **Decision inbox.** Each human-review row now puts identity, priority, verdict, next action, and a direct **Review investigation** link together. Existing quick preview and escalations/recovery stay available.
4. **Responsive density.** The run inspector uses container queries so it only becomes two columns when the panel itself has room. The decision queue uses a narrow two-column table instead of squeezing four columns at laptop widths.
5. **The visual focus** is a single near-black OSCAR activity header with restrained mint details. Cards and data sections continue to use existing global theme and semantic tokens; there is no broader theme change.

## Data contract / honesty

- Existing aggregate counts come from `operations`; sample records come from `monitoredInvestigations` and `attentionCases`. A four-item run list is **not** presented as exhaustive for the eight-running snapshot.
- Phase rails and `InvestigationProgress` use only `investigationPhases` supplied on each case. Missing states are unknown, never inferred to be complete.
- A supplied elapsed string is labeled *Elapsed*. For cases without one, the UI shows *Case age*, not an invented run clock.
- No automatic approvals, pause/retry controls, agent permission changes, confidence trend, risk reduction, or undo guarantee is displayed or implied.
- This is a **read-only demonstration**: action links navigate into existing screens; they do not execute containment or approvals.

## Reviewer walkthrough

- Open `/platform/overview` on mobile (390px), laptop (1280px), and desktop (1440px+), in both light/dark modes.
- Select `FM-1042`, inspect the known active phase, and open the corresponding case.
- Select `FM-1050`; correlation remains an unmapped phase, so all five phases should read as unrecorded. Select again to collapse.
- Use the four snapshot metrics to open filtered queues; use direct review links to open actual case routes.
- Expand Escalations & recovery, then open a quick preview. The existing report period selector and charts should remain unchanged.

## Follow-up work that requires real backend data

Before building a Reeve-style permissions/autonomy center, obtain actual agent action categories, risk tiers, policy grants, expiration/review dates, per-action approval records, rollback semantics, and reliable run event histories. They should be modeled as domain data and enforced server-side rather than decorative frontend switches.
