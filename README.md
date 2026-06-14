# DocFlow — Lightweight Collaborative Document Editor

A small full-stack document editor inspired by Google Docs: create and edit
rich-text documents, upload `.txt`/`.md` files to turn them into documents,
and share documents with other users.

## Tech Stack

- **Next.js 14** (App Router, TypeScript) — frontend + API routes in one project
- **Tailwind CSS** — styling
- **Tiptap (ProseMirror)** — rich-text editor
- **Prisma + SQLite** — persistence (single file, no external services)
- **Vitest** — automated tests

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 24)

### Setup

```bash
npm install
npx prisma db push     # creates prisma/dev.db with the schema
npm run db:seed         # seeds 3 demo users and sample documents
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
`/login`.

### Demo accounts (mocked auth)

There is no password — login is a simple account picker for review purposes.
After seeding, three users exist:

| Name  | Email             |
| ----- | ----------------- |
| Alice | alice@example.com |
| Bob   | bob@example.com   |
| Carol | carol@example.com |

Alice owns "Welcome to DocFlow" (shared with Bob) and "Alice's Private Notes".
Bob owns "Bob's Project Plan". Use "Switch user" on the dashboard to log out
and pick a different account — a good way to see the sharing flow from both
sides.

## Features

### Document editing
- Create, rename (inline title), and edit documents
- Rich-text formatting: bold, italic, underline, headings (H1–H3), bullet and
  numbered lists
- Autosave ~1 second after you stop typing, with a "Saving... / Saved" indicator
- Content persists as Tiptap JSON in SQLite and reloads on refresh

### File upload
- Upload a `.txt` or `.md` file (max 1MB) from the dashboard
- The file is parsed (headings, bold/italic, bullet/numbered lists, paragraphs)
  into a new editable document owned by the current user
- Other file types are rejected with a clear error message

### Sharing
- Every document has a single **owner**
- The owner can open **Share**, enter another seeded user's email, and grant
  them access (view + edit)
- The owner can revoke access from the same dialog
- The dashboard splits documents into **My Documents** (owned) and
  **Shared with Me** (shows who shared it)

### Persistence & access control
- SQLite via Prisma (`prisma/dev.db`)
- `src/lib/access.ts` defines `canView`/`canEdit`/`canManageSharing`: owner or
  shared users can view & edit; only the owner can manage sharing
- All API routes enforce these checks (401 if not logged in, 403 if no access)

## Testing

```bash
npm run test
```

Covers:
- `tests/access.test.ts` — owner/shared/unauthorized access matrix
- `tests/markdownToDoc.test.ts` — `.txt`/`.md` → Tiptap JSON conversion
  (headings, bold/italic, bullet/numbered lists, paragraphs)

## Production build

```bash
npm run build
npm run start
```

## Scope & Known Limitations

- Authentication is intentionally mocked (no passwords) — see `ARCHITECTURE.md`.
- File import supports `.txt` and `.md` only (heading levels 1–3, bold,
  italic, bullet/numbered lists, paragraphs). More advanced Markdown (tables,
  nested lists, links, images) is not converted.
- All shared users have the same (edit) permission level — there is no
  separate "view only" role.
- SQLite is used for simplicity; see `ARCHITECTURE.md` for production
  persistence notes.

## Deployment

The app runs entirely on SQLite + Node, so it can be deployed to any Node
host (Render, Fly.io, Railway, a VPS, etc.):

```bash
npm install
npx prisma db push
npm run db:seed   # optional, for demo data
npm run build
npm run start
```

For a serverless platform (e.g. Vercel), swap the Prisma SQLite datasource
for a hosted Postgres/Turso database, since serverless filesystems are
ephemeral — see `ARCHITECTURE.md` for details.
