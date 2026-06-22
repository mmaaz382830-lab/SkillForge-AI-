# SkillForge AI — SKILLS.md

**Project:** SkillForge AI  
**Document:** SKILLS.md  
**Version:** MVP / 10-Day Build Scope  
**Purpose:** Define the implementation skills, discipline, and anti-hallucination rules that future AI coding agents must follow while building SkillForge AI.

---

## 1. Document Purpose

### What SKILLS.md Is

`SKILLS.md` is an **AI coding-agent implementation skill playbook** for SkillForge AI.

It is not a personal learning-skills document for the user. It is a practical operating guide for AI agents that will help implement the project phase-by-phase.

This file explains how future coding agents should:

- Read the project before coding
- Inspect existing files before editing
- Follow the approved 10-day roadmap
- Stay aligned with the PRD, database schema, design system, agent rules, and plan
- Avoid hallucinated files, tables, routes, components, and dependencies
- Implement frontend, backend, Supabase, auth, RAG, AI, testing, debugging, Git, and deployment safely

### Why This File Exists

AI coding agents can move quickly, but they often make dangerous mistakes when they assume too much.

Common agent mistakes include:

- Creating files that do not match the project architecture
- Ignoring existing components and duplicating them
- Inventing table names not approved in `DATABASE_SCHEMA.md`
- Trusting client-provided `user_id`
- Skipping RLS and ownership checks
- Adding features outside the current phase
- Rebuilding UI in a generic dark SaaS style
- Claiming code was tested when it was not
- Hiding build errors or TypeScript problems

`SKILLS.md` exists to prevent those problems.

### How This Helps AI Coding Agents

This file gives agents repeatable skills for:

- Planning before implementation
- Reading before editing
- Making small safe changes
- Preserving working code
- Following the visual system
- Protecting user data
- Validating inputs and AI outputs
- Running command gates
- Debugging without random rewrites
- Summarizing honestly after work

### How This Prevents Hallucinated Code

An agent must not claim certainty until it has inspected the relevant files.

This file forces agents to:

- Read current docs
- Inspect the file tree
- Reuse existing patterns
- State assumptions clearly
- Ask when unclear
- Avoid inventing project structure
- Avoid saying “implemented” unless files were actually changed
- Avoid saying “tested” unless commands or manual checks were actually run

### How This Supports the 10-Day Build Workflow

SkillForge AI follows a strict 10-day MVP workflow:

| Day | Focus |
|---|---|
| Day 1 | Documentation and rules |
| Day 2 | Scaffold and design system |
| Day 3 | Auth, profile, proxy, Google OAuth |
| Day 4 | Learning goals and roadmaps CRUD |
| Day 5 | Materials upload system |
| Day 6 | AI generator system |
| Day 7 | RAG chat over uploaded notes |
| Day 8 | Quiz and interview engine |
| Day 9 | Admin, logs, rate limits, plans |
| Day 10 | Testing, polish, deployment |

Agents must not jump ahead. Every phase must pass its exit gate before moving forward.

---

## 2. Core Agent Skill Philosophy

### Main Philosophy

Read first. Inspect first. Build small. Protect user data. Follow the approved scope. Tell the truth.

### Core Rules

| Rule | Meaning |
|---|---|
| Read before writing | Understand docs and current code before generating changes. |
| Inspect before editing | Open relevant files before claiming what they contain. |
| Understand phase before implementing | The current phase controls what is allowed. |
| Touch only necessary files | Do not edit unrelated files. |
| Prefer existing patterns | Reuse architecture already in the repo. |
| Small changes over huge rewrites | Patch carefully instead of replacing working systems. |
| Explain assumptions | Say what is assumed and what was verified. |
| Do not fake success | Never claim build/test success without running checks. |
| Do not hide errors | Show errors and fix them directly. |
| Do not create random features | Only implement approved MVP scope. |
| Follow design system | Use the approved Neo-Brutalist Learning System. |

### Bad Agent Behavior

Agents must avoid:

- “I created it” when no file was changed
- “This should work” without inspecting related files
- “Build passed” without running build
- Creating random folders because they look clean
- Replacing a working feature with a new version without approval
- Adding extra providers, auth methods, tables, or pages
- Using dark SaaS UI instead of the approved light neo-brutalist system

### Good Agent Behavior

A good agent:

- Reads relevant docs and files
- Explains the plan
- Lists files to touch
- Makes a small focused change
- Runs command gates
- Fixes errors
- Summarizes truthfully
- Leaves the project easier to understand

---

## Downloaded Skills Governance

### Purpose

The builder may use Codex CLI for SkillForge AI and may have downloaded helper skills from `skills.sh`, including:

- `frontend-design`
- `ui-ux-pro-max`
- `find-skills`

Downloaded skills are **helper modules only**. They can improve implementation quality, review discipline, and UI/UX checks, but they must not override the approved SkillForge AI source-of-truth documents.

### Source-of-Truth Priority Order

When there is any disagreement between files, prompts, installed skills, or agent suggestions, use this exact priority order:

1. `PRD.md`
2. `PLAN.md`
3. `DATABASE_SCHEMA.md`
4. `DESIGN_SYSTEM.md`
5. `AGENT_RULES.md`
6. `SKILLS.md`
7. Downloaded skills from `skills.sh`

### Conflict Rule

If any downloaded skill conflicts with SkillForge AI scope, phase plan, folder architecture, database schema, auth/proxy rules, RAG rules, or visual design system, the SkillForge document wins.

Downloaded skills must never be used as justification to:

- expand MVP scope
- skip a phase
- change approved routes or folder architecture
- add unapproved database tables
- add unapproved dependencies
- replace the approved design system
- weaken auth, RLS, ownership, or RAG security rules

