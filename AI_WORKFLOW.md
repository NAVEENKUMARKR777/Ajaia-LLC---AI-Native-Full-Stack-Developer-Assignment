# AI Workflow Note

## Tools used

- **Claude Code (Sonnet 4.6)** was used for the entire build: planning,
  scaffolding, implementation, testing, and documentation.

## Where AI materially sped things up

- **Scaffolding boilerplate**: Next.js config files (`tsconfig.json`,
  `tailwind.config.ts`, `postcss.config.js`, Prisma schema/seed), the API
  route handlers, and component shells were generated in one pass per file
  rather than assembled by hand from docs.
- **Repetition across CRUD routes**: the `documents`, `share`, and `upload`
  API routes follow the same auth-check → ownership-check → validate →
  mutate pattern. AI applied that pattern consistently across all routes in
  the same session, which keeps the error-handling shape uniform.
- **Generating realistic seed data** (Tiptap JSON for the demo documents) —
  hand-writing valid ProseMirror JSON trees is tedious; AI produced
  structurally-correct nodes (headings, bold marks, lists) on the first try.
- **End-to-end verification via curl** — instead of relying on "it should
  work," AI logged in as two different seeded users with separate cookie
  jars and exercised create/edit/share/upload/access-control through the real
  API, catching issues immediately rather than after a manual click-through.

## What AI-generated output I changed or rejected

- **Markdown import approach**: the first instinct for converting uploaded
  `.md`/`.txt` files was to use Tiptap's HTML→JSON conversion
  (`@tiptap/html` + `generateJSON`), but that requires a DOM (jsdom) on the
  server and adds a fragile dependency just for upload. I rejected that in
  favor of a small hand-rolled parser (`src/lib/markdownToDoc.ts`) that
  covers exactly the formatting the editor supports and is trivially unit
  testable without a DOM — a deliberate scope/robustness trade-off.
- **Dependency pinning**: the initial `package.json` pinned `next@14.2.15`,
  which `npm install` flagged with a known security advisory. Before
  proceeding, I checked the latest patched 14.2.x release (`14.2.35`) and
  bumped to that instead of either ignoring the warning or jumping to a
  breaking Next.js 16 upgrade.
- **Deployment story**: AI's first plan assumed a one-command deploy to a
  free serverless host with the existing SQLite setup. I corrected this —
  SQLite on serverless platforms (Vercel) doesn't persist across
  requests/instances — and had Prisma switched from SQLite to Postgres
  (Neon) before deploying, rather than overstating what's deployed. The app
  is live at https://ajaia-llc-ai-native-full-stack-deve-pink.vercel.app,
  backed by a free Neon Postgres database, deployed via the Vercel CLI.

## How correctness, UX, and reliability were verified

- **Automated tests** (`npm run test`, Vitest): 16 tests covering the
  access-control matrix (`canView`/`canEdit`/`canManageSharing`) and the
  Markdown→Tiptap-JSON converter (headings, bold/italic, lists, paragraphs,
  empty input).
- **Production build** (`npm run build`): confirms type-checking and the App
  Router build succeed end-to-end.
- **Manual end-to-end verification via curl** against the running dev
  server, simulating two separate logged-in users:
  - Login as Alice and Bob (separate cookie jars), confirmed dashboard
    correctly splits "My Documents" vs "Shared with Me" with the owner's
    name shown.
  - Created a new document as Alice and confirmed it appears in her list.
  - Confirmed Bob gets `403` fetching Alice's private document, and `403`
    trying to share a document he doesn't own.
  - Confirmed Bob *can* edit a document shared with him (title update via
    `PUT` succeeds).
  - Uploaded a `.md` file with headings/bold/italic/bullet/numbered lists and
    inspected the resulting Tiptap JSON to confirm correct conversion.
  - Uploaded an unsupported `.pdf` and confirmed a clear `400` error.
  - Confirmed unauthenticated requests get `401`.
  - Rendered both the dashboard and document editor pages and checked the
    expected content/markup is present.
