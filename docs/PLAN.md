# SkillForge AI — PLAN.md

**Project:** SkillForge AI  
**Document:** PLAN.md  
**Version:** MVP / 10-Day Build Scope  
**Purpose:** Practical execution plan for building SkillForge AI phase-by-phase with strict scope control.

---

## 1. Plan Overview

### Purpose of `PLAN.md`

`PLAN.md` is the execution document for building the SkillForge AI MVP. It converts the approved product docs into a clear 10-day build plan that AI coding agents and the builder can follow without drifting, overbuilding, or skipping important security/build checks.

### What this plan controls

This file controls:

- the 10-day implementation order
- branch strategy
- folder architecture
- command gates
- phase-by-phase scope
- route planning
- database implementation mapping
- UI implementation mapping
- AI/RAG implementation order
- security expectations
- testing expectations
- risk control
- final MVP acceptance criteria

### Source-of-truth documents

| Source File | How This Plan Uses It |
|---|---|
| `RESEARCH.md` | Confirms market direction, stack choices, MVP focus, and scope risks. |
| `PRD.md` | Defines product requirements, routes, features, Google OAuth, MVP scope, and acceptance criteria. |
| `DATABASE_SCHEMA.md` | Defines tables, ownership, RLS rules, usage logs, RAG chunks, and storage rules. |
| `AGENT_RULES.md` | Defines build discipline, phase rules, AI output behavior, and command gates. |
| `DESIGN_SYSTEM.md` | Defines the approved light-first neo-brutalist learning UI direction. |
| `SkillForge AI 10-Day Roadmap PDF` | Defines daily phase alignment, deliverables, and exit gates. |

### MVP reminder

SkillForge AI is a **10-day MVP**, not a full production company. The goal is to build a serious portfolio-grade vertical slice:

```text
Auth → Protected Dashboard → Upload Material → AI Generation → RAG Chat → Practice → Progress → Deploy
```

Do not build advanced features before the core loop works.

### Phase discipline reminder

Agents must not jump phases. A phase is complete only when:

- the feature works end-to-end
- user ownership is protected
- loading/error/empty states exist where needed
- mobile layout does not break
- required commands pass
- the builder can explain what changed

---

## 2. Project Build Philosophy

### Core philosophy

Build one useful vertical slice at a time. Keep the app working at every phase. Prefer small, explainable progress over large, risky rewrites.

### Rules

| Rule | Meaning |
|---|---|
| One phase = one branch | Each roadmap day gets its own branch. |
| Small commits | Commit logical units, not massive mixed changes. |
| Working build over huge code | A small working feature beats a large broken feature. |
| No silent architecture changes | Any change to structure, auth, database, or routing must be explained first. |
| Secure ownership first | Every private request must resolve `user_id` from server session. |
| MVP first, polish second | Build the core flow first, then refine. |
| Approved UI only | Follow the neo-brutalist learning system, not generic dark SaaS. |
| No phase jumping | Future features wait for their phase. |
| Command gates are mandatory | No phase is complete if lint/typecheck/build fails. |

### Product build mindset

SkillForge AI should feel like a real product system, not just a landing page or API wrapper. Every feature should support the learning loop:

1. User signs in.
2. User uploads or creates learning context.
3. App transforms that context into study assets.
4. User practices.
5. User tracks progress.

---

## 3. Final Tech Stack Plan

| Stack Item | Purpose | Phase Introduced | Why Used | Notes / Cautions |
|---|---|---:|---|---|
| Next.js App Router | Full-stack routing, pages, layouts, API routes | Day 2 | Strong portfolio architecture and Vercel fit | Use `app/` route groups clearly. |
| TypeScript | Type safety across app | Day 2 | Prevents many runtime mistakes | Do not silence errors with `any` or `@ts-ignore`. |
| Tailwind CSS | Styling system | Day 2 | Fast implementation of approved design tokens | Do not drift into generic blue/dark SaaS defaults. |
| shadcn/ui or wrappers | Base accessible UI primitives | Day 2 | Speeds up components while keeping control | Wrap/restyle to match brutalist system; do not keep default look. |
| Supabase Auth | Email/password and Google OAuth | Day 3 | Auth, sessions, SSR support | `/auth/callback` must remain public. |
| Supabase Postgres | Main relational database | Day 3 onward | User-owned CRUD and logs | Follow `DATABASE_SCHEMA.md`; enable RLS. |
| Supabase Storage | Private material uploads | Day 5 | Stores PDFs/TXT files with auth policies | Use private `materials` bucket. |
| Supabase pgvector | Embeddings and semantic search | Day 7 | Enables RAG over uploaded notes | Confirm Gemini embedding dimension before migration. |
| Gemini API | Generation and embeddings | Day 6/7 | One provider for MVP reduces complexity | Keys stay server-side only. |
| Upstash Redis | Rate limiting | Day 9, optional earlier for AI routes | Protects expensive AI routes | Can fallback to DB counters if not included. |
| Stripe test mode | Optional plan demo | Day 9 optional | Shows SaaS thinking without real billing | Do not build real billing lifecycle. |
| Vercel | Deployment | Day 10 | Best fit for Next.js portfolio deployment | Watch serverless limits for long processing. |
| Vitest | Unit tests | Day 10, can start earlier | Fast tests for utilities/validators | Keep tests focused on critical logic. |
| React Testing Library | Component tests | Day 10 | Tests UI behavior | Focus on auth/forms/states, not snapshots. |
| Playwright | Auth/deployment smoke tests | Day 10 optional recommended | Validates happy-path flows | Keep small: login/dashboard/upload smoke. |

