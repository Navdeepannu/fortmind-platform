import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";

const { usefulEntities, caseTimestamp, relativeCaseAge, caseNextAction } = loadProjectModule("lib/case-context.ts");

test("context omits absent values and fixture placeholders without discarding supplied technical values", () => {
  assert.deepEqual(usefulEntities({ entities: {
    hostname: "Not supplied", ip: "n/a", user: "  ", process: "unknown", domain: "cdn.example", file: "/tmp/payload", hash: undefined,
  } }), [["domain", "cdn.example"], ["file", "/tmp/payload"]]);
});

test("relative fixture ages do not invent absolute timestamps", () => {
  for (const value of [undefined, "", "not a date", "2026-11-06T12:00:00", "2026-99-99T00:00:00Z"]) assert.equal(caseTimestamp(value), null);
  assert.equal(relativeCaseAge(4, "en-US"), "4 minutes ago");
  assert.equal(relativeCaseAge(186, "en-US"), "3 hours ago");
  assert.equal(relativeCaseAge(1440, "en-US"), "1 day ago");
});

test("supplied absolute instants retain seconds and localize across daylight saving changes", () => {
  const winter = caseTimestamp("2026-11-06T17:53:36Z", "en-US", "America/Toronto");
  assert.equal(winter.iso, "2026-11-06T17:53:36.000Z");
  assert.match(winter.date, /Friday, November 6, 2026/);
  assert.match(winter.time, /12:53:36 PM Eastern Standard Time/);
  assert.match(caseTimestamp("2026-07-06T17:53:36Z", "en-US", "America/Toronto").time, /1:53:36 PM Eastern Daylight Time/);
});

test("next actions preserve supplied wording while a closed case never implies a pending decision", () => {
  assert.equal(caseNextAction({ status: "Needs you", recommendedNextAction: "  Verify the supplied change request. " }), "Verify the supplied change request.");
  assert.equal(caseNextAction({ status: "Closed", recommendedNextAction: "Review this stale recommendation" }), "No analyst decision is pending.");
  assert.match(caseNextAction({ status: "Failed" }), /Review the investigation failure/);
});
