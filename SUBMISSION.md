# Submission Checklist

## Included in this folder

- [x] Source code (Next.js app: `src/`, `prisma/`, config files)
- [x] `README.md` — local setup and run instructions, demo accounts, supported file types
- [x] `ARCHITECTURE.md` — architecture note (priorities, trade-offs, what's next)
- [x] `AI_WORKFLOW.md` — AI workflow note (tools, what AI sped up, what was changed/rejected, verification)
- [x] Automated tests (`tests/`), run via `npm run test`
- [x] Live product URL — https://ajaia-llc-ai-native-full-stack-deve-pink.vercel.app
- [ ] Walkthrough video URL (`video-link.txt`) 

## Status

### Working end-to-end
- Document creation, inline rename, rich-text editing (bold, italic,
  underline, headings H1-H3, bullet/numbered lists), autosave with status
  indicator, persistence across refresh.
- File upload (`.txt` / `.md`) converted into a new editable document.
- Sharing: owner grants/revokes access by email; "My Documents" vs
  "Shared with Me" distinction; access control enforced server-side
  (401/403 verified via API tests).
- Mocked login with 3 seeded users (Alice, Bob, Carol).

### Incomplete / not attempted
- Real authentication (passwords/OAuth) — intentionally mocked per assignment scope.
- Read-only sharing permission level (all shares are edit-access).
- Real-time collaboration, comments, version history, export — optional stretch, not attempted.

### What I'd build next (2-4 more hours)
See "What I'd build next" in `ARCHITECTURE.md` — read-only sharing roles,
Markdown/PDF export, swapping SQLite for Postgres for serverless deployment,
and basic concurrent-edit conflict warnings.
