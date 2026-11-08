export const caseSectionGroups = [
  {
    id: "decision",
    label: "Decision",
    purpose: "What did OSCAR conclude, why, and what needs my decision?",
    sections: [
      { id: "conclusion", label: "Conclusion" },
      { id: "how-oscar-decided", label: "How OSCAR decided" },
    ],
  },
  {
    id: "investigation",
    label: "Investigation",
    purpose: "What happened, and what did OSCAR discover?",
    sections: [
      { id: "findings", label: "Findings" },
      { id: "hypotheses", label: "Hypotheses" },
      { id: "attack-path", label: "Attack path" },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    purpose: "What technical information supports the investigation?",
    sections: [
      { id: "entities", label: "Entities" },
      { id: "evidence", label: "Evidence" },
      { id: "similar-cases", label: "Similar past cases" },
    ],
  },
  {
    id: "response",
    label: "Response",
    purpose: "What needs to happen next, and what has the analyst recorded?",
    sections: [
      { id: "actions", label: "Actions" },
      { id: "analyst-notes", label: "Analyst notes" },
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    purpose: "What happened, in what order, and when?",
    sections: [{ id: "timeline", label: "Timeline" }],
  },
] as const;

export type CaseCategoryId = (typeof caseSectionGroups)[number]["id"];
export type CaseSectionId = (typeof caseSectionGroups)[number]["sections"][number]["id"];
export type CaseViewSelection = { tab: CaseCategoryId; view: CaseSectionId };

export const overviewSectionIds: readonly CaseSectionId[] = caseSectionGroups.flatMap(
  (group) => group.sections.map((section) => section.id),
);

export function caseViewForSection(view: string): CaseViewSelection | undefined {
  for (const group of caseSectionGroups) {
    const section = group.sections.find((section) => section.id === view);
    if (section) return { tab: group.id, view: section.id };
  }
}

/** A view belongs to one category; invalid combinations use that category's first view. */
export function resolveCaseView(params: Pick<URLSearchParams, "get">): CaseViewSelection {
  const tab = params.get("tab");
  const view = params.get("view");
  if (!tab && view) {
    const selection = caseViewForSection(view);
    if (selection) return selection;
  }
  const group = caseSectionGroups.find((group) => group.id === tab) ?? caseSectionGroups[0];
  const section = group.sections.find((section) => section.id === view) ?? group.sections[0];
  return { tab: group.id, view: section.id };
}

/** Compatibility for the existing section, finding, entity, and review permalinks. */
export function caseViewForTarget(target: string): CaseViewSelection | undefined {
  const section = caseViewForSection(target.replace(/-heading$/, ""));
  if (section) return section;
  const group = caseSectionGroups.find((group) => `case-category-${group.id}` === target);
  if (group) return { tab: group.id, view: group.sections[0].id };
  if (target === "decision-heading") return { tab: "decision", view: "conclusion" };
  if (target.startsWith("finding-")) return { tab: "investigation", view: "findings" };
  if (target.startsWith("entity-")) return { tab: "evidence", view: "entities" };
}
