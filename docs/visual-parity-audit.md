# FortMind visual parity audit — November 11, 2026

## Reference and verification boundary

- **Uploaded reference screenshot:** a dark-mode Cases queue with a persistent contextual case-preview panel. The panel has compact case ID/state controls, step-by-step OSCAR lifecycle cards, a review handoff, a bounded case metadata section and a direct "Open case" action.
- **Confirmed from the supplied screenshot only:** left/right master-detail layout, thin 1px borders, compact typography, subdued neutral surfaces, no decorative gradients, clear status text with modest semantic dots, and a vertically linked activity sequence.
- **Not verified:** authenticated production HTML, real component behavior, keyboard shortcuts, screen widths, actual lifecycle events or timestamps, responsive layouts, or the production light-mode presentation. Direct access to `https://platform.fortmind.ai/dashboard/cases/overview` was unavailable.
- **Foundation:** this change is stacked on `design/client-reference-alignment-2026-11`, where Home Operations/Impact tabs, shell, Cases, Case Detail, Reports and Settings alignment are being implemented separately. Its contents are **not** independently tested in this branch.

## This branch: OSCAR run preview

| Reference observation | Implementation | Status |
| --- | --- | --- |
| Queue item reveals an adjacent contextual inspector | Existing `ActiveInvestigations` master-detail component displays a selected run | Reused |
| Reviewer sees recorded lifecycle at a glance | `OscarCaseLifecyclePreview` renders Intake / Plan / Collect / Analyze / Report using `investigationProgress` | Added |
| Timeline shows case intake | "Alert received" only for a SIEM webhook, otherwise "Case created"; timestamp explicitly unavailable | Added, fixture-grounded |
| Step cards show semantic completion or errors | State text + icon + semantic token: Done, In progress, Pending, Failed, Not recorded | Added |
| Review handoff appears after lifecycle | Displays actual fixture state: investigating, needs review, escalated, failed, closed or queued | Added |
| Case details appear in a bordered group | Host, priority, provisional vs recorded verdict, owner and context summary | Added |
| Preview links directly to full investigation | Uses the existing `caseHref(item.id)` helper | Preserved |
| Selecting a run does not obscure the queue | Side-by-side inspector at wider container widths; stacked presentation on smaller containers | Refined |
| Screenshot shows a production verdict score and event timestamps | No invented score, timestamp, event duration or fictitious completed phases | Deliberate deviation |

The first recorded run is selected by default so the Home Operations tab communicates what OSCAR is doing immediately. All data remains **synthetic demonstration data**. Case age is not presented as review waiting time. A current phase does not imply that previous phases completed.

## Outstanding visual QA and integration gates

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` and any existing browser scripts from a checked-out repository.
2. Compare the existing Home tabs and case layout at 390, 768, 1280, 1440 and 1920 CSS pixels in both themes, including selected/closed inspector states and long IDs/hostnames.
3. Confirm keyboard selection, focus indicators, screen-reader lifecycle announcements and adequate contrast of semantic icons and muted text.
4. Review the alignment branch's Home tab URL/back-forward behavior; its current implementation uses local tab state.
5. Recheck the source alignment branch before merging; this PR is stacked so ongoing agent edits are not overwritten.
6. Confirm preview builds in Vercel or the configured deployment system. A successful GitHub file write alone does not establish deployment success.

No real customer case IDs, credentials or production incident contents were committed.