### Installed Skill Usage Rules

#### `frontend-design`

Use `frontend-design` only for:

- frontend quality
- responsive layout
- component polish
- avoiding generic AI UI
- improving visual hierarchy
- checking component consistency

It must follow `DESIGN_SYSTEM.md`.

It must not replace the approved SkillForge AI Neo-Brutalist Learning System.

#### `ui-ux-pro-max`

Use `ui-ux-pro-max` only for:

- UX review
- accessibility checks
- layout quality
- interaction checks
- visual polish
- mobile usability review

It must not replace `DESIGN_SYSTEM.md`.

It must not push:

- dark SaaS UI
- glassmorphism
- blue-violet AI palette
- finance-style UI
- generic dashboard patterns
- fake 3D dashboards
- random gradient/sparkle decoration

#### `find-skills`

Use `find-skills` only when a specific phase needs a specialized skill.

Do not install extra skills automatically.

Before installing or using a new skill, the agent must explain:

- why it is needed
- what problem it solves
- whether it conflicts with SkillForge docs
- whether it is necessary for the current phase

If the new skill is not necessary for the current phase, do not install it.

### Downloaded Skills Warning

Do not blindly follow downloaded skills.

Do not install many random skills.

Do not allow downloaded skills to expand project scope.

Do not use downloaded skills to justify unapproved dependencies, features, UI patterns, database tables, auth flows, RAG behavior, or architecture changes.

Downloaded skills can support implementation quality, but they are never the project authority.

### Codex CLI Rule

When using Codex CLI, the agent must first read the SkillForge AI docs, then optionally use downloaded skills as helper guidance.

Required Codex CLI order:

1. Read the active phase instruction.
2. Read the relevant SkillForge source-of-truth docs.
3. Inspect the project file tree.
4. Inspect relevant files before editing.
5. Use downloaded skills only as helper guidance.
6. Explain planned changes and risks.
7. Implement only approved scope.
8. Run command gates.
9. Report results honestly.

Codex must still inspect project files before editing and must still run command gates.

### Final Governance Note

Downloaded skills can improve agent behavior, but SkillForge AI docs remain the project law.

---

## 3. Universal Agent Workflow Skill

Every implementation agent must follow this workflow.

### Step 1: Read Current Phase Instruction

Identify the active phase:

- Day 2 Scaffold/UI
- Day 3 Auth/Proxy
- Day 4 Roadmaps CRUD
- Day 5 Materials Upload
- Day 6 AI Generator
- Day 7 RAG Chat
- Day 8 Quiz/Interview
- Day 9 Admin/Rate Limits
- Day 10 Testing/Deploy

Do not implement work outside the active phase.

### Step 2: Read Relevant Approved Docs

Minimum docs to check:

- `PRD.md` for product requirements
- `PLAN.md` for phase scope
- `AGENT_RULES.md` for operating rules
- `DESIGN_SYSTEM.md` for UI changes
- `DATABASE_SCHEMA.md` for database/API changes
- `RESEARCH.md` for product/stack context when needed

### Step 3: Inspect Project File Tree

Before creating files, inspect the actual structure.

The agent must know:

- What folders already exist
- What naming conventions are used
- Where similar files live
- Whether a helper/component already exists

### Step 4: Identify Existing Patterns

Look for existing patterns before inventing:

- Existing UI components
- Existing API response style
- Existing Supabase client helpers
- Existing validators
- Existing layout structure
- Existing feature folder conventions
- Existing error handling

### Step 5: List Files to Touch

Before editing, list:

- File path
- Reason for edit
- Expected change
- Risk

### Step 6: Explain Planned Changes

The agent must explain:

1. What will change
2. Why it is needed
3. What could break
4. How it will be tested

### Step 7: Implement Only Approved Scope

Implement exactly the current task. Do not add “nice-to-have” extras.

### Step 8: Run Command Gates

Required for implementation phases:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

From Day 10 or testing phase onward:

- `npm run test`

### Step 9: Fix Errors

If a command fails:

- Stop phase completion
- Read the exact error
- Fix the smallest cause
- Rerun the failing command
- Do not hide the failure

### Step 10: Summarize Changes and Next Steps

After implementation, summarize:

- What changed
- Files changed
- Commands run
- Results
- Problems fixed
- Remaining risks
- Next recommended step

### Strict Certainty Rule

If the agent has not inspected the relevant files, it must not claim implementation certainty.

Correct:

> I need to inspect the existing auth helpers before changing this.

Incorrect:

> I’ll just create a new auth helper because the project probably does not have one.

---

## 4. File Reading Skill

### Core Rule

Never edit blind.

Agents must read files before changing architecture, components, API routes, database logic, or design styling.

### Required Reading Rules

| Before Doing This | Read This First |
|---|---|
| Adding dependency | `package.json` |
| Creating folder | Existing folder tree |
| Creating component | Existing `components/ui` and related feature folder |
| Creating Supabase client | Existing `lib/supabase` helpers |
| Creating API route | Existing `app/api` patterns |
| Creating type | Existing `types` and feature types |
| UI change | `DESIGN_SYSTEM.md` |
| Database/API change | `DATABASE_SCHEMA.md` |
| AI/RAG behavior | `AGENT_RULES.md` |
| Phase decision | `PLAN.md` |
| Product scope decision | `PRD.md` |

### When to Read the Full File

Read the full file when:

- Editing that file directly
- Changing auth or security logic
- Changing shared helpers
- Changing layout or design tokens
- Changing database access logic
- Debugging a complex error in that file

### When Partial Reading Is Enough

Partial reading is acceptable when:

