# FortMind platform prototype

Next.js App Router, TypeScript, Tailwind v4 and shadcn/ui with Base UI. The marketing page stays at `/`; the application starts at `/platform` and redirects to `/platform/overview`.

```bash
pnpm install
pnpm dev
```

Open [the platform](http://localhost:3000/platform). See [platform structure and validation](docs/platform-structure.md) for the route map, fixture boundaries and cleanup record.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

Browser suites use an externally available Playwright installation. Set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path and, if necessary, `PLAYWRIGHT_EXECUTABLE` to the Chromium executable. No browser dependency is added to the application.

```bash
PLATFORM_ORIGIN=http://localhost:3000 node scripts/platform-browser-check.mjs
PLATFORM_ORIGIN=http://localhost:3000 node scripts/sections-browser-check.mjs
PREVIEW_ORIGIN=http://localhost:3000 node scripts/case-queue-browser-check.mjs
CASE_PREVIEW_URL=http://localhost:3000/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c node scripts/case-overview-browser-check.mjs
PREVIEW_ORIGIN=http://localhost:3000 node scripts/semantic-browser-check.mjs
```

The platform uses local demonstration data. Newly created cases are stored in the current browser tab's session storage; they survive refresh but are not shared or saved to a server. Knowledge facts and the seven Settings forms persist in this browser's local storage with explicit save feedback. Reports use illustrative events attached to existing case IDs and support CSV export. Integration tests and verdict reviews remain illustrative local interactions. Notification delivery, organization policy enforcement, secret management, response execution and PDF export require backend services and are shown as unavailable.
