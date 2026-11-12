# FortMind Home — decision-first refinement

## Goal

Home is a triage entry point, not a second detailed investigation workspace. Its highest-priority job is to surface the next analyst decision and link to the Cases queue.

## Layout contract

- Keep the four linked snapshot metrics and Operations / Impact navigation.
- **Needs your attention:** show three source-backed sample cases, sorted urgent first and oldest within priority. Keep title-triggered quick preview, next-action excerpt, age, and direct investigation link. The entire queue remains in Cases.
- **OSCAR working:** replace the nested master/detail timeline with three compact recorded run summaries. The top metric keeps the full snapshot running count. No live telemetry or invented phase-completion claims.
- **Priority / Verdict mix:** separate semantic labels and counts from proportional bars. Use `bg-illustration` for the fill only; retain original priority/verdict icon colors. The track remains neutral.
- Keep detailed timeline and investigation evidence in their respective Case pages; the existing lifecycle component remains available to those future views, but is not rendered on Home.

## Palette contract

Dark-mode `--illustration` is `#3B3E41` (precision-safe `oklch(0.362106 0.006573 248.01)`). In light mode it aliases `--border-strong`. Existing background `#080A0A`, surface `#0F1010`, border `#252727`, and brand colors are unchanged.

## QA

Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Check both themes at 390px and 1440px. For browser preview verification, run `PREVIEW_ORIGIN=http://localhost:3000 node scripts/overview-browser-check.mjs` with Playwright available. Confirm keyboard access for quick previews and full investigation links.