- Checking a small known component API
- Searching for a specific function name
- Looking at imports/exports
- Confirming naming patterns

### When to Search

Search the repo when:

- Looking for an existing component
- Looking for a helper before creating a new one
- Checking whether a route already exists
- Finding all usages before renaming
- Debugging duplicated logic

### When to Ask for Clarification

Ask before proceeding when:

- The requested work conflicts with approved docs
- The current phase is unclear
- The file structure is missing or unexpected
- A change requires deleting user code
- A dependency choice is not approved
- A schema change is needed but not in `DATABASE_SCHEMA.md`

### When Not to Assume

Do not assume:

- A dependency is installed
- A file path exists
- A component exists
- A table exists
- An API route exists
- A helper exists
- A user wants a new feature
- A design direction can be changed

---

## 5. File Editing Skill

### Safe Editing Rules

Agents must:

- Patch small sections where possible
- Preserve working code
- Avoid formatting-only changes mixed with logic changes
- Avoid large rewrites unless clearly required
- Avoid deleting user code without approval
- Avoid renaming files casually
- Avoid changing folder architecture casually
- Avoid editing unrelated files
- Keep changes reviewable

### Before Editing, State This

| Required Detail | Meaning |
|---|---|
| File path | Exact file to edit |
| Reason | Why the edit is needed |
| Expected change | What will be changed |
| Risk | What could break |

### Good Edit Behavior

Example plan:

| File | Reason | Expected Change | Risk |
|---|---|---|---|
| `features/auth/components/login-form.tsx` | Add Google OAuth button | Add secondary button below divider | Button could call wrong auth helper |
| `app/auth/callback/route.ts` | Handle OAuth callback | Exchange code and ensure profile | Redirect loop if callback misconfigured |

### Bad Edit Behavior

Avoid:

- Replacing all auth files because one button is needed
- Creating `middleware.ts` instead of using `proxy.ts`
- Moving components into random folders
- Deleting old components without checking usage
- Reformatting 20 files while fixing one bug

---

## 6. Frontend Skill

### Core Frontend Rules

- Use Next.js App Router correctly.
- Keep `page.tsx` and `layout.tsx` clean.
- Put feature-specific UI inside feature folders.
- Use reusable base components from `components/ui`.
- Avoid duplicated UI components.
- Use TypeScript props properly.
- Handle loading, error, and empty states.
- Keep mobile responsive from the start.
- Use Server Components where practical.
- Use Client Components only when interactivity is needed.
- Never put backend secrets in frontend code.

### Page Composition Rules

A page should mostly compose feature components.

Good page responsibilities:

- Fetch safe server-side data when appropriate
- Render layout shell
- Pass data to feature components
- Show loading/error/empty states

Bad page responsibilities:

- Huge business logic blocks
- Raw database logic everywhere
- AI provider calls
- Secret usage
- Duplicated form logic

### Component Splitting Rules

Split components when:

- A section is reused
- A file becomes hard to scan
- UI and logic can be cleanly separated
- A feature has distinct states

Do not split components just to create many tiny files with no purpose.

### Form Rules

Forms must:

- Have labels
- Validate required fields
- Show readable errors
- Preserve input after safe failures
- Disable submit during loading
- Use direct button copy
- Never rely only on placeholder text

### State Handling Rules

Use the simplest state tool that works:

| Need | Recommended Approach |
|---|---|
| Small local UI state | React state |
| Server-loaded data | Server component or fetch pattern |
| Form state | React Hook Form or simple controlled fields, depending setup |
| Cross-page global state | Only add store if truly needed |

Do not introduce a global store for every small interaction.

### Responsive Rules

- Mobile layout is single-column by default.
- Minimum tap target should be 44px.
- Tables must become cards or scroll safely on mobile.
- Dashboard cards should stack cleanly.
- Do not use tiny text on mobile.
- Chat composer must remain usable on mobile.

---

## 7. UI/UX Skill

### Core UI Rule

All UI implementation must follow `DESIGN_SYSTEM.md`.

SkillForge AI uses the approved **Neo-Brutalist Learning System**, not a generic dark SaaS theme.

### Required Visual Direction

Agents must use:

- Light-first warm paper theme
- Warm paper background
- Black ink borders
- Hard offset shadows
- Space Grotesk-style headings
- Inter-style body text
- Color-coded learning cards
- Physical press/lift interactions
- Large readable UI states

### Strict UI Avoid List

Do not use:

- Generic dark SaaS dashboard
- Blue-violet default AI palette
- Glassmorphism
- Random sparkles
- Fake 3D dashboards
- Soft blurred shadows
- Thin gray borders everywhere
- Low-contrast gray text
- Unstyled default shadcn look
- Finance copy from the visual inspiration

### Landing Page Skill

Landing pages should:

- Use bold editorial hero type
- Use warm paper background
- Show stacked learning-card visuals
- Show Upload → Generate → Practice workflow
- Use color-blocked feature cards
- Use direct product copy
- Avoid fake analytics dashboards

### Dashboard UI Skill

Dashboard should:

- Show welcome panel
- Show quick actions
- Show useful stats
- Show usage remaining
- Show current roadmap/progress
- Show recent activity
- Use hard-shadow cards
- Avoid giant fake charts

### Auth UI Skill

Auth pages must:

- Support email/password
- Support Google OAuth
- Use a brutal bordered card
- Keep `/auth/callback` loading state clear
- Show safe error messages
- Avoid dark full-screen auth UI

### Materials UI Skill

Materials UI must:

- Use a big dropzone card
- Show PDF/TXT/pasted text support
- Show file size help
- Show processing status
- Show material cards with actions
- Show failed processing clearly

### RAG Chat UI Skill

RAG chat should:

- Feel like study answer cards, not a ChatGPT clone
- Show selected material
- Show source snippets only when supported
- Use blue/info accent for source-grounded answers
- Show “insufficient context” clearly

### Roadmap UI Skill

Roadmaps should:

- Use checklist card metaphor
- Show task completion clearly
- Use yellow highlight for roadmap/planning
- Use black outlined progress bars
- Avoid overbuilt timeline visuals in MVP

### Flashcard UI Skill

Flashcards should:

- Look like physical study cards
- Use large readable text
- Support front/back interaction
- Show topic/difficulty badges
- Avoid cramped tiny cards

### Quiz UI Skill

Quiz UI should:

- Use focused question panels
- Use thick-bordered option cards
- Show selected/correct/wrong states with labels
- Include score summary
- Include wrong-answer review

### Interview UI Skill

Interview UI should:

- Be text-only for MVP
- Show one question at a time
- Use large answer textarea
- Show structured feedback card
- Include strengths, missing points, improved answer, score, and next tip

### Admin UI Skill

Admin UI should:

- Be minimal and functional
- Use cream/white tables with black borders
- Show role/plan badges
- Avoid exposing private note content
- Avoid decorative fake analytics

---

## 8. Backend/API Skill

### Core Backend Rules

- Server routes must validate input.
- Server routes must check session.
- Never trust client-provided `user_id`.
- Backend creates database IDs.
- Backend sets `user_id` from the server session.
- Return safe errors.
- Use consistent response shapes.
- Keep business logic out of UI components.
- Keep API keys server-side only.
- Log errors safely where required.
- Do not expose stack traces to users.

### API Route Structure Skill

A safe API route should conceptually follow this order:

1. Check method
2. Check session
3. Parse input
4. Validate input
5. Check ownership
6. Check plan/usage/rate limit if needed
7. Execute business logic
8. Save data safely
9. Log usage/error where needed
10. Return safe response

### Validation Pattern

Validate:

- Body fields
- Route params
- Query params
- IDs
- File metadata
- AI output shape
- User ownership

Frontend validation is not enough. Backend validation is required.

### Error Response Pattern

Good user-facing errors:

- “Please log in to continue.”
- “You do not have access to this item.”
- “Could not save roadmap. Please try again.”
- “Usage limit reached.”

Bad user-facing errors:

- Raw SQL errors
- Stack traces
- Provider JSON dumps
- Service role failure details
- OAuth provider internals

### Ownership Check Pattern

Any request touching user-owned data must prove:

- The user is authenticated
- The row belongs to the session user
- The operation is allowed

Never use `user_id` sent by the frontend as the source of truth.

### Logging Pattern

Log only safe details:

- Route
- Status
- Safe error code
- User ID if available
- Feature type
- Duration
- Non-sensitive metadata

Do not log:

- API keys
- OAuth tokens
- Raw passwords
- Full private notes
- Secret env values

---

## 9. Supabase Skill

### Core Supabase Rules

- Use Supabase Auth for email/password and Google OAuth.
- Use Supabase Postgres for app data.
- Use Supabase Storage for private materials.
- Use Supabase pgvector for embeddings.
- Use RLS for user-owned tables.
- Use `profiles` linked to `auth.users`.
- Follow `DATABASE_SCHEMA.md`.
- Do not invent tables without approval.
- Do not bypass RLS casually.
- Do not expose service role key to the client.
- Prefer server-side operations for sensitive logic.

### Client Usage Rules

Browser/client Supabase usage may be used for:

- Auth state
- Safe user reads allowed by RLS
- Simple profile display if permitted
- Public-safe interactions

Client must never use:

- Service role key
- Gemini API key
- Stripe secret key
- Provider secrets

### Server Client Rules

Server-side Supabase client should be used for:

- Session-aware operations
- Protected routes
- API route data operations
- Auth callback handling
- Profile creation/loading
- Ownership-sensitive queries

### Service Role Rules

Service role is powerful and dangerous.

Use only when:

- Server-only
- RLS bypass is intentionally required
- Operation cannot be safely done through normal user session
- The code manually enforces ownership and admin checks

Never expose service role to frontend.

### RLS Awareness Rules

Agents must understand:

- RLS filters rows at the database level
- RLS does not automatically protect unsafe column updates
- Sensitive profile updates must go through safe server APIs
- Admin policies must be explicit

### Storage Bucket Rules

- Use private bucket named `materials`.
- Store files under user-owned paths.
- Validate file type and size before upload/processing.
- Do not expose public URLs for private notes.
- Use signed URLs only when needed.

---

## 10. Auth and Proxy Skill

### Core Rules

- Use `proxy.ts`, not `middleware.ts`.
- `/auth/callback` must remain public.
- `/login` and `/signup` redirect logged-in users to `/dashboard`.
- `/dashboard` routes require auth.
- `/admin` routes require admin role.
- Email/password and Google OAuth share the same `profiles` table.
- Profile creation must work for both auth methods.
- Users must not update their own role or plan directly.
- Redirect handling must be safe.

### Google OAuth Callback Skill

The OAuth callback flow must:

1. Receive callback from Supabase OAuth
2. Exchange callback/session safely
3. Load authenticated user
4. Create or load profile row
5. Map Google metadata safely
6. Redirect to `/dashboard`
7. Show safe error on failure

Safe error copy:

- “Google sign-in was cancelled.”
- “Google sign-in failed. Please try again.”
- “Could not complete login. Please try again.”
- “Account exists. Please sign in using your original method.”

### Session Refresh Skill

Session handling must:

- Keep logged-in users logged in after refresh
- Redirect expired sessions cleanly
- Avoid client-only protection for private routes
- Support server-side user checks