---

## 4. Repository and Branch Strategy

### Main branch rule

`main` must stay stable. Only merge a phase branch into `main` after the phase exit gate passes.

### Phase branches

| Phase | Branch |
|---|---|
| Day 1 | `phase-01-research-prd` |
| Day 2 | `phase-02-design-system` |
| Day 3 | `phase-03-auth-proxy` |
| Day 4 | `phase-04-roadmaps-crud` |
| Day 5 | `phase-05-materials-upload` |
| Day 6 | `phase-06-ai-generator` |
| Day 7 | `phase-07-rag-chat` |
| Day 8 | `phase-08-quiz-interview` |
| Day 9 | `phase-09-admin-security-billing` |
| Day 10 | `phase-10-testing-deploy` |

### Commit message examples

```text
chore: add project scaffold
ui: add neo-brutalist button and card components
feat(auth): add email password login
feat(auth): add google oauth callback
feat(roadmaps): add roadmap task status updates
feat(materials): add private material upload flow
feat(ai): add validated flashcard generation
fix(rag): filter vector search by user id
test(auth): add login smoke test
docs: update README architecture notes
```

### Pull / merge rules

Before merging:

- confirm branch name matches phase
- review changed files
- run command gates
- verify feature manually
- commit only relevant changes
- write a daily progress note

### If a phase fails

If a phase fails:

1. Stop adding new features.
2. Identify the failure: UI, auth, DB, RLS, API, AI, build, or deployment.
3. Fix the failing gate first.
4. Do not merge into `main`.
5. If stuck, reduce scope within the phase instead of jumping ahead.

### Never mix unrelated phases

Examples of forbidden mixing:

- adding AI routes during Day 3 auth
- building RAG during Day 5 upload
- adding Stripe during Day 6 AI generation
- redesigning the landing page during Day 8 quiz/interview

---

## 5. Folder Architecture Plan

Use a practical feature-first structure.

| Folder | Purpose | What Belongs There | What Must Not Belong There |
|---|---|---|---|
| `app/` | Next.js App Router root | layouts, route groups, pages, route handlers | reusable business logic that belongs in `features` or `lib` |
| `app/(public)` | public marketing routes | landing, features, pricing | dashboard-only UI |
| `app/(auth)` | auth routes | login, signup, forgot password, auth callback UI | Supabase secrets or service role logic |
| `app/dashboard` | protected user dashboard pages | dashboard, materials, roadmaps, flashcards, quizzes, interview, progress, settings | admin-only pages |
| `app/admin` | admin protected pages | admin overview, users, logs | user dashboard pages |
| `app/api` | server route handlers | API routes for materials, AI, progress, admin, optional billing | UI components |
| `components/ui` | reusable base UI | Button, Input, Card, Badge, Modal, Toast, Skeleton | feature-specific business components |
| `components/layout` | shared shells | public nav, dashboard shell, sidebar, topbar | feature forms or API logic |
| `features/auth` | auth-specific UI/logic | auth forms, user menu, profile helpers | material upload or AI code |
| `features/dashboard` | dashboard overview | stat cards, quick actions, recent activity | database clients not specific to dashboard |
| `features/materials` | material upload/management | upload UI, material cards, preview states | RAG vector search core logic |
| `features/roadmaps` | goals and roadmaps | goal forms, roadmap cards, task checklist | quiz/interview components |
| `features/flashcards` | flashcard UI | deck list, flashcard study card | quiz scoring logic |
| `features/quizzes` | quiz UI | quiz forms, option cards, result review | interview feedback logic |
| `features/interview` | mock interview UI | setup form, answer flow, feedback card | voice/video features |
| `features/rag-chat` | RAG chat UI | material selector, answer cards, source cards | provider secrets |
| `features/progress` | progress UI | progress cards, activity timeline | admin logs |
| `features/admin` | admin UI | users table, logs, role/plan badges | private note content display |
| `lib/supabase` | Supabase clients/helpers | browser/server clients, session helpers | feature UI |
| `lib/ai` | AI provider wrapper | Gemini server-side calls, prompts, validation helpers | frontend code with provider keys |
| `lib/rag` | RAG utilities | chunking, embedding helpers, retrieval helpers | UI cards |
| `lib/rate-limit` | rate limiting | Upstash or fallback limit logic | page components |
| `lib/validators` | validation schemas | form/API validation | React UI |
| `lib/utils` | general utilities | `cn`, formatting, dates, safe helpers | feature business logic that belongs elsewhere |
| `types` | shared TypeScript types | app types, database-derived types | runtime logic |
| `store` | optional client state | small UI state if needed | server state or sensitive auth data |
| `docs` | project documents | PRD, schema, agent rules, design system, plan | app runtime files |

