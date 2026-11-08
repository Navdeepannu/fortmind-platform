import type { SecurityCase } from "./preview-data";

export const entityLabels: Record<string, string> = {
  hostname: "Host",
  ip: "IP address",
  user: "User",
  hash: "File hash",
  file: "File",
  command: "Command",
  domain: "Domain",
  process: "Process",
};

export function usefulEntities(item: Pick<SecurityCase, "entities">) {
  return Object.entries(item.entities).filter(
    ([, value]) =>
      value?.trim() &&
      !/^(?:not supplied|not available|unknown|n\/a|-|—)$/i.test(value.trim()),
  );
}

// Workflow guidance is not an inferred OSCAR finding or an executable response action.
export function caseNextAction(
  item: Pick<SecurityCase, "status" | "recommendedNextAction">,
) {
  if (item.status === "Closed") return "No analyst decision is pending.";
  return (
    item.recommendedNextAction?.trim() ||
    {
      "Needs you":
        "Review OSCAR’s findings and confirm or override the proposed verdict in the full investigation.",
      Escalated:
        "Review the escalation and coordinate the next decision with the case owner.",
      Failed:
        "Review the investigation failure before deciding whether to retry.",
      Running:
        "OSCAR is investigating. Review the available evidence while the investigation continues.",
      Queued:
        "Waiting for the investigation to start. Review the supplied context in the full investigation.",
    }[item.status]
  );
}

export function relativeCaseAge(minutes: number, locale?: string) {
  const value = minutes < 60 ? minutes : minutes < 1440 ? Math.floor(minutes / 60) : Math.floor(minutes / 1440);
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(
    -value,
    minutes < 60 ? "minute" : minutes < 1440 ? "hour" : "day",
  );
}

// Call only with a supplied timestamp. Never manufacture an instant from ageMinutes.
export function caseTimestamp(
  timestamp?: string,
  locale?: string,
  timeZone?: string,
) {
  if (!timestamp || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp)) return null;
  const value = new Date(timestamp);
  if (!Number.isFinite(value.getTime())) return null;
  return {
    iso: value.toISOString(),
    date: new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeZone,
    }).format(value),
    time: new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "long",
      timeZone,
    }).format(value),
  };
}
