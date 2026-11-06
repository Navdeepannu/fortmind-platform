export const factCategories = ["Internal subnets", "Approved software", "Known accounts", "Investigation guidance"] as const;
export type FactCategory = (typeof factCategories)[number];
export interface TaughtFact { id: string; category: FactCategory; content: string; author: string; createdAt: string; updatedAt: string; usedInCases: number; retired: boolean }
// Preserved from the supplied Knowledge reference, not a verified network policy.
export const demoFacts: TaughtFact[] = [{ id: "reference-internal-subnets", category: "Internal subnets", content: "10.0.0.0/8 is our internal address range; traffic between hosts inside it is expected.", author: "Zero One", createdAt: "2026-09-23T17:54:00-04:00", updatedAt: "2026-09-23T17:54:00-04:00", usedInCases: 0, retired: false }];
export function validFacts(value: unknown): value is TaughtFact[] {
  return Array.isArray(value) && value.length <= 500 && new Set(value.map(item => item?.id)).size === value.length && value.every(item => item && typeof item.id === "string" && typeof item.content === "string" && item.content.trim().length >= 10 && item.content.length <= 2000 && factCategories.includes(item.category) && typeof item.author === "string" && typeof item.retired === "boolean" && Number.isInteger(item.usedInCases) && item.usedInCases >= 0 && Number.isFinite(Date.parse(item.createdAt)) && Number.isFinite(Date.parse(item.updatedAt)));
}