### Architecture rules

- Keep `app/` focused on routing and composition.
- Keep feature code close to its feature.
- Keep shared UI in `components/ui` only when it is truly reusable.
- Keep API keys and AI calls server-side.
- Keep validation reusable between forms and API routes where practical.

---

## 6. Environment Variables Plan

### Expected variables

| Variable | Visibility | Phase | Purpose | Notes |
|---|---|---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Day 3 | Supabase project URL | Safe because it is public Supabase config. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Day 3 | Supabase anon key | Safe with RLS; never use service role client-side. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Day 5/9 only if needed | Admin/server operations | Use only in server routes; avoid unless necessary. |
| `GEMINI_API_KEY` | Server-only | Day 6 | AI generation and embeddings | Never expose to frontend. |
| `UPSTASH_REDIS_REST_URL` | Server-only | Day 9 optional | Rate limiting | Optional but recommended. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only | Day 9 optional | Rate limiting auth | Keep server-only. |
| `STRIPE_SECRET_KEY` | Server-only | Day 9 optional | Stripe test mode | Optional; no real billing in MVP. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Day 9 optional | Stripe client checkout | Only if Stripe test mode is included. |
| `STRIPE_WEBHOOK_SECRET` | Server-only | Day 9 optional | Verify Stripe webhooks | Optional; skip if no webhook flow. |
| `NEXT_PUBLIC_APP_URL` | Public | Day 3/10 | OAuth redirects and links | Must match localhost/prod where needed. |
| `RESEND_API_KEY` | Server-only | Optional | Email-ready flows | Do not add unless needed. |

### Environment rules

- Do not commit `.env` with real values.
- Keep `.env.example` safe with placeholder values only.
- Never expose service role, Gemini, Upstash, Stripe secret, webhook secret, or Resend keys to the browser.
- Add env validation later if it prevents confusing runtime errors.
- OAuth Client ID/Secret are configured in Supabase/Google Cloud, not directly in frontend code.

---

## 7. Command Gates

### Required commands

| Command | When To Run | Required From |
|---|---|---|
| `npm run lint` | before marking any implementation phase complete | Day 2 onward |
| `npm run typecheck` | before marking any implementation phase complete | Day 2 onward |
| `npm run build` | before marking any implementation phase complete | Day 2 onward |
| `npm run test` | after tests are introduced | Day 10, earlier if added |

### Failure rules

| Failure | Action |
|---|---|
| Lint fails | Fix before continuing. |
| Typecheck fails | Fix before continuing. |
| Build fails | Phase is not complete. |
| Test fails | Fix or explain clearly before merge. |
| Command cannot run | Explain why and run the closest manual check. |

### Strict rules

- Do not ignore TypeScript errors.
- Do not hide lint issues.
- Do not add `any` unless justified and approved.
- Do not use `@ts-ignore` unless explicitly approved.
- Do not mark a phase complete if build fails.
- Do not move to the next branch while the current branch is broken.

---

## 8. Day 1 — Documentation Phase

### Purpose

Finalize the product and execution documents before coding.

### Allowed

- `RESEARCH.md`
- `PRD.md`
- `DATABASE_SCHEMA.md`
- `AGENT_RULES.md`
- `DESIGN_SYSTEM.md`
- `PLAN.md`
- `SKILLS.md`

### Forbidden

- app code
- migrations
- UI implementation
- backend routes
- React components
- Tailwind config

### Tasks

- Confirm research file.
- Finalize PRD.
- Finalize database schema.
- Finalize agent rules.
- Finalize design system.
- Create `PLAN.md`.
- Create `SKILLS.md` next.

### Exit gate

- Docs are clear.
- MVP is scoped.
- Database model is approved.
- Agent rules are approved.
- Design system is approved.
- Plan is approved.
- No coding started.

---

## 9. Day 2 — Scaffold and Design System Phase

### Purpose

Create the Next.js foundation and implement the approved visual/UI base.

### Allowed

- project scaffold
- folder structure
- Tailwind setup
- fonts
- theme variables/tokens
- base UI components
- layout shell
- public landing skeleton
- auth page visual shell only
- dashboard shell visual only
- empty/loading/error states

### Must follow `DESIGN_SYSTEM.md`

- warm paper background
- black ink borders
- hard offset shadows
- Space Grotesk-style headings
- Inter-style body
- color-coded learning cards
- physical press/lift interactions
- no generic dark AI SaaS look
- no glassmorphism
- no blue-violet AI default palette

### Components to build

- Button
- Input
- Textarea
- Card
- Badge
- Toast
- Skeleton
- EmptyState
- ErrorState
- Modal/Dialog
- Dropdown
- Tabs
- Progress
- FileUploadDropzone shell
- Sidebar shell
- Topbar shell