### Route Protection Skill

| Route Type | Rule |
|---|---|
| Public routes | Accessible while logged out |
| `/auth/callback` | Public and never blocked |
| `/dashboard/*` | Auth required |
| `/admin/*` | Auth + admin role required |
| `/login`, `/signup` | Redirect logged-in users to dashboard |

### Admin Protection Skill

Admin checks must:

- Use server-side role verification
- Require `profiles.role = admin`
- Block normal users
- Never trust client-visible role alone

---

## 11. Database/RLS Skill

### Core Database Rules

- Follow `DATABASE_SCHEMA.md` exactly unless approved.
- Every user-owned table has `user_id`.
- RLS must be enabled on user-owned tables.
- Vector search filters by `user_id`.
- `material_chunks` duplicates `user_id` intentionally.
- Usage is calculated from `profiles.plan + usage_logs`.
- `billing_customers` is optional Day 9 only.
- Do not add advanced billing tables.
- Do not add teams/workspaces.
- Do not add OCR-specific tables.

### Migration Planning Skill

Before creating a migration, agents must:

- Confirm the table exists in `DATABASE_SCHEMA.md`
- Confirm the phase allows it
- Confirm relationships
- Confirm indexes
- Confirm RLS requirements
- Confirm storage policy if needed

Do not create migrations from guesses.

### Index Awareness Skill

Agents must consider indexes for:

- `user_id`
- parent IDs like `material_id`, `roadmap_id`, `quiz_id`, `session_id`
- `created_at` for list views
- vector embeddings for similarity search
- usage period queries

### RLS Policy Review Skill

Review policies for:

- SELECT own rows
- INSERT own rows
- UPDATE own rows
- DELETE own rows where allowed
- Admin read access where explicitly needed
- No private note exposure in admin logs

### Data Ownership Skill

Data ownership must be enforced in:

- Database policies
- API route queries
- AI routes
- Upload routes
- Vector search
- Admin access

---

## 12. AI Generation Skill

### Core AI Rules

- Gemini API key is server-side only.
- AI outputs must be validated before saving.
- Do not save malformed JSON.
- Backend creates DB IDs.
- Backend sets `user_id` from session.
- Usage limit is checked before AI call.
- Usage is logged after successful AI call.
- Retry invalid output once if safe.
- Show safe error if AI fails.
- Keep one AI provider for MVP.

### Roadmap Generation Skill

Roadmap generation must:

- Use goal/material/difficulty input
- Generate 5–10 realistic tasks
- Return structured output
- Avoid unsupported claims from material
- Save roadmap and tasks only after validation

### Flashcard Generation Skill

Flashcards must:

- Use material facts
- Have front/back content
- Avoid duplicates
- Respect requested count
- Include topic and difficulty when useful

### Quiz Generation Skill

Quizzes must:

- Use multiple choice for MVP
- Have distinct options
- Have exactly one correct answer
- Include explanation
- Validate options before saving

### Interview Question Generation Skill

Interview generation must:

- Stay text-only
- Generate relevant questions
- Include expected answer points
- Avoid overly broad questions
- Respect difficulty

### Interview Feedback Skill

Feedback must:

- Be constructive
- Include strengths
- Include missing points
- Include improved answer
- Include score if used
- Not overpraise weak answers

---

## 13. RAG Skill

### Core RAG Flow

RAG implementation must follow this flow:

1. Upload material
2. Extract text
3. Chunk text
4. Generate embeddings
5. Store chunks with `user_id`
6. Embed user query
7. Retrieve top-k chunks
8. Filter by `user_id`
9. Generate grounded answer
10. Store `source_chunk_ids` where possible

### Chunking Skill

Chunks should:

- Preserve useful context
- Avoid being too tiny
- Avoid being too huge
- Store `chunk_index`
- Store character or token count
- Keep relation to material and user

### Embedding Skill

Agents must:

- Confirm Gemini embedding dimension before vector migration
- Store embeddings in `material_chunks`
- Keep embedding generation server-side
- Handle embedding failures safely

### Retrieval Skill

Vector retrieval must:

- Filter by `user_id`
- Optionally filter by `material_id`
- Use top-k retrieval
- Avoid cross-user search
- Return chunk IDs, content, material ID, similarity, and metadata

### Grounded Answering Skill

When material is selected:

- Answer only from retrieved chunks
- Say if context is insufficient
- Do not invent citations
- Do not pretend notes contain missing content

### Source Display Skill

Source cards should:

- Display only real retrieved chunks
- Show short snippets
- Avoid fake page numbers unless metadata supports them
- Use `source_chunk_ids` when possible

### Insufficient Context Handling

If no useful chunk is found, return:

> I could not find enough context in your uploaded material.

Do not answer from general knowledge unless the user explicitly asks for a general answer.

---

## 14. File Upload Skill

### MVP Upload Scope

Supported for MVP:

- PDF
- TXT
- Pasted text

Not supported unless approved:

- DOCX
- Scanned OCR extraction
- Images
- Audio/video
- ZIP uploads

### Upload Rules

- Validate file type.
- Validate file size.
- Use private Supabase Storage bucket.
- Store metadata in `materials` table.
- Show processing status.
- Handle extraction failure safely.
- Do not expose private files.

### Edge Cases to Handle

| Edge Case | Required Behavior |
|---|---|
| Empty file | Reject or mark failed with friendly message |
| Password-protected PDF | Mark failed safely |
| PDF with no extractable text | Show clear extraction failure |
| Unsupported type | Block before upload/processing |
| Oversized file | Block with size message |
| Upload interrupted | Show retry path |
| User logs out | Stop protected operation safely |

### Processing Status

Use clear statuses:

