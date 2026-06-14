# Architecture Note

## Goal

Ship a coherent slice of a Google-Docs-like editor — creation, rich-text
editing, file import, sharing, and persistence — within a tight timebox,
prioritizing depth on a few flows over broad shallow coverage.

## Stack choices and why

- **Next.js App Router (single project)**: frontend, API routes, and
  middleware all live together. This avoids standing up a separate backend
  service and keeps deployment to "one Node app."
- **Prisma + SQLite**: zero external accounts/services needed to run the
  project. The schema (`User`, `Document`, `Share`) is intentionally small
  and maps directly onto the three core entities the assignment asks for.
- **Tiptap (ProseMirror)**: gives bold/italic/underline/headings/lists out of
  the box with a well-documented React integration, and stores content as
  JSON — easy to persist as a string column and easy to re-render.
- **Mocked auth (cookie = user id)**: the assignment explicitly allows seeded
  accounts/mocked auth. A real auth system (passwords, sessions, OAuth) would
  add significant surface area without changing how the editing/sharing/
  persistence logic is exercised. The cookie is httpOnly but unsigned —
  acceptable for a demo, called out clearly as not production-ready.
- **Hand-rolled Markdown→Tiptap-JSON converter** (`src/lib/markdownToDoc.ts`):
  rather than pulling in a full Markdown parser + HTML→ProseMirror pipeline
  (which needs a DOM/jsdom on the server), a small targeted parser handles
  exactly the formatting the editor supports (headings 1-3, bold, italic,
  bullet/numbered lists, paragraphs). This is pure, dependency-free, and
  directly unit-testable.

## Data model

- `User { id, name, email }` — seeded, no passwords.
- `Document { id, title, content (Tiptap JSON string), ownerId, createdAt, updatedAt }`
- `Share { documentId, userId }` (unique pair) — one row per user a document
  is shared with.

Access control (`src/lib/access.ts`) is three small pure functions:
`canView`, `canEdit` (currently identical — owner or shared user), and
`canManageSharing` (owner only). Keeping these as pure functions makes them
trivial to unit test without a database, and every API route funnels through
them so the rule lives in one place.

## What I prioritized

1. **A genuinely usable editing experience** — toolbar with the exact
   formatting options requested, inline title rename, debounced autosave with
   a visible status indicator, and content that survives a refresh.
2. **Correct, demonstrable sharing/access control** — verified end-to-end
   (owner sees "My Documents", recipient sees "Shared with Me" with the
   owner's name, non-shared users get 403, only the owner can manage sharing).
3. **A file-upload path that produces a *useful* document**, not just stores
   a blob — `.md`/`.txt` content becomes a real, immediately-editable Tiptap
   document with headings/lists/formatting preserved.
4. **Validation and error handling at every API boundary**: auth checks,
   ownership checks, file-type/size checks, JSON validation, empty-title
   rejection — each with a user-visible error message.

## What I deliberately cut

- **Real authentication** — out of scope per the assignment; mocked via a
  user-picker and an unsigned cookie.
- **Permission levels beyond "can edit"** — no read-only shares. Listed as
  the most natural "next" feature.
- **Real-time collaboration** (live cursors, concurrent editing) — autosave +
  refresh is sufficient to demonstrate persistence and sharing without the
  complexity of OT/CRDT and websockets.
- **Rich Markdown import** (tables, nested lists, images, links) — the
  supported subset (headings, bold/italic, lists, paragraphs) covers the
  formatting the editor itself supports; anything else is out of scope and
  the UI states the supported types.
- **Document version history / comments / export** — explicitly optional
  stretch goals; not attempted to protect the core flows.

## What I'd build next with 2-4 more hours

1. **Read-only sharing** — add a `role` column to `Share` (`viewer`/`editor`)
   and make the editor read-only for viewers.
2. **Export to Markdown/PDF** — walk the Tiptap JSON back into Markdown (the
   inverse of `markdownToDoc`) and offer a download button.
3. **Production persistence** — swap SQLite for Postgres (e.g. Neon/Supabase
   free tier) via Prisma so the app runs cleanly on serverless hosts like
   Vercel, which have ephemeral filesystems.
4. **Optimistic concurrency / "last edit wins" indicator** — show a warning if
   the document was updated by someone else since the editor loaded it,
   since two users can currently overwrite each other's autosaves.
5. **Better empty/loading states and a toast system** for save errors instead
   of inline text.