### Forbidden

- auth business logic
- Supabase real logic
- AI routes
- upload backend
- RAG
- admin logic

### Exit gate

- App runs.
- Base UI matches approved design.
- Landing/auth/dashboard shells look consistent.
- Mobile layout does not break.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.

---

## 10. Day 3 — Auth, Profile, Proxy, Google OAuth Phase

### Purpose

Implement authentication, profile loading/creation, and route protection.

### Allowed

- Supabase Auth setup
- email/password signup
- email/password login
- logout
- forgot password UI
- Google OAuth button
- `/auth/callback`
- profile creation/loading
- session provider
- `proxy.ts` route protection
- dashboard route guard
- admin route guard foundation
- profile/settings basics

### Important rules

- Use `proxy.ts`, not `middleware.ts`.
- `/auth/callback` must remain public.
- Google OAuth and email/password users share the same `profiles` table.
- Never trust client-provided `user_id`.
- Profile updates must not let users update their own `role` or `plan`.

### Forbidden

- materials upload
- AI generation
- RAG
- quiz/interview logic
- full admin dashboard

### Exit gate

- User can sign up with email/password.
- User can log in with email/password.
- User can log out.
- User can sign in with Google.
- Profile row exists or is created/loaded.
- Refresh keeps session.
- Logged-out dashboard access redirects.
- Logged-in login/signup access redirects.
- Admin route blocks normal users.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 11. Day 4 — Learning Goals and Roadmaps CRUD Phase

### Purpose

Build the first real user-owned CRUD flow.

### Allowed

- learning goals CRUD
- roadmaps CRUD
- roadmap task CRUD
- task status updates
- progress percentage basics
- dashboard integration
- ownership checks

### Forbidden

- AI roadmap generation
- materials upload
- RAG
- quiz/interview generation

### Exit gate

- User can create/edit/delete learning goals.
- User can create/edit/delete roadmaps/tasks.
- Task completion updates progress.
- User A cannot access User B data.
- Loading/error/empty states exist.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 12. Day 5 — Materials Upload System Phase

### Purpose

Build the material upload and processing foundation.

### Allowed

- PDF/TXT/pasted text input
- Supabase Storage upload
- `materials` table integration
- file type validation
- file size validation
- processing status
- extracted text storage
- material list/detail
- preview extracted text
- delete/soft delete
- upload empty/error/loading states

### Important rules

- MVP supports PDF, TXT, and pasted text.
- No OCR.
- No DOCX unless explicitly approved later.
- Use a realistic max file size, for example 5 MB.
- Store files in private Supabase Storage bucket named `materials`.

### Forbidden

- full RAG chat
- AI generation if processing is not ready
- OCR/image extraction
- complex background jobs

### Exit gate

- Valid files upload.
- Bad files are blocked.
- Materials are listed.
- User sees only own materials.
- Processing status is visible.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 13. Day 6 — AI Generator System Phase

### Purpose

Implement structured AI generation without full RAG chat yet.

### Allowed

- Gemini API server-side setup
- AI route wrappers
- usage limit checks
- output validation
- generate roadmap
- generate flashcards
- generate quiz
- generate interview questions
- save valid AI outputs
- retry/fallback for invalid output
- `usage_logs` integration
- safe error messages

### Important rules

- Backend creates IDs.
- Backend sets `user_id` from session.
- AI output must be validated before saving.
- Do not save malformed JSON.
- Keep one AI provider for MVP.
- Provider keys stay server-side only.

### Forbidden

- multiple AI providers
- full RAG chat if retrieval is not ready
- autonomous agents
- advanced analytics

### Exit gate

- AI outputs are valid and saved.
- Usage logs are created.
- Invalid outputs fail safely.
- AI errors do not crash the app.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 14. Day 7 — RAG Chat Over Uploaded Notes Phase

### Purpose

Build the anchor AI feature: source-grounded chat with uploaded material.

### Allowed

- chunk extracted text
- generate embeddings
- store `material_chunks`
- pgvector similarity search
- `match_material_chunks` RPC concept/implementation
- RAG chat API
- chat sessions/messages
- `source_chunk_ids`
- source cards UI
- insufficient context fallback
- material processing state
- usage limit integration

### Important rules

- Vector search must filter by `user_id`.
- Do not retrieve across users.
- Do not invent citations.
- If no context is found, say context is insufficient.
- Store `source_chunk_ids` where possible.
- Confirm Gemini embedding dimension before implementation.

### Forbidden

- multi-user workspaces
- public sharing
- unsupported citations
- complex multi-material retrieval unless simple and safe

### Exit gate

- User can ask a question about uploaded material.
- Answer uses retrieved chunks.
- No-context fallback works.
- User data is isolated.
- Source cards appear only when supported.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 15. Day 8 — Quiz and Interview Engine Phase

### Purpose

Complete the practice loop.

### Allowed