- pending
- processing
- completed
- failed

Do not leave users guessing what happened.

---

## 15. Validation Skill

### Validation Areas

Agents must validate:

- Forms
- API request bodies
- Route params
- Query params
- File type
- File size
- AI output
- Database ownership
- Auth session
- Admin role

### Backend Validation Rule

Frontend validation improves UX, but backend validation protects the app.

Do not rely on frontend validation alone.

### Friendly Validation Messages

Good:

- “Goal title is required.”
- “Unsupported file type. Please upload PDF or TXT.”
- “Please select a processed material first.”
- “Please enter an answer before submitting.”

Bad:

- “Invalid.”
- “Bad request.”
- Raw Zod/SQL/provider errors

---

## 16. Error Handling Skill

### Core Error Rules

- Fail safely.
- Do not expose raw SQL errors.
- Do not expose provider stack traces.
- Do not hide errors.
- Give retry path where useful.
- Log safely.
- Preserve form input after failed submit where safe.
- If build command fails, stop and fix.

### Good Error Handling

Good user-facing examples:

- “Could not upload material. Please try again.”
- “This material is still processing.”
- “Usage limit reached. Please try again later or upgrade your plan.”
- “Could not complete login. Please try again.”

### Bad Error Handling

Bad examples:

- Showing SQL stack traces to users
- Showing API provider raw JSON
- Swallowing errors silently
- Returning success when database save failed
- Logging private note text in error metadata

### Retry Rules

Retry is useful for:

- Temporary AI timeout
- Invalid AI output once
- Upload network failure

Retry is not useful for:

- Unauthorized access
- Unsupported file type
- Usage limit reached
- Missing required input

---

## 17. Testing Skill

### Required Command Gates

Every implementation phase requires:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

From testing phase onward:

- `npm run test`

### Testing Expectations

| Test Type | Purpose |
|---|---|
| Manual smoke checks | Verify feature works in browser |
| Unit tests | Validators/utilities |
| Integration tests | API ownership and data flows |
| Playwright smoke tests | Auth/dashboard happy path |
| Responsive QA | Mobile/tablet/desktop layout |

### Phase-Specific Testing

| Phase | Testing Focus |
|---|---|
| Day 2 | UI smoke, responsive shell, component states |
| Day 3 | Auth, Google OAuth, redirects, session refresh, proxy |
| Day 4 | CRUD ownership, roadmap task progress |
| Day 5 | Upload validation, processing states, private materials |
| Day 6 | AI output validation, usage logs, safe failures |
| Day 7 | RAG retrieval, `user_id` filtering, insufficient context |
| Day 8 | Quiz scoring, wrong-answer review, interview feedback |
| Day 9 | Admin protection, rate limits, plan checks, logs |
| Day 10 | Full test pass, deployment smoke, README/demo flow |

### Failure Rule

A test failure means the phase is not complete.

---

## 18. Debugging Skill

### Debugging Workflow

Agents must debug in this order:

1. Read the exact error
2. Identify file and line
3. Reproduce the issue
4. Check recent changes
5. Fix the smallest possible cause
6. Rerun the failing command
7. Explain root cause after fixing

### Do Not Debug by Guessing

Avoid:

- Rewriting unrelated files
- Installing random packages
- Adding `any` everywhere
- Disabling ESLint
- Ignoring build errors
- Blaming framework without evidence

### TypeScript Debugging

When TypeScript fails:

- Read the type error carefully
- Find the mismatched type
- Reuse existing project types
- Avoid unsafe `any`
- Avoid `@ts-ignore` unless explicitly approved

### ESLint Debugging

When lint fails:

- Fix unused variables
- Fix unsafe types
- Fix hook dependency issues carefully
- Do not disable rules globally

### Build Debugging

When build fails:

- Check server/client boundaries
- Check missing env references
- Check dynamic imports
- Check invalid route exports
- Check TypeScript errors hidden by dev mode

### Runtime Debugging

When runtime fails:

- Reproduce in browser
- Check console
- Check server logs
- Check network request
- Check auth/session state
- Check API response

### Supabase/RLS Debugging

When Supabase data is missing:

- Confirm session user exists
- Confirm row `user_id`
- Confirm RLS policy
- Confirm query filters
- Confirm API is not using client-provided user ID

### OAuth Debugging

When Google OAuth fails:

- Check redirect URL
- Check Supabase provider settings
- Check `/auth/callback` route is public
- Check localhost vs production URL
- Check profile creation
- Show safe user error

### AI Output Debugging

When AI output fails:

- Inspect raw model output server-side
- Compare with expected schema
- Retry once if safe
- Do not save invalid output
- Return friendly error

---

## 19. Git and Branch Skill

### Branch Rule

One phase = one branch.

Do not work directly on `main`.

### Approved Branches

- `phase-01-research-prd`
- `phase-02-design-system`
- `phase-03-auth-proxy`
- `phase-04-roadmaps-crud`
- `phase-05-materials-upload`
- `phase-06-ai-generator`
- `phase-07-rag-chat`
- `phase-08-quiz-interview`
- `phase-09-admin-security-billing`
- `phase-10-testing-deploy`

### Commit Rules

- Commit small logical changes.
- Use meaningful commit messages.
- Do not commit `.env`.
- Do not commit generated junk.
- Do not mix unrelated phase changes.

### Commit Message Examples

Good:

- `feat(auth): add google oauth callback flow`
- `feat(materials): add upload validation states`
- `fix(rag): filter vector search by user id`
- `chore(ui): add neo-brutalist base button variants`

Bad:

- `changes`
- `final`
- `fix all`
- `random updates`

### Merge Conflict Rule

If a merge conflict happens:

