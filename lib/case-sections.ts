export const caseSectionGroups = [
  { label: "Decision", sections: [{ id: "conclusion", label: "Conclusion" }] },
  { label: "Investigation", sections: [
    { id: "attack-path", label: "Attack path" },
    { id: "hypotheses", label: "Hypotheses" },
    { id: "findings", label: "Findings" },
    { id: "how-oscar-decided", label: "How OSCAR decided" },
  ] },
  { label: "Context and evidence", sections: [
    { id: "entities", label: "Entities" },
    { id: "similar-cases", label: "Similar past cases" },
    { id: "evidence", label: "Evidence" },
  ] },
  { label: "Response & Activity", sections: [
    { id: "actions", label: "Actions" },
    { id: "analyst-notes", label: "Analyst notes" },
    { id: "timeline", label: "Timeline" },
  ] },
] as const;

export type CaseSectionId = (typeof caseSectionGroups)[number]["sections"][number]["id"];

// Keep this order aligned with the rendered investigation document.
export const overviewSectionIds: readonly CaseSectionId[] = [
  "conclusion", "attack-path", "hypotheses", "findings", "how-oscar-decided",
  "entities", "similar-cases", "evidence", "actions", "analyst-notes", "timeline",
];