- quiz attempt flow
- scoring
- wrong-answer review
- quiz result page/card
- interview session flow
- one-question-at-a-time interview UI
- answer submission
- interview feedback
- progress events
- weak topic basics if simple

### Important rules

- Interview score range should be 0–10.
- Feedback should be constructive.
- Quiz options must be accessible.
- Keep interview text-only.

### Forbidden

- voice interview
- video interview
- full spaced repetition
- advanced analytics

### Exit gate

- User can take quiz.
- Score is calculated.
- Wrong-answer review works.
- User can complete mock interview.
- Feedback is saved/shown.
- Progress updates.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 16. Day 9 — Admin, Logs, Rate Limits, Plans Phase

### Purpose

Add SaaS-style control and protection.

### Allowed

- admin overview
- users table
- usage logs
- API logs
- error logs
- admin route protection
- role/plan badges
- free/pro/demo plan checks
- Upstash rate limiting
- optional Stripe test-mode placeholder or checkout only if time allows

### Important rules

- Admin must not expose private note content.
- Normal users must be blocked from admin.
- Rate limits must protect AI routes.
- Billing is optional and test-only.
- `billing_customers` is optional Day 9 only.

### Forbidden

- real billing
- invoices
- taxes
- refunds
- coupons
- complex analytics
- full subscription lifecycle

### Exit gate

- Admin route is protected.
- Logs are visible safely.
- Rate limit works.
- Usage limit works.
- Plan checks work.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 17. Day 10 — Testing, Polish, Deployment Phase

### Purpose

Make the project portfolio-ready.

### Allowed

- unit tests
- API tests
- auth smoke tests
- Playwright happy path if possible
- responsive QA
- accessibility pass
- SEO basics
- README
- screenshots
- deployment
- final bug fixes
- final polish

### Forbidden

- new major features
- architecture rewrite
- new providers
- theme switcher
- extra pages not needed

