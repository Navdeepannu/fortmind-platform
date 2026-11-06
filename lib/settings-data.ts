import { assumedMinutesPerAutonomousClosure } from "./overview-data";

export const notificationTypes = [
  {
    id: "review",
    name: "Needs Review",
    description: "A case requires an analyst’s decision.",
  },
  {
    id: "assigned",
    name: "Assigned to You",
    description: "You become responsible for a case.",
  },
  {
    id: "finished",
    name: "Finished",
    description: "An investigation reaches a conclusion.",
  },
  {
    id: "team",
    name: "Handed to Your Team",
    description: "A case is routed to your team.",
  },
  {
    id: "failed",
    name: "Failed",
    description: "An investigation cannot finish.",
  },
  {
    id: "held",
    name: "Held Alerts",
    description: "Alert intake needs attention.",
  },
  {
    id: "weekly",
    name: "Weekly Report",
    description: "A weekly summary of workspace activity.",
  },
] as const;
export type NotificationType = (typeof notificationTypes)[number]["id"];
export type EmailFrequency = "off" | "immediate" | "daily";
export interface SettingsValues {
  investigations: {
    mode: "observe" | "confirm";
    analyze: number;
    report: number;
    autoClose: number;
    timeout: number;
    memory: number;
  };
  alerts: { repeatDetection: boolean; window: number; excludedRules: string };
  escalation: { enabled: boolean; recipients: string[] };
  responses: { mode: "off" | "measure" };
  spend: { dailyBudget: number; analystMinutes: number; autonomyGoal: number };
  notifications: {
    preferences: Record<
      NotificationType,
      { inApp: boolean; email: EmailFrequency }
    >;
  };
}
export const settingsDefaults: SettingsValues = {
  investigations: {
    mode: "confirm",
    analyze: 80,
    report: 80,
    autoClose: 95,
    timeout: 15,
    memory: 10,
  },
  alerts: { repeatDetection: true, window: 60, excludedRules: "" },
  escalation: { enabled: true, recipients: [] },
  responses: { mode: "measure" },
  spend: {
    dailyBudget: 50,
    analystMinutes: assumedMinutesPerAutonomousClosure,
    autonomyGoal: 80,
  },
  notifications: {
    preferences: Object.fromEntries(
      notificationTypes.map((item) => [
        item.id,
        { inApp: item.id !== "weekly", email: "off" },
      ]),
    ) as SettingsValues["notifications"]["preferences"],
  },
};
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const number = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
export const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
export const settingsValidators: {
  [K in keyof SettingsValues]: (value: unknown) => value is SettingsValues[K];
} = {
  investigations: (value): value is SettingsValues["investigations"] =>
    object(value) &&
    ["observe", "confirm"].includes(String(value.mode)) &&
    [value.analyze, value.report, value.autoClose].every((n) =>
      number(n, 0, 100),
    ) &&
    number(value.timeout, 1, 120) &&
    number(value.memory, 0, 100),
  alerts: (value): value is SettingsValues["alerts"] =>
    object(value) &&
    typeof value.repeatDetection === "boolean" &&
    number(value.window, 1, 1440) &&
    typeof value.excludedRules === "string" &&
    value.excludedRules.length <= 4000,
  escalation: (value): value is SettingsValues["escalation"] =>
    object(value) &&
    typeof value.enabled === "boolean" &&
    Array.isArray(value.recipients) &&
    value.recipients.length <= 20 &&
    value.recipients.every(
      (email) => typeof email === "string" && validEmail(email),
    ) &&
    new Set(value.recipients).size === value.recipients.length,
  responses: (value): value is SettingsValues["responses"] =>
    object(value) && ["off", "measure"].includes(String(value.mode)),
  spend: (value): value is SettingsValues["spend"] =>
    object(value) &&
    number(value.dailyBudget, 1, 100000) &&
    number(value.analystMinutes, 1, 480) &&
    number(value.autonomyGoal, 0, 100),
  notifications: (value): value is SettingsValues["notifications"] =>
    object(value) &&
    object(value.preferences) &&
    notificationTypes.every((item) => {
      const pref = (value.preferences as Record<string, unknown>)[item.id];
      return (
        object(pref) &&
        typeof pref.inApp === "boolean" &&
        ["off", "immediate", "daily"].includes(String(pref.email)) &&
        (item.id !== "weekly" ||
          (pref.inApp === false && pref.email !== "daily"))
      );
    }),
};

// Explicitly synthetic spend; it is not a provider bill or current account usage.
export const demoSpend = {
  date: "2026-11-05",
  amount: 0.14,
  currency: "USD",
} as const;