1. Explain which files conflict
2. Explain why conflict happened
3. Resolve carefully
4. Rerun command gates

---

## 20. Dependency Management Skill

### Core Rules

- Check `package.json` first.
- Do not install random packages.
- Prefer the approved stack.
- Install only when needed.
- Explain why dependency is needed.
- Avoid heavy OCR/document libraries in MVP unless approved.
- Avoid multiple UI libraries.
- Avoid multiple AI SDKs.
- Keep bundle size reasonable.

### Approved Stack Bias

Prefer:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or custom wrappers if already chosen
- Supabase
- Gemini API
- Upstash Redis if rate limiting is implemented
- Vitest / React Testing Library
- Playwright for smoke tests if time allows

### Avoid Without Approval

- Multiple component libraries
- Heavy chart libraries for MVP
- OCR libraries
- DOCX parsing libraries
- Multiple AI provider SDKs
- State libraries for simple local state

---

## 21. Environment Variables Skill

### Core Rules

- Use `.env.local` locally.
- Keep `.env.example` safe.
- Never expose server secrets.
- Prefix only safe browser env vars with `NEXT_PUBLIC_`.
- Gemini key is server-side only.
- Supabase service role is server-side only.
- OAuth secrets are configured in provider dashboards/Supabase.
- Validate env presence where useful.
- Give clear missing-env errors.

### Expected Env Categories

| Variable | Visibility | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser-safe | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser-safe | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | privileged server operations only if needed |
| `GEMINI_API_KEY` | server-only | AI generation and embeddings |
| `UPSTASH_REDIS_REST_URL` | server-only | optional rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | server-only | optional rate limiting |
| `NEXT_PUBLIC_APP_URL` | browser-safe if needed | app base URL |
| `STRIPE_SECRET_KEY` | server-only | optional Day 9 test mode |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser-safe | optional Day 9 test mode |
| `STRIPE_WEBHOOK_SECRET` | server-only | optional Day 9 test mode |
| `RESEND_API_KEY` | server-only | optional email flows |

### Missing Env Rule

Missing env errors should be clear:

Good:

> Missing GEMINI_API_KEY. AI generation is unavailable.

Bad:

> Cannot read properties of undefined.

---

## 22. Documentation Skill

### When to Update Docs

Update documentation when:

- Architecture changes
- Env setup changes
- Routes change
- Database schema changes
- New commands are added
- Deployment steps change
- Known limitations change

### Documentation Must Include

- Setup commands
- Env variables
- Folder architecture
- Demo flow
- Current limitations
- Test commands
- Deployment notes

### Honesty Rule

Docs must not claim features that are not implemented.

Correct:

> Stripe test mode is planned for Day 9 and optional.

Incorrect:

> Full billing system is complete.

---

## 23. Code Review Skill

Before considering work complete, agents must self-review.

### Self-Review Checklist

- Is this in the current phase?
- Did I read relevant files?
- Did I touch only required files?
- Is user ownership protected?
- Are errors handled safely?
- Are loading, empty, and error states included?
- Does UI follow `DESIGN_SYSTEM.md`?
- Does mobile layout work?
- Did command gates pass?
- Can the builder explain this?

### Review Red Flags

Stop and fix if:

- Client sends `user_id` as trusted source
- Service role appears in client code
- UI ignores design system
- API returns raw errors
- AI output is saved without validation
- Vector search lacks `user_id` filter
- Build commands fail

---

## 24. Anti-Hallucination Skill

### Strict Rules

Agents must not:

- Invent file paths
- Invent table names
- Invent route names
- Invent env vars
- Invent component names
- Assume a dependency exists
- Assume database schema exists
- Assume auth helper exists
- Create duplicate utilities
- Say “implemented” unless code was actually changed
- Say “tested” unless command/manual test was actually run

### If Unsure

If unsure, the agent must:

1. Inspect files
2. Search the repo
3. Read approved docs
4. Ask for clarification

### Correct Language

Use honest wording:

- “I inspected these files...”
- “I found this existing pattern...”
- “I have not run the command yet.”
- “This is an assumption until verified.”

Avoid fake certainty:

- “This definitely exists” without reading
- “The build passes” without running
- “I updated it” without file changes

---

## 25. Agent Response Format Skill

### Before Coding Response Format

Agents should respond with:

```text
Phase:
Goal:
Files to read:
Files likely to touch:
Risk:
Test plan:
Proceeding / Waiting for approval:
```

### After Coding Response Format

Agents should respond with:

```text
What changed:
Files changed:
Commands run:
Results:
Problems fixed:
Remaining risks:
Next recommended step:
```

### Debugging Response Format

Agents should respond with:

```text
Error summary:
Root cause:
Fix applied:
Command rerun:
Result:
```

### Response Honesty Rules

- Do not hide failed commands.
- Do not claim tests passed if they were not run.
- Do not claim a file exists if not inspected.
- Do not bury important risks.

---

## 26. Phase-Specific Skill Matrix

