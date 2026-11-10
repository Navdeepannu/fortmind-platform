# Cases — alternate workflow board

## Scope and design rationale

A **List / Board** switch now sits immediately after the existing filter and display controls in the Cases toolbar. List is the initial presentation and retains the existing DOM, columns, sorting, pagination, quick preview, export, selection, and work-view tabs.

The Board presents the **same filtered data**, grouped into four operational lanes. It is a read-only alternate view, not a second workflow manager or a new status API.

| Board lane | Raw case statuses | Why |
| --- | --- | --- |
| Needs attention | Needs you, Escalated | Human decisions and escalations require action |
| In progress | Running, Queued | Work in progress vs work awaiting execution; each raw status remains visible |
| Closed | Closed | Terminal case state; `closedByOscar` remains explicit attribution |
| Failed | Failed | Processing failures need diagnosis/recovery |

Grouping preserves the underlying status of Escalated and Queued. Each case card includes its ID, age (explicitly **case age**), title, host, priority, verdict, owner, an optional supplied next action for attention/failure, preview, and investigation link. Priority sorts ahead of age within each lane. No timer, confidence threshold, permissions, status transitions, or automated actions are invented.

### Switching semantics

- On **Board**, the workspace selects `All cases` and removes the status constraint so all four lanes are useful. Search, verdict, priority, owner, source and autonomous filters stay active.
- On **List**, the previously chosen work view and status constraint are restored. Table density, columns and sorting were not reset.
- Existing work-view tabs remain in place. Replacing them with status tabs would remove useful **Assigned to me / Unassigned / Needs attention** workflows and is unnecessary because the board supplies the status perspective.
- The default list remains unchanged; board-only elements are not mounted there.
- The board is horizontally scrollable at smaller widths instead of compressing cards to illegible sizes.

### Tests

- `node --test scripts/case-board.test.mjs` validates exhaustive status coverage, unique grouping, sorting, and preservation of `Queued` / `Escalated`.
- `scripts/case-board-browser-check.mjs` checks the new toggle, table preservation, board counts, preview, search, responsive layouts, and status-filter restoration in both themes.
- Also run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, plus the existing Cases browser regression scripts.

This is a demo UI over fixtures. No drag-and-drop or status editing is available without authenticated, authorized server-side workflow mutations.