### Exit gate

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run build` passes.
- App is deployed on Vercel.
- README explains architecture.
- Demo flow works.
- Builder can explain the project clearly.

---

## 18. Feature Dependency Map

| Dependency | Why It Matters |
|---|---|
| Design system before UI pages | Prevents generic visual drift and inconsistent components. |
| Database schema before migrations | Avoids table/ownership confusion later. |
| Auth before dashboard data | User-owned data requires a trusted session. |
| Profiles before ownership | All user data references the authenticated profile/user ID. |
| `proxy.ts` before protected app expansion | Prevents private routes from leaking. |
| Materials before RAG | RAG needs uploaded/extracted material first. |
| Extracted text before chunks | Chunking depends on readable content. |
| Chunks before vector search | Vector retrieval needs stored chunk rows. |
| Embedding dimension before vector migration | pgvector columns need a fixed dimension. |
| AI validation before saving generated assets | Prevents malformed model output in DB. |
| Usage logs before rate/plan enforcement | AI usage needs reliable tracking. |
| RLS before real user data | Prevents cross-user access early. |
| Storage bucket policies before uploads | Files must be private from the start. |
| Tests before deployment confidence | Demo should not break during review. |

---

## 19. Route Implementation Plan

### Public routes

| Route | Phase | Purpose | Protection | Notes |
|---|---:|---|---|---|
| `/` | Day 2 | Landing page | Public | Neo-brutalist hero and CTA. |
| `/features` | Day 2/10 | Feature overview | Public | Can be simple; not required to overbuild. |
| `/pricing` | Day 2/9 | Free/pro/demo explanation | Public | No real billing unless Day 9 optional Stripe. |
| `/login` | Day 3 | Email/password + Google OAuth login | Public for logged-out | Logged-in users redirect to `/dashboard`. |
| `/signup` | Day 3 | Email/password + Google OAuth signup | Public for logged-out | Logged-in users redirect to `/dashboard`. |
| `/forgot-password` | Day 3 | Reset request UI | Public | Keep simple. |
| `/auth/callback` | Day 3 | Supabase OAuth callback/session exchange | Public | Must not be blocked by `proxy.ts`. |

### Protected routes

| Route | Phase | Purpose | Protection | Notes |
|---|---:|---|---|---|
| `/dashboard` | Day 3/4 | Main user dashboard | Auth required | Shows quick actions, stats, progress, usage. |
| `/dashboard/materials` | Day 5 | Upload/manage materials | Auth required | User-owned materials only. |
| `/dashboard/roadmaps` | Day 4/6 | Goals, roadmaps, tasks | Auth required | CRUD first, AI generation later. |
| `/dashboard/flashcards` | Day 6 | Flashcard decks/cards | Auth required | Generated from material. |
| `/dashboard/quizzes` | Day 6/8 | Quizzes and attempts | Auth required | Generation Day 6; attempts Day 8. |
| `/dashboard/interview` | Day 6/8 | Mock interview mode | Auth required | Text-only MVP. |
| `/dashboard/progress` | Day 8 | Progress tracking | Auth required | Simple progress/events only. |
| `/dashboard/profile` | Day 3 | User profile | Auth required | Safe fields only. |
| `/dashboard/settings` | Day 3/9 | Plan, usage, preferences | Auth required | Usage from `usage_logs`; plan from `profiles.plan`. |

### Admin routes

| Route | Phase | Purpose | Protection | Notes |
|---|---:|---|---|---|
| `/admin` | Day 9 | Admin overview | Auth + admin role | Normal users blocked. |
| `/admin/users` | Day 9 | Users and role/plan view | Auth + admin role | Do not expose sensitive private content. |
| `/admin/logs` | Day 9 | API/usage/error logs | Auth + admin role | Logs must be safe. |

### API routes

| Route | Phase | Purpose | Protection | Notes |
|---|---:|---|---|---|
| `/api/materials` | Day 5 | Material CRUD | Auth required | Validate ownership. |
| `/api/upload` | Day 5 | File upload and processing entry | Auth required | Validate type/size. |
| `/api/ai/chat` | Day 7 | RAG chat | Auth + usage/rate limit | Retrieve only own chunks. |
| `/api/ai/roadmap` | Day 6 | Roadmap generation | Auth + usage/rate limit | Validate output before save. |
| `/api/ai/flashcards` | Day 6 | Flashcard generation | Auth + usage/rate limit | Validate deck/cards. |
| `/api/ai/quiz` | Day 6 | Quiz generation | Auth + usage/rate limit | Multiple choice MVP. |
| `/api/ai/interview` | Day 6/8 | Interview questions/feedback | Auth + usage/rate limit | Text-only. |
| `/api/progress` | Day 4/8 | Progress updates | Auth required | User-owned events. |
| `/api/admin/*` | Day 9 | Admin data/logs | Auth + admin role | Safe log exposure only. |
| `/api/billing/*` | Day 9 optional | Stripe test mode | Auth required | Optional only. |

---

## 20. Database Implementation Plan

### Phase mapping

| Phase | Tables / Data Areas |
|---|---|
| Day 3 | `profiles` |
| Day 4 | `learning_goals`, `roadmaps`, `roadmap_tasks`, `progress_events` basics |
| Day 5 | `materials`, private Storage bucket `materials` |
| Day 6 | `flashcard_decks`, `flashcards`, `quizzes`, `quiz_questions`, `interview_sessions`, `interview_messages`, `usage_logs` |
| Day 7 | `material_chunks`, `chat_sessions`, `chat_messages`, vector search/RPC |
| Day 8 | `quiz_attempts`, interview feedback fields, progress events |
| Day 9 | `api_logs`, `error_logs`, `admin_actions`, optional `billing_customers` only if Stripe test mode is implemented |

### RLS reminder

- Enable RLS on user-owned tables.
- User-owned rows must include `user_id`.
- Policies must enforce `auth.uid()` ownership.
- Admin access must be explicit.
- Normal users must not access other users’ data.

### Ownership reminder

- Do not trust client-provided `user_id`.
- API routes must get user ID from server session.
- `material_chunks` must duplicate `user_id` for safe RAG filtering.
- Vector search must filter by `user_id`.

### Migration order reminder

1. Extensions
2. profiles
3. core learning tables
4. materials
5. chunks/chat/RAG tables
6. generated content tables
7. progress/usage/logging tables
8. indexes
9. RLS
10. policies
11. storage bucket/policies
12. safe seed/demo data if needed

### Storage bucket reminder

- Bucket name: `materials`
- Bucket type: private
- Path pattern: `{user_id}/{material_id}/file`
- Allowed MVP types: PDF, TXT, pasted text
- Recommended file size: start around 5 MB

---

## 21. UI Implementation Plan

### Component mapping by phase

| Phase | UI Work |
|---|---|
| Day 2 | base components and shell |
| Day 3 | auth pages, profile/session UI, callback state |
| Day 4 | roadmaps/goals UI |
| Day 5 | materials upload UI |
| Day 6 | AI generation UI |
| Day 7 | RAG chat UI |
| Day 8 | quiz/interview UI |
| Day 9 | admin/logs/usage UI |
| Day 10 | polish, accessibility, responsive QA |

### Visual acceptance checklist

- [ ] warm paper background used as base
- [ ] black borders are consistent
- [ ] hard offset shadows are consistent
- [ ] buttons have press/lift behavior
- [ ] headings feel bold/editorial
- [ ] feature colors map to meaning
- [ ] empty states guide action
- [ ] dashboard is useful, not decorative
- [ ] mobile layout works
- [ ] no generic dark SaaS dashboard drift

### Inspiration rule

Stitch / SpendsIn-style references are visual inspiration only. Do not copy:

- finance copy
- finance feature names
- finance dashboard patterns
- rupee/expense examples
- brand identity

SkillForge UI must remain learning/interview-prep focused.

---

## 22. AI / RAG Implementation Plan

### Day 6 structured AI generation flow

```text
User action → validate input → check session → check ownership → check usage → call Gemini → validate output → save DB rows → log usage → return result
```

### Output validation flow

- Validate required fields.
- Validate difficulty values.
- Validate arrays and counts.
- Validate quiz options and correct answer.
- Reject malformed JSON-like output.
- Retry once if safe.
- Do not save broken output.

### Day 7 RAG flow

```text
Material extracted text → chunk text → embed chunks → store material_chunks → embed user query → vector search filtered by user_id → build grounded prompt → answer → save chat_messages with source_chunk_ids
```

### Embedding flow

- Use Gemini embeddings.
- Confirm embedding dimension before implementation.
- Store vectors in `material_chunks.embedding`.
- Track chunk index and source metadata.

### Vector search flow

- Search only `material_chunks` owned by current user.
- Optionally filter by selected `material_id`.
- Retrieve top-k chunks, usually 3–8.
- If no good chunks exist, return insufficient-context state.

### Fallback flow

| Failure | Behavior |
|---|---|
| AI provider fails | Show safe retry message, log error. |
| Invalid output | Retry once, then show safe failure. |
| No relevant chunks | Say context is insufficient. |
| Usage limit reached | Block before AI call. |
| Rate limit reached | Ask user to wait. |
| Database save fails | Do not pretend success. |

### Usage logging flow

- Log successful AI calls.
- Log blocked requests as `blocked`.
- Do not count validation failures before provider call.
- Use `profiles.plan + usage_logs` for limits.

---

## 23. Security Implementation Plan

### Auth security

- Use Supabase Auth.
- Support email/password.
- Support Google OAuth.
- Keep `/auth/callback` public.
- Logged-in users redirect away from `/login` and `/signup`.
- Logged-out users redirect away from `/dashboard`.

### Route protection

- Use `proxy.ts`, not `middleware.ts`.
- Protect `/dashboard/*`.
- Protect `/admin/*` with admin role.
- Do not block `/auth/callback`.

### Database security

- Enable RLS on user-owned tables.
- Always filter by `auth.uid()`.
- Never trust client `user_id`.
- Admin policies must be explicit.

### Storage security

- Private `materials` bucket.
- Storage paths include user ID.
- Users access only their own folder.
- No public URLs for private notes unless signed and necessary.

### API security

- All private APIs require server-side session checks.
- AI routes require session + usage check + rate limit.
- Upload route validates file type and size.
- Admin APIs require admin role.

### Logging safety

- Do not log API keys.
- Do not log OAuth tokens.
- Do not log private note content unnecessarily.
- Do not expose stack traces to users.
- Admin logs should be useful but safe.

---

## 24. Testing Plan

### Testing by phase

| Phase | Manual Tests | Automated Tests To Add When Practical |
|---|---|---|
| Day 2 | visual smoke on mobile/tablet/desktop | component smoke tests later |
| Day 3 | signup, login, logout, Google OAuth, redirects, refresh | auth helper tests, Playwright auth smoke if possible |
| Day 4 | CRUD goals/roadmaps/tasks, ownership checks | validator tests, API ownership tests |
| Day 5 | valid upload, invalid type, oversized file, delete | upload validation tests |
| Day 6 | generation success/failure, invalid output, usage logs | AI output validator tests |
| Day 7 | chunking, embedding, vector search, no-context fallback | RAG helper tests, ownership search tests |
| Day 8 | quiz attempt, scoring, review, interview feedback | quiz scoring tests |
| Day 9 | admin block, logs safe, rate limit | rate-limit and role-check tests |
| Day 10 | full happy path, deploy smoke | full test suite and Playwright smoke |

### Manual happy path for final demo

1. Visit landing page.
2. Sign up/login.
3. Confirm dashboard loads.
4. Upload a TXT/PDF.
5. Generate roadmap.
6. Generate flashcards or quiz.
7. Ask RAG question from uploaded material.
8. Complete quiz/interview practice.
9. View progress.
10. Confirm usage/admin protections.

---

## 25. Daily Progress Note Template

```text
Day:
Branch:
Completed:
Files changed:
Commands run:
Errors:
Fixes:
Screenshots:
What I learned:
Pending:
Move next or polish?
```

### Daily closing checklist

- [ ] Does the feature work end-to-end?
- [ ] Does it look clean on mobile, tablet, and laptop?
- [ ] Did lint pass?
- [ ] Did typecheck pass?
- [ ] Did build pass?
- [ ] Did tests pass if tests exist?
- [ ] Did I commit on the correct branch?
- [ ] Can I explain what changed without reading the code?
- [ ] Did I write a short progress note?

---

## 26. Phase Prompt Template

Use this template for every implementation chat.

```text
ROLE:
You are a senior full-stack architect, Supabase expert, frontend implementation planner, and strict MVP scope controller for SkillForge AI.

CURRENT PHASE:
{{phase_name}}

SOURCE FILES TO READ FIRST:
- RESEARCH.md
- PRD.md
- DATABASE_SCHEMA.md
- AGENT_RULES.md
- DESIGN_SYSTEM.md
- PLAN.md
- Current phase instructions
- Current error/build output if debugging

ALLOWED SCOPE:
{{allowed_scope}}

FORBIDDEN SCOPE:
{{forbidden_scope}}

FILES ALLOWED TO TOUCH:
{{allowed_files}}

FILES FORBIDDEN TO TOUCH:
{{forbidden_files}}

BEFORE IMPLEMENTATION, EXPLAIN:
1. What files will be touched
2. Why each file is needed
3. What can break
4. How it will be tested

RULES:
- Do not jump phases.
- Do not add random features.
- Do not expose secrets.
- Do not trust client user_id.
- Follow Supabase RLS/user ownership rules.
- Use proxy.ts, not middleware.ts.
- Follow the approved neo-brutalist design system.
- Keep changes small and reviewable.

COMMAND GATES:
- npm run lint
- npm run typecheck
- npm run build
- npm run test from testing phase onward

EXIT CRITERIA:
{{exit_criteria}}

OUTPUT EXPECTATIONS:
- Give a clear plan first.
- Then provide implementation prompts/steps only when requested.
- Report commands and errors honestly.
```

---

## 27. Risk Management

| Risk | Prevention | Fallback | Cut Decision If Behind |
|---|---|---|---|
| Scope creep | Follow PRD and phase gates | Freeze new ideas into post-MVP list | Cut optional features first |
| Design drifting back to generic dark SaaS | Use `DESIGN_SYSTEM.md` tokens and checklist | Rework only affected screens | Cut polish, not identity |
| Supabase auth confusion | Keep Day 3 focused | Debug email/password before OAuth | Do not start Day 4 until auth works |
| Google OAuth callback issues | Configure localhost/prod URLs carefully | Keep email/password working | OAuth must still ship if auth scope approved |
| RLS mistakes | Add ownership checks early | Test User A/User B data isolation | Do not ship without ownership |
| File parsing failures | Support normal PDF/TXT first | Show processing failed state | Cut complex parsing/OCR |
| Embedding dimension uncertainty | Confirm before vector migration | Delay vector column until confirmed | Do not hardcode unverified dimension |
| AI output invalid JSON | Validate and retry once | Show safe failure | Reduce output complexity |
| Usage/rate-limit bugs | Add usage logs and simple checks | Use DB counters before Upstash | Cut Stripe before usage safety |
| Vercel build errors | Run build locally every phase | Fix build before merge | Cut new features until build passes |
| Too many features at once | One branch per phase | Return to last working commit | Cut optional features |

---

## 28. Cut List If Behind Schedule

### Cut first

1. Stripe test mode
2. Export PDF
3. Weak topic detection
4. Advanced admin
5. Advanced charts
6. Email provider
7. Multi-material chat
8. Coding task generation
9. Rich onboarding
10. Complex analytics

### Must never be cut

- Auth
- Email/password login
- Google OAuth login
- Protected dashboard
- Materials upload
- User ownership
- RAG chat
- Roadmap basics
- Flashcard or quiz basics
- Usage safety
- Responsive UI
- Build passing
- Deployment
- README architecture explanation

---

## 29. Final MVP Acceptance Checklist

- [ ] Approved docs exist.
- [ ] App scaffolded.
- [ ] Design system implemented.
- [ ] Email/password auth works.
- [ ] Google OAuth works.
- [ ] `proxy.ts` protects routes.
- [ ] `/auth/callback` works and remains public.
- [ ] Profile row created or loaded.
- [ ] User can create roadmap manually.
- [ ] User can upload material.
- [ ] Material processing status works.
- [ ] AI roadmap generation works.
- [ ] Flashcard generation works.
- [ ] Quiz generation works.
- [ ] RAG chat works from uploaded material.
- [ ] Vector search filters by `user_id`.
- [ ] Quiz attempts and scoring work.
- [ ] Mock interview basics work.
- [ ] Progress updates.
- [ ] Usage limits work.
- [ ] Rate limits protect AI routes.
- [ ] Admin route protected.
- [ ] Logs are safe.
- [ ] Mobile responsive.
- [ ] Accessibility basics pass.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes after tests are added.
- [ ] `npm run build` passes.
- [ ] Vercel deployment works.
- [ ] README explains project.

---

## 30. Final Plan Summary

### What this plan enables

This plan gives SkillForge AI a practical path from approved documents to a working 10-day MVP. It turns the project into phase-by-phase execution instead of random prompting.

### How agents should use this plan

Agents must use this plan to:

- know the current phase
- understand allowed and forbidden work
- choose correct files to touch
- apply command gates
- protect user ownership
- follow the approved UI system
- avoid scope creep
- keep the app buildable

### What should happen next

After `PLAN.md` is reviewed and approved, create the final Day 1 planning file:

```text
SKILLS.md
```

`SKILLS.md` should define the implementation skills, file-reading discipline, anti-hallucination rules, and phase-specific operating rules that AI coding agents must follow while building SkillForge AI.


### Final instruction

Do not start coding until the Day 1 documentation set is approved.