| Phase | Required Agent Skills | Files/Docs to Read | Common Hallucination Risk | Must Not Do | Exit Skill Check |
|---|---|---|---|---|---|
| Day 2 Scaffold/UI | Next.js structure, design tokens, responsive UI, base components | `DESIGN_SYSTEM.md`, `PLAN.md`, `AGENT_RULES.md`, file tree | Recreate generic dark SaaS UI | Add auth/AI/backend logic | UI foundation matches design; lint/typecheck/build pass |
| Day 3 Auth/Proxy | Supabase Auth, Google OAuth, profile ensure, proxy redirects | `PRD.md`, `DATABASE_SCHEMA.md`, `PLAN.md`, auth files | Create `middleware.ts`; split OAuth profile table | Uploads, AI, RAG, full admin | Auth works; callback works; profile exists; route guards work |
| Day 4 Roadmaps CRUD | CRUD, RLS awareness, ownership checks, progress basics | `DATABASE_SCHEMA.md`, `PRD.md`, existing API/UI patterns | Trust client `user_id` | AI roadmap generation | User-owned CRUD works; no cross-user access |
| Day 5 Materials Upload | Storage, file validation, processing states | `DATABASE_SCHEMA.md`, `DESIGN_SYSTEM.md`, upload/storage files | Add OCR/DOCX too early | Full RAG/AI generation | Valid files upload; bad files blocked; user sees own files |
| Day 6 AI Generator | Server-side Gemini, output validation, usage logs | `AGENT_RULES.md`, `DATABASE_SCHEMA.md`, `PLAN.md` | Save malformed AI JSON | Add multiple providers/agents | Valid outputs save; invalid output fails safely |
| Day 7 RAG Chat | Chunking, embeddings, vector search, grounded answers | `DATABASE_SCHEMA.md`, `AGENT_RULES.md`, RAG files | Search chunks across users | Public sharing or fake citations | RAG filters by user; insufficient context works |
| Day 8 Quiz/Interview | Quiz scoring, review, interview feedback, progress events | `PRD.md`, `AGENT_RULES.md`, quiz/interview schema | Add voice/video/spaced repetition | Advanced analytics | User can practice, score, review, get feedback |
| Day 9 Admin/Rate Limits | Admin role, logs, usage limits, Upstash, optional Stripe test | `DATABASE_SCHEMA.md`, `PLAN.md`, admin routes | Add real billing lifecycle | Invoices/taxes/refunds/full analytics | Normal users blocked; limits/logs safe |
| Day 10 Testing/Deploy | Test writing, responsive QA, deployment, README | all approved docs | Add new features during polish | Architecture rewrites | lint/typecheck/test/build pass; deployed demo works |

---

## 27. Common Failure Patterns and Prevention

| Failure Pattern | Why It Is Bad | Prevention Rule | Fix If It Happens |
|---|---|---|---|
| Agent creates `middleware.ts` instead of `proxy.ts` | Violates project routing rule | Always read auth/proxy rules first | Rename/convert to `proxy.ts` and retest redirects |
| Agent makes dark SaaS UI again | Violates approved design system | Read `DESIGN_SYSTEM.md` before UI work | Replace with warm paper/brutalist system |
| Agent trusts client `user_id` | Data leak risk | Backend gets user from session | Refactor API to use session user ID |
| Agent forgets RLS | User data may leak | Follow `DATABASE_SCHEMA.md` policies | Add/verify RLS and test cross-user access |
| Agent creates duplicate Supabase client | Inconsistent auth/session bugs | Inspect `lib/supabase` first | Consolidate clients into approved helpers |
| Agent exposes API key | Critical security issue | Server-only env vars | Remove from client, rotate key if exposed |
| Agent creates random table | Schema drift | Use only approved schema | Remove/replace with approved table |
| Agent skips mobile layout | Bad demo UX | Mobile-first checks each phase | Fix responsive layout before phase exit |
| Agent saves invalid AI JSON | Broken DB/UI state | Validate before saving | Add validator and cleanup bad records |
| Agent retrieves chunks across users | Private data leak | Always filter vector search by `user_id` | Patch retrieval/RPC and test with two users |
| Agent adds Stripe too early | Scope creep | Stripe optional Day 9 only | Remove or defer billing code |
| Agent adds DOCX/OCR too early | Complex MVP drift | PDF/TXT/pasted text only | Remove feature or mark post-MVP |
| Agent skips command gates | Hidden broken build | Run required commands | Run gates and fix failures |

---

## 28. Final Agent Skill Checklist

Before calling any implementation complete, the agent must confirm:

- [ ] I know the current phase.
- [ ] I read the relevant approved docs.
- [ ] I inspected the existing files.
- [ ] I listed files to touch.
- [ ] I explained risks.
- [ ] I followed the design system.
- [ ] I protected user ownership.
- [ ] I avoided scope creep.
- [ ] I handled loading/error/empty states where relevant.
- [ ] I validated inputs.
- [ ] I avoided fake certainty.
- [ ] I did not invent routes, tables, env vars, or components.
- [ ] I ran command gates, or clearly stated why they were not run.
- [ ] I summarized changes honestly.

---

## 29. Final Summary

### What SKILLS.md Protects

`SKILLS.md` protects SkillForge AI from:

- hallucinated code
- random file creation
- duplicated components
- unsafe auth logic
- weak RLS/ownership mistakes
- generic UI drift
- unvalidated AI output
- broken build gates
- scope creep
- fake progress claims

### How Future Agents Should Use It

Before every implementation chat, agents should read this file along with:

- `PRD.md`
- `DATABASE_SCHEMA.md`
- `AGENT_RULES.md`
- `DESIGN_SYSTEM.md`
- `PLAN.md`

Then they should follow the current phase only.

### How the Builder Should Use It

Before asking an AI agent to code, the builder should remind the agent:

- Read `SKILLS.md` first.
- State the current phase.
- Inspect files before editing.
- Explain plan before implementation.
- Run command gates before claiming completion.

### Important Reminder

This file is for **agent implementation skills**, not personal learning skills.

It tells AI coding agents how to behave while building SkillForge AI.

### Day 1 Status After SKILLS.md Approval

After `SKILLS.md` is approved, Day 1 documentation is complete.

The project is ready to move into:

```text
Day 2 — Scaffold and Design System Phase
```

Day 2 must begin only after the builder approves all Day 1 documents and creates/uses the correct phase branch.
