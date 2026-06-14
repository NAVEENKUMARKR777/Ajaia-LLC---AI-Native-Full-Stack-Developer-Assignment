# Walkthrough Video Script (target: 3-5 min)

Record your screen at https://ajaia-llc-ai-native-full-stack-deve-pink.vercel.app
(or localhost). Tip: open two browser windows/profiles so you can be logged
in as Alice and Bob at the same time for the sharing demo.

---

## 1. Intro (15-20s)

"This is DocFlow, a lightweight collaborative document editor I built for
this assignment — Next.js, Tiptap for rich text, Prisma with Postgres for
persistence, deployed on Vercel. Let me walk through the main flow."

## 2. Login & dashboard (20-30s)

- Open the live URL → land on `/login`.
- "Auth is mocked for this demo — three seeded accounts, no passwords."
- Click **Alice**.
- On the dashboard: "Documents are split into 'My Documents' — things Alice
  owns — and 'Shared with Me'. Alice already owns two docs, and one is shared
  with Bob."

## 3. Create + edit a document (45-60s)

- Click **New document**.
- Type a title (rename inline).
- Show the toolbar: bold, italic, underline, H1/H2, bullet list, numbered list.
- Type a short paragraph, apply a couple of formats live.
- Point out the **"Saving... / Saved"** indicator — autosaves ~1s after you
  stop typing.
- **Refresh the page** → content and formatting persisted.

## 4. File upload (30-40s)

- Go back to dashboard, click **Upload .txt / .md**.
- Pick a small `.md` file with a heading, bold text, and a bullet list.
- Show it opens as a new, fully editable document with formatting preserved.
- Mention: "Only `.txt` and `.md` are supported — anything else is rejected
  with a clear error."

## 5. Sharing (45-60s)

- On one of Alice's docs, click **Share**.
- Enter `bob@example.com`, show it appear in "People with access".
- Switch to the second browser window logged in as **Bob**.
- Show the doc now appears under "Shared with Me" with "Shared by Alice".
- Open it, make a small edit as Bob, show it saves.
- Back as Alice: try to access one of Alice's *private* docs as Bob (optional,
  or just mention it) → "Documents not shared with you return a 403 — this is
  enforced on every API route, not just hidden in the UI."

## 6. What I deprioritized (20-30s)

"To stay focused, I deliberately left out: real authentication (mocked per
the assignment's allowances), read-only sharing — everyone with access can
edit — and stretch features like comments, version history, and real-time
collaboration indicators. Those are called out in the architecture note as
what I'd build next."

## 7. Key implementation decisions + AI workflow (30-45s)

- "Content is stored as Tiptap's JSON format directly in Postgres — simple
  to persist and re-render."
- "File import uses a small hand-written Markdown parser instead of a
  DOM-based HTML conversion, so it's dependency-free and unit-tested."
- "I used Claude Code for the full build — scaffolding, the API routes,
  and the access-control logic, then verified everything end-to-end with
  curl as two different logged-in users before considering it done. Full
  details are in AI_WORKFLOW.md."

## 8. Close (10s)

"That's the core flow — creation, formatting, upload, and sharing, all
persisted and access-controlled. Thanks for watching."

---

## Recording tips

- Loom (free, unlisted link) is the easiest — record screen + mic, ~3-5 min.
- Do one dry run first so the autosave/upload steps don't feel rushed.
- After recording, put the link in a text file (e.g. `video-link.txt`) in
  the submission folder.
