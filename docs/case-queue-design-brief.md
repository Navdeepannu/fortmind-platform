# FortCases queue: design decision brief

Date: 6 November 2026. Scope: the existing FortMind case list, using its current data and local interactions.

## Decision

Keep the comparison table and compact anchored preview. Replace lifecycle tabs with four neutral work views: **Needs attention, Assigned to me, Unassigned, All cases**. Keep **Verdict** directly accessible beside search. Put **Status, Priority, Owner, Source, and OSCAR closure** in **More filters**. Put density, sorting, column visibility, and export in **View**.

Lead the table with **Case → Verdict → Priority → Status → Owner → Age**, followed by row actions. Optional Source appears at the end. Case titles use one line, with one line of technical context below. Semantic values and scores stay on one line. Headers align to the value text, accounting for the leading icon or badge padding.

This is a product-specific recommendation drawn from the sources below and FortMind's current workflow. The exact labels and column order are our design judgment; the research does not establish a universally best incident table.

## What the research supports

| Primary source | Relevant finding | FortMind implication |
| --- | --- | --- |
| [Microsoft Defender: prioritize incident cases](https://learn.microsoft.com/en-us/defender-xdr/prioritize-incident-cases) | Its current preview separates prioritization, status, ownership, classification, saved filter sets, and configurable columns. | Treat a useful analyst view as a combination of attributes. Preserve priority sorting without requiring priority to be the first visual column. |
| [Jira Service Management: queues](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-queues/) | Queues focus an agent's work using criteria. Common filters remain visible, while additional criteria live under More filters. | Tabs answer recurring work questions; a frequent assessment filter stays directly accessible. |
| [Linear: custom views](https://linear.app/docs/custom-views) | Filtered views support returning to a useful subset of work, with temporary filters applied to that view. | Separate the work scope from the current filter criteria. Use a small, stable set of views rather than one tab per data value. |
| [Elastic: manage cases](https://www.elastic.co/docs/explore-analyze/cases/manage-cases) | Cases can use list or table layouts, with search, filtering, optional fields, and bulk actions. | Keep the table because analysts compare assessment, urgency, state, and responsibility across records. A second list or board is not necessary for this refinement. |
| [IBM Carbon: data tables](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) | Tables support sorting, toolbar controls, batch actions, and progressive disclosure of details. | Keep the main row concise and retain the anchored preview for the additional context needed before opening a case. |

## Work-view definitions

| View | Question answered | Exact inclusion rule |
| --- | --- | --- |
| Needs attention | What needs an analyst intervention? | Needs you, Escalated, or Failed. Failure belongs here because recovery requires attention even when no verdict decision is ready. |
| Assigned to me | What open work do I own? | Owner equals the current prototype analyst and status is not Closed. |
| Unassigned | What open work needs an owner? | No owner and status is not Closed. This includes ongoing or queued investigations so missing responsibility stays visible. |
| All cases | Where can I find any investigation? | Every case, including closed cases. |

These are overlapping shortcuts, not partitions. A failed, unassigned case belongs in both Needs attention and Unassigned. Counts describe the unfiltered scope of each view; the footer describes the filtered result count. Search and filter criteria remain in effect when changing views and remain visible in the toolbar or chips.

The prototype's current analyst can truthfully have zero assigned fixture cases. The implementation shows an empty state instead of inventing an assignment or changing product data.

Existing Running, Closed, and Failed dashboard links open All cases with the matching status filter. The old Needs you link opens the broader Needs attention view. A precise Needs You status remains available in More filters, separately from Escalated. New `?view=attention`, `?view=mine`, `?view=unassigned`, and `?view=all` entry points are supported.

## Why this hierarchy

**Case comes first** because the record needs a stable, meaningful anchor. Its title and technical context explain what the analyst is looking at. Moving Priority out of the leading position does not weaken urgency: the default sort still puts intervention work first, then priority, with existing age tie-breaking.

**Verdict and Priority sit together** but retain different meanings. Verdict is the current assessment; priority is urgency. The verdict score remains the supplied verdict-confidence value and never substitutes investigation confidence. Keeping both avoids implying that a high-confidence benign result must be urgent, or that an inconclusive urgent case can wait.

**Status, Owner, and Age follow** to explain execution state, responsibility, and elapsed time. Status remains visible in every full table row even though it no longer controls the main tabs. It can still be filtered exactly.

**Verdict stays visible as a filter** because comparing malicious, suspicious, benign, and inconclusive assessments is a frequent triage task in this product. This placement follows the user's stated priority; frequency has not been measured through production telemetry. More filters holds the less frequently combined dimensions. Verdict is not repeated as a chip because its selected value is already visible on its control.

## Alternatives considered

| Alternative | Tradeoff | Decision |
| --- | --- | --- |
| One tab per lifecycle status | Easy to understand, but splits intervention across Needs you, Escalated, and Failed and does not answer ownership questions. | Replace with work views; retain status filtering. |
| Verdict tabs | Makes assessment easy to scan, but hides actionable inconclusive cases when users focus on malicious results. | Use Verdict as a visible filter instead. |
| Priority tabs | Supports urgency, but separates context and repeats the priority sort/filter. | Keep urgency in sorting and a column. |
| Kanban by status | Useful for moving tasks between states, but reduces cross-case comparison and suggests workflow transitions that the current case service cannot execute. | Keep the table. |
| Per-case cards as the default | More room for summaries, with fewer comparable cases visible at once. | Use compact previews for summaries instead. |

## Visual and responsive behavior

Tabs and filter controls are neutral. Semantic colors remain inside case assessments and status indicators. The requested OKLCH background and elevated surfaces are unchanged. Sort indicators appear for the current sort, or on header hover/focus, reducing repeated visual noise.

Every data column is left aligned. Header text uses the same value-text baseline as the cells underneath, including the leading space occupied by verdict icons. Verdict scores, status labels, priority, owner, and age do not wrap. Long case titles truncate with their full value available through the link tooltip and compact preview.

At laptop widths, lower-priority columns are progressively hidden to protect the case title. At narrow widths, the existing condensed row presents semantic values beneath the case metadata. Column visibility settings and full investigation details remain available.

## Limits and next validation

No backend, assignment, response execution, or case data changes are introduced. The current analyst identity remains the existing prototype identity. Authenticated identity and persisted personal/shared views should be connected when a real case service exists.

This implementation is verified for filtering, view membership, sorting, selection/export, column visibility, preview behavior, header alignment, and responsive layout in both themes. A production usability study should measure time to locate a case, time to identify the next action, and how frequently Verdict, Status, and Owner are used before adding further permanent controls.
