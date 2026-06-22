# SkillForge AI — Product Requirements Document

**Product:** SkillForge AI  
**Document:** PRD.md  
**Version:** MVP / 10-Day Build Scope  
**Purpose:** Guide AI coding agents and the builder through a strict, practical, portfolio-ready MVP.

---

## 1. Product Overview

### Product Name

**SkillForge AI**

### One-Line Pitch

SkillForge AI turns your notes into a personal learning roadmap, study system, and interview coach.

### Short Product Description

SkillForge AI is a full-stack AI learning and interview-preparation platform where users can upload notes, PDFs, or text and transform them into structured learning roadmaps, flashcards, quizzes, mock interview questions, project/coding tasks, progress tracking, and source-grounded chat using RAG.

### Problem Statement

Students and beginner developers often have scattered notes, PDFs, tutorials, and copied text, but they struggle to convert that material into a clear learning plan. They may read content passively but do not always know:

- What to learn first
- What to revise
- What they are weak in
- How to turn notes into practice questions
- How to prepare for interviews from their own material
- How to track progress consistently

Most AI tools either focus only on chat, only on flashcards, or only on general answers. SkillForge AI combines uploaded learning material, RAG-based note chat, AI-generated study assets, and basic progress tracking into one focused learning workflow.

### Target Users

| User Type | Main Need |
|---|---|
| Students preparing for exams | Convert notes into roadmaps, quizzes, and flashcards |
| Beginner/full-stack developers | Learn technical topics with structured tasks and practice |
| AI/ML interview candidates | Practice technical explanations and mock interviews |
| Self-learners | Upload personal notes and chat with them |
| Admin/platform owner | Monitor usage, limits, logs, and basic system health |

### Main Value Proposition

SkillForge AI helps users move from **messy learning material** to a **clear learning system**:

1. Upload notes/PDF/text.
2. Extract and organize the content.
3. Generate a roadmap.
4. Create flashcards and quizzes.
5. Chat with notes using RAG.
6. Practice interview questions.
7. Track learning progress.

### Why This Project Is Worth Building

This project is worth building because it teaches real full-stack product engineering, not just frontend UI or a simple AI wrapper. It includes:

- Authentication
- Protected routes
- File uploads
- Database CRUD
- User ownership
- RAG architecture
- AI API integration
- Vector search
- Usage limits
- Rate limiting
- Admin basics
- Error/loading states
- Deployment
- Testing and polish

It also creates a strong portfolio story: **a real AI SaaS-style learning platform with source-grounded AI features.**

---

## 2. Goals and Non-Goals

### Product Goals

| Goal | Description |
|---|---|
| Convert notes into learning assets | Users should upload material and generate roadmaps, flashcards, quizzes, and interview questions. |
| Provide source-grounded chat | Users should ask questions based on uploaded content, not random generic AI answers. |
| Help users track progress | Users should mark roadmap tasks complete and view quiz/interview progress. |
| Keep the product simple and usable | MVP should be clean, focused, and practical for students/developers. |
| Build SaaS-style foundations | Include auth, usage limits, protected routes, logs, and admin basics. |

### Learning Goals for the Builder

The builder should learn:

- Next.js App Router architecture
- Frontend layout and component systems
- Backend API routes
- Supabase Auth
- Supabase Postgres CRUD
- Supabase Storage
- RLS/user ownership concepts
- File upload validation
- PDF/text parsing flow
- Chunking and embeddings
- pgvector-based retrieval
- AI generation routes
- RAG prompt flow
- `proxy.ts` route protection
- Role-based access
- Plan-based access
- Rate limiting
- Logging and debugging
- Deployment on Vercel

### Portfolio / Interview Goals

The project should help explain:

- How full-stack SaaS architecture works
- How protected routes and auth sessions work
- How user-owned data is stored safely
- How file uploads are processed
- How RAG works end-to-end
- How usage limits and rate limiting protect AI routes
- How AI outputs are validated and saved
- How to design a real product from research to PRD to implementation

### Non-Goals for MVP

The MVP will **not** include:

| Non-Goal | Reason |
|---|---|
| Full OCR for scanned PDFs/images | Too complex and slow for the first 10 days |
| Real payment processing | Stripe test mode only if included |
| Full production billing system | Not needed for portfolio MVP |
| Advanced spaced repetition engine | Can be added post-MVP |
| Collaborative workspaces | Too much scope |
| Browser extensions | Not part of core product |
| Mobile app | Responsive web app only |
| AI agents that run automatically in background | Too risky and complex |
| Real-time multiplayer learning | Not needed |
| Complex admin analytics | Basic admin only |
| Multiple AI providers in MVP | One provider keeps debugging easier |
| Multiple social login providers | Google OAuth only; no GitHub, Facebook, Apple, or other providers in MVP |
| Public API for third-party developers | Out of scope |
| Social feed/community features | Not core to the learning loop |

---

## 3. User Personas

### Persona 1: Student Preparing for Exams

| Field | Details |
|---|---|
| Pain Points | Notes are messy, exams are near, revision is unstructured, hard to identify important topics. |
| Goals | Quickly convert notes into study plans, flashcards, and quizzes. |
| How SkillForge AI Helps | Uploads notes/PDFs and generates revision roadmaps, flashcards, quizzes, and chat answers. |
| Most Important Features | Materials upload, roadmap generation, flashcards, quizzes, progress tracking. |

### Persona 2: Beginner / Full-Stack Developer

| Field | Details |
|---|---|
| Pain Points | Learns from scattered tutorials, does not know what to build next, struggles to connect concepts. |
| Goals | Learn full-stack topics through structured tasks and practice. |
| How SkillForge AI Helps | Converts uploaded tutorials/notes into roadmaps, coding tasks, quizzes, and interview-style questions. |
| Most Important Features | Roadmaps, coding/project task generation, RAG chat, progress tracking, mock interview. |

### Persona 3: AI/ML Interview Candidate

| Field | Details |
|---|---|
| Pain Points | Knows concepts partly but struggles to explain them in interviews. |
| Goals | Practice technical questions, explain concepts clearly, identify weak areas. |
| How SkillForge AI Helps | Generates mock interview questions from uploaded notes and gives feedback. |
| Most Important Features | Mock interview mode, AI chat with notes, quizzes, weak topic basics, progress tracking. |

### Persona 4: Self-Learner Uploading Personal Notes

| Field | Details |
|---|---|
| Pain Points | Has PDFs, copied notes, and resources but no organized study system. |
| Goals | Search, understand, and revise personal material faster. |
| How SkillForge AI Helps | Creates a personal AI knowledge base with study outputs. |
| Most Important Features | Upload materials, RAG chat, roadmap, flashcards, export basics. |

### Persona 5: Admin / Platform Owner

| Field | Details |
|---|---|
| Pain Points | Needs to monitor user activity, prevent abuse, and debug errors. |
| Goals | View users, logs, limits, and basic platform health. |
| How SkillForge AI Helps | Provides basic admin pages for users, logs, usage, and role/plan checks. |
| Most Important Features | Admin dashboard, usage logs, API logs, error logs, rate limits, role checks. |

---

## 4. MVP Scope

### Must-Have for 10-Day MVP

These features are required for the MVP.

| Feature | MVP Reason |
|---|---|
| Public landing page | Explains product and portfolio value |
| Auth | Required for user-owned learning data |
| Email/password login | Basic auth method |
| Google OAuth login | Fast signup/login using Supabase Auth without adding extra social providers |
| Dashboard | Main protected workspace |
| Profile/settings basics | User account and plan display |
| Learning goals | Start point for roadmaps |
| Materials upload | Core input layer |
| Store material metadata | Required for ownership and retrieval |
| Basic parsing/chunking plan | Needed for RAG |
| RAG chat with uploaded notes | Anchor AI feature |
| AI roadmap generation | Core study transformation |
| Flashcard generation | High user value and easy win |
| Quiz generation | High user value and portfolio value |
| Mock interview basics | Strong interview-prep differentiator |
| Progress tracking basics | Makes the app feel like a learning platform |
| Usage limits/rate limiting | Prevents AI abuse and shows SaaS thinking |
| Protected routes using `proxy.ts` | Core architecture learning goal |
| Basic admin protection | Shows role-based access |
| Responsive UI | Must work on mobile, tablet, and desktop |
| Loading/error/empty states | Required for polish |
| Deployment on Vercel | Portfolio-ready outcome |

### Should-Have If Time Allows

| Feature | Reason |
|---|---|
| Export to TXT/JSON | Useful and simple |
| Export to PDF | Good polish, but not core |
| Coding task generation | Great for developer persona |
| Weak topic detection basics | Valuable but can be simple |
| Recent activity feed | Nice dashboard improvement |
| Better quiz review screen | Improves learning loop |
| Email-ready flows | Prepare for future notifications without overbuilding |
| Stripe test upgrade button | Good SaaS demo, no real billing |

### Post-MVP / V1 Features

| Feature | Reason to Delay |
|---|---|
| Spaced repetition | Needs careful scheduling logic |
| Study calendar | Easy to overbuild |
| Advanced weak-topic analytics | Needs more data history |
| Full OCR | Complex and slow |
| Collaborative notes | Requires sharing permissions |
| Team workspaces | Not needed for solo MVP |
| Multiple AI providers | Adds config and debugging complexity |
| Additional OAuth/social login providers | Not needed for MVP; Google OAuth is enough |
| Advanced admin analytics | Not required for first demo |
| Real paid subscriptions | Not needed before real users |
| Mobile app | Web responsive layout is enough |

### Explicitly Out-of-Scope

- Real payment collection
- Complex plan billing
- Full OCR pipeline
- Teacher/classroom management
- Team collaboration
- Public community features
- Browser extension
- Native mobile app
- Voice interview mode
- Real-time chat between users
- Marketplace for notes
- Fully autonomous study agents
- GitHub OAuth
- Facebook OAuth
- Apple OAuth
- Any social login provider other than Google OAuth

---

## 5. Feature Requirements

### 5.1 Public Landing Page

#### Feature Description

A public page explaining what SkillForge AI does, who it is for, and why users should sign up.

#### User Story

As a visitor, I want to understand the product quickly so that I can decide whether to sign up.

#### Functional Requirements

- Show product name and one-line pitch.
- Explain upload → generate → practice → track workflow.
- Show key features:
  - Upload notes/PDFs/text
  - AI roadmap
  - Flashcards
  - Quizzes
  - RAG chat
  - Mock interview
- Include CTA buttons for signup/login.
- Include simple pricing/free plan section.
- Include portfolio-friendly footer.

#### Acceptance Criteria

- Visitor can understand the product within 30 seconds.
- CTA links work.
- Page is responsive.
- SEO title and description exist.
- No protected data is shown.

#### Edge Cases

- Logged-in users clicking CTA should go to dashboard.
- Logged-out users should go to signup/login.

#### Error States

- If auth status cannot load, show normal public CTA.
- Broken route links must not exist.

---

### 5.2 Signup / Login / Logout

#### Feature Description

Users can create accounts, log in, log out, and access protected dashboard pages. MVP auth supports both **email/password** and **Google OAuth through Supabase Auth**.

#### User Story

As a user, I want to securely access my personal learning workspace using either email/password or Google sign-in.

#### Supported Auth Methods

Users can sign up or log in with:

- Email/password
- Google OAuth

No other social login providers are included in the MVP.

#### Functional Requirements

- Support email/password signup.
- Support email/password login.
- Support Google OAuth signup/login using the Supabase Auth Google OAuth provider.
- Show **“Continue with Google”** button on `/login`.
- Show **“Continue with Google”** button on `/signup`.
- Add `/auth/callback` route for Supabase OAuth callback/session exchange.
- After email/password signup, create or load the user profile row.
- After Google OAuth login, create or load the user profile row.
- Redirect successful email/password login users to `/dashboard`.
- Redirect successful Google OAuth login users to `/dashboard`.
- Support logout.
- Support forgot password page.
- Keep user session after refresh.
- Redirect logged-in users away from `/login` and `/signup`.
- Redirect logged-out users away from dashboard.
- Show safe user-facing error message if Google OAuth fails.

#### Acceptance Criteria

- User can sign up successfully with email/password.
- User can log in successfully with email/password.
- User can sign in with Google.
- New Google OAuth user gets a profile row created.
- Returning Google OAuth user lands on `/dashboard`.
- OAuth callback handles success safely.
- OAuth callback handles failure safely.
- Logged-in Google user stays logged in after refresh.
- Logged-in users are redirected away from `/login` and `/signup`.
- User can log out successfully.
- Dashboard is inaccessible when logged out.
- Session survives browser refresh.
- Auth errors are shown clearly.

#### Edge Cases

- Existing email during signup.
- Wrong password.
- Expired session.
- Email confirmation pending, if enabled.
- Network error during auth request.
- User cancels Google login.
- OAuth callback error.
- Google account email already exists with an email/password account.
- Profile row missing after OAuth login.
- Redirect URL misconfigured.
- Localhost vs production callback mismatch.

#### Error States

- “Invalid email or password.”
- “Account already exists.”
- “Google sign-in was cancelled.”
- “Google sign-in failed. Please try again.”
- “Could not complete login. Please try again.”
- “Account exists. Please sign in using your original method.”
- “Something went wrong. Please try again.”
- “Session expired. Please log in again.”

---

### 5.3 Dashboard

#### Feature Description

A protected home screen showing the user’s learning overview.

#### User Story

As a logged-in user, I want to see my materials, roadmaps, progress, and next actions in one place.

#### Functional Requirements

- Show welcome message.
- Show summary cards:
  - Materials uploaded
  - Roadmaps created
  - Flashcards created
  - Quizzes attempted
  - Progress percentage
  - Usage remaining
- Show quick actions:
  - Upload material
  - Generate roadmap
  - Start quiz
  - Start mock interview
  - Chat with notes
- Show recent activity.
- Show empty state for new users.

#### Acceptance Criteria

- Dashboard loads only for authenticated users.
- User only sees their own data.
- Empty state appears when no data exists.
- Loading skeleton appears while data loads.
- Summary values match stored user data.

#### Edge Cases

- New user with no data.
- User has deleted all materials.
- Usage limit is reached.
- Database request fails.

#### Error States

- “Could not load dashboard.”
- “No activity yet.”
- “Upload your first material to get started.”

---

### 5.4 Profile / Settings

#### Feature Description

A protected page for profile details, plan display, and basic preferences.

#### User Story

As a user, I want to view my account details and usage plan.

#### Functional Requirements

- Show user email.
- Show display name if available.
- Show role.
- Show plan: free/pro/demo.
- Show usage limits and remaining usage.
- Allow basic profile update if included.
- Show logout option.

#### Acceptance Criteria

- Profile page is protected.
- User can only view their own profile.
- Plan and role display correctly.
- Errors are handled safely.

#### Edge Cases

- Profile row missing.
- User is authenticated but profile creation failed.
- Plan value is unknown.
- Google OAuth user has no display name returned.
- Google OAuth user profile row fails to create.

#### Error States

- “Profile could not be loaded.”
- “Profile updated.”
- “Profile update failed.”

---

### 5.5 Learning Goals

#### Feature Description

Users define what they want to learn or prepare for.

#### User Story

As a learner, I want to create a learning goal so the AI can generate a roadmap around it.

#### Functional Requirements

- User can create a learning goal.
- Goal includes:
  - Title
  - Description
  - Category
  - Difficulty level
  - Target date, optional
  - Related material, optional
- User can view goals.
- User can edit/delete goals.
- Goals belong to one user.

#### Acceptance Criteria

- User can create a goal.
- Goal appears in dashboard/roadmaps page.
- User cannot access another user’s goals.
- Required fields validate correctly.

#### Edge Cases

- Empty title.
- Very long description.
- Target date in the past.
- Deleted material linked to goal.

#### Error States

- “Goal title is required.”
- “Could not save goal.”
- “Goal deleted.”

---

### 5.6 Materials Upload

#### Feature Description

Users upload notes, PDFs, or text and store them as learning materials.

#### User Story

As a learner, I want to upload my study material so SkillForge AI can generate learning outputs from it.

#### Functional Requirements

- Support upload types:
  - PDF
  - TXT
  - Plain text pasted into editor
- Store original file in Supabase Storage where applicable.
- Store metadata in database:
  - Title
  - File type
  - File size
  - Upload status
  - Owner user ID
  - Created date
- Validate file type.
- Validate file size.
- Allow preview of extracted text when available.
- Allow delete material.
- User can only access their own materials.

#### Acceptance Criteria

- Valid PDF/TXT upload succeeds.
- Invalid file type is blocked.
- Oversized file is blocked.
- Material appears in materials page.
- User can delete their own material.
- Deleted material cannot be used for new AI generation.

#### Edge Cases

- Empty file.
- Password-protected PDF.
- PDF with no extractable text.
- Duplicate file name.
- Upload interrupted.
- User logs out during upload.

#### Error States

- “Unsupported file type.”
- “File is too large.”
- “Could not upload material.”
- “Text could not be extracted from this file.”
- “Material deleted.”

---

### 5.7 AI Chat With Notes

#### Feature Description

Users can ask questions about uploaded notes using RAG.

#### User Story

As a user, I want to chat with my uploaded notes so I can understand my own material faster.

#### Functional Requirements

- User selects one or more materials.
- User asks a question.
- System retrieves relevant chunks from selected user-owned material.
- AI answers using retrieved context.
- Answer should mention when context is insufficient.
- Chat history may be stored if included in MVP.
- User can start a new chat session.
- Usage counter increments for each AI chat request.

#### Acceptance Criteria

- User can ask a question about uploaded material.
- Answer is grounded in uploaded content.
- User cannot query another user’s material.
- If no relevant context is found, answer says so.
- Rate limits apply.
- AI failure does not crash the app.

#### Edge Cases

- No material uploaded.
- Material uploaded but not processed.
- Question unrelated to material.
- AI provider timeout.
- Retrieval returns low-quality chunks.
- User hits usage limit.

#### Error States

- “Upload material before chatting.”
- “This material is still processing.”
- “I could not find enough context in your notes.”
- “AI request failed. Please try again.”
- “Usage limit reached.”

---

### 5.8 AI Roadmap Generator

#### Feature Description

Generate structured learning roadmaps from goals and/or uploaded materials.

#### User Story

As a learner, I want a step-by-step roadmap so I know what to study first and what to do next.

#### Functional Requirements

- User can generate roadmap from:
  - Learning goal only
  - Material only
  - Goal + material
- Roadmap includes:
  - Title
  - Description
  - Difficulty
  - Estimated duration
  - Ordered tasks
- Each task includes:
  - Title
  - Description
  - Status
  - Order index
  - Optional estimated time
- Save roadmap and tasks to database.
- User can mark tasks complete/incomplete.
- Usage counter increments.

#### Acceptance Criteria

- Roadmap is generated and saved.
- Tasks display in correct order.
- User can mark tasks complete.
- Progress updates when tasks change.
- AI output failure has fallback handling.

#### Edge Cases

- AI returns invalid structure.
- Goal is too vague.
- Material has too little text.
- User has no remaining AI usage.
- User deletes related material.

#### Error States

- “Please provide a clearer learning goal.”
- “Could not generate roadmap.”
- “Roadmap saved.”
- “Task updated.”

---

### 5.9 Flashcards

#### Feature Description

Generate flashcards from uploaded material.

#### User Story

As a student, I want flashcards from my notes so I can revise quickly.

#### Functional Requirements

- User selects material.
- User chooses number of flashcards, within limit.
- AI generates question/answer pairs.
- Flashcards are saved in a deck.
- User can view deck.
- User can flip cards.
- User can delete deck/card if included.
- Usage counter increments.

#### Acceptance Criteria

- Flashcards are generated from material.
- Flashcards contain clear front/back content.
- Deck is saved.
- User only sees their own decks.
- Empty/failed generation is handled.

#### Edge Cases

- Material too short.
- AI creates duplicate cards.
- User requests too many cards.
- Material not processed.
- Usage limit reached.

#### Error States

- “Select a processed material first.”
- “Could not generate flashcards.”
- “Flashcard deck saved.”
- “Usage limit reached.”

---

### 5.10 Quizzes

#### Feature Description

Generate quizzes from uploaded material, allow user attempts, score results, and review answers.

#### User Story

As a learner, I want to test myself from my own notes and see my score.

#### Functional Requirements

- User selects material.
- User chooses quiz type:
  - Multiple choice for MVP
  - Optional short answer post-MVP
- AI generates quiz questions.
- Each question includes:
  - Question text
  - Options
  - Correct answer
  - Explanation
  - Topic
- User attempts quiz.
- System calculates score.
- Save quiz attempt.
- Show correct/wrong answers.
- Usage counter increments for generation.

#### Acceptance Criteria

- Quiz is generated and saved.
- User can answer questions.
- Score is calculated.
- Attempt is saved.
- User can review wrong answers.
- User data remains isolated.

#### Edge Cases

- AI returns invalid options.
- No correct answer returned.
- User leaves quiz halfway.
- User refreshes page during attempt.
- User attempts deleted quiz.

#### Error States

- “Could not generate quiz.”
- “Please answer at least one question.”
- “Quiz submitted.”
- “Score could not be saved.”

---

### 5.11 Mock Interview Mode

#### Feature Description

Generate mock interview questions from uploaded material or learning goal and collect user answers.

Mock interview is intentionally minimal for MVP. It should not include voice mode, real-time conversation, video, or advanced interview analytics.

#### User Story

As an interview candidate, I want to practice technical questions based on what I studied.

#### Functional Requirements

- User selects:
  - Topic
  - Material, optional
  - Difficulty
  - Number of questions
- AI generates interview questions.
- User answers one question at a time.
- System gives basic feedback:
  - Strength
  - Missing points
  - Improved answer
  - Score/rating, optional
- Save interview session.
- Usage counter increments.

#### Acceptance Criteria

- User can start mock interview.
- Questions are relevant to selected material/topic.
- User can submit answers.
- Feedback is shown.
- Session is saved.
- AI failure is handled.

#### Edge Cases

- User gives empty answer.
- Topic too vague.
- Material has insufficient context.
- AI response is too long.
- Usage limit reached.

#### Error States

- “Please enter an answer.”
- “Could not generate interview questions.”
- “Could not generate feedback.”
- “Interview session saved.”

---

### 5.12 Progress Tracking

#### Feature Description

Track basic learning progress across roadmaps, quizzes, flashcards, and interviews.

#### User Story

As a learner, I want to see my progress so I can stay consistent.

#### Functional Requirements

- Track completed roadmap tasks.
- Track quiz attempts and scores.
- Track flashcard decks created.
- Track interview sessions completed.
- Show progress summary on dashboard.
- Store progress events.
- Show simple completion percentage for roadmaps.

#### Acceptance Criteria

- Roadmap progress updates after task completion.
- Quiz score appears in progress.
- Dashboard summary reflects activity.
- Progress is user-specific.

#### Edge Cases

- User deletes roadmap after progress exists.
- User retakes quiz.
- No progress yet.
- Progress event fails to save.

#### Error States

- “No progress yet.”
- “Could not update progress.”
- “Progress saved.”

---

### 5.13 Free / Pro Usage Limits

#### Feature Description

Apply usage limits to AI-heavy routes.

#### User Story

As the platform owner, I want to limit AI usage so the app stays free or low-cost.

#### Functional Requirements

- Track AI requests by user.
- Track usage by route type:
  - Chat
  - Roadmap
  - Flashcards
  - Quiz
  - Interview
- Free plan has monthly/daily limits.
- Pro/demo plan has higher limits.
- Rate limit by user and optionally IP.
- Show remaining usage in dashboard/settings.
- Block request when limit is reached.
- Show upgrade/limit message.

#### Acceptance Criteria

- Usage increments after successful AI request.
- User cannot exceed free limit.
- Limit message appears clearly.
- Admin/demo plan can have higher limits.
- Rate limiting protects AI routes.

#### Edge Cases

- Request fails after usage was counted.
- Anonymous user calls protected API.
- User changes plan.
- Multiple tabs make requests at the same time.

#### Error States

- “Usage limit reached.”
- “Too many requests. Please wait.”
- “Plan information could not be loaded.”

---

### 5.14 Admin Basics

#### Feature Description

Admin can view basic users, logs, and usage.

Admin is intentionally minimal for MVP. It should not become a complex analytics, moderation, or billing management system.

#### User Story

As an admin, I want to monitor basic platform activity and protect the app from abuse.

#### Functional Requirements

- Admin-only route group.
- View user list.
- View usage logs.
- View API logs.
- View error logs.
- View user role/plan.
- Optional: update role/plan in demo mode.
- Normal users cannot access admin routes.

#### Acceptance Criteria

- Admin routes are blocked for normal users.
- Logged-out users cannot access admin routes.
- Admin can view basic logs.
- Admin data loads safely.
- Sensitive data is not overexposed.

#### Edge Cases

- User role missing.
- Admin profile not created.
- Logs table empty.
- Database request fails.

#### Error States

- “Admin access required.”
- “Could not load logs.”
- “No logs yet.”

---

### 5.15 Export Basics

#### Feature Description

Allow users to export selected generated content.

#### User Story

As a user, I want to export my generated roadmap, flashcards, or quiz so I can study offline.

#### Functional Requirements

- Export roadmap as TXT or JSON.
- Export flashcards as TXT or JSON.
- Export quiz as TXT or JSON.
- PDF export is optional if time allows.
- Export only user-owned content.

#### Acceptance Criteria

- User can export supported content.
- Exported content matches selected item.
- User cannot export another user’s content.
- Failed export shows error.

#### Edge Cases

- Empty roadmap/deck/quiz.
- Deleted item.
- Large content.
- Export request from unauthorized user.

#### Error States

- “Export failed.”
- “Nothing to export.”
- “Export ready.”

---

### 5.16 Notifications / Email-Ready Flows

#### Feature Description

Prepare simple email-ready flows without making email core to MVP.

#### User Story

As a user, I may want email confirmation, reset password, or future study reminders.

#### Functional Requirements

- Forgot password route exists.
- Email provider may be configured later.
- Email templates are not a core MVP requirement.
- No study reminder system in MVP.
- Notification table can be planned post-MVP.

#### Acceptance Criteria

- Forgot password UI exists.
- App does not depend on custom email provider for core flow.
- No complex notification system blocks MVP.

#### Edge Cases

- Email provider not configured.
- Password reset email rate limit.
- Invalid email address.

#### Error States

- “If an account exists, reset instructions will be sent.”
- “Email service unavailable.”

---

## 6. User Flows

### 6.1 New User Signup → Onboarding → Dashboard

#### Email/Password Path

1. User visits `/`.
2. User clicks **Get Started**.
3. User goes to `/signup`.
4. User enters email and password.
5. System creates account.
6. System creates profile row.
7. User lands on onboarding or dashboard.
8. User sees empty dashboard.
9. User is prompted to upload first material or create learning goal.

#### Google OAuth Path

1. User visits `/`.
2. User clicks **Get Started** or goes to `/login` / `/signup`.
3. User clicks **Continue with Google**.
4. Supabase Auth redirects user to Google OAuth.
5. User chooses Google account and approves basic profile/email access.
6. Google redirects back to `/auth/callback`.
7. `/auth/callback` exchanges the OAuth callback for a valid Supabase session.
8. System creates or loads profile row.
9. User is redirected to `/dashboard`.
10. User sees empty dashboard if they are new, or existing data if they are returning.

### 6.2 Upload Material → Process Material → Chat With Notes

1. User opens `/dashboard/materials`.
2. User clicks **Upload Material**.
3. User uploads PDF/TXT or pastes text.
4. System validates file type and size.
5. System stores original file if needed.
6. System saves material metadata.
7. System extracts text.
8. System chunks extracted text.
9. System creates embeddings.
10. System stores chunks and embeddings.
11. User opens chat for that material.
12. User asks a question.
13. System retrieves relevant chunks.
14. AI answers using retrieved context.
15. User sees answer and fallback message if context is weak.

### 6.3 Upload Material → Generate Flashcards

1. User uploads or selects processed material.
2. User clicks **Generate Flashcards**.
3. System checks usage limit.
4. System sends material context to AI.
5. AI returns flashcard deck.
6. System validates output.
7. System saves deck and flashcards.
8. User views flashcards.
9. User flips cards for revision.

### 6.4 Upload Material → Generate Quiz → Attempt Quiz → See Score

1. User selects processed material.
2. User clicks **Generate Quiz**.
3. System checks usage limit.
4. AI generates multiple-choice quiz.
5. System saves quiz and questions.
6. User starts quiz.
7. User selects answers.
8. User submits quiz.
9. System calculates score.
10. System saves attempt.
11. User sees score, correct answers, explanations, and weak topics if available.

### 6.5 Create Learning Goal → Generate Roadmap → Mark Tasks Complete

1. User opens `/dashboard/roadmaps`.
2. User creates learning goal.
3. User clicks **Generate Roadmap**.
4. System checks usage limit.
5. AI generates roadmap and tasks.
6. System saves roadmap.
7. User views roadmap.
8. User marks tasks complete.
9. System updates progress.
10. Dashboard progress changes.

### 6.6 Start Mock Interview → Answer Questions → Receive Feedback

1. User opens `/dashboard/interview`.
2. User selects topic/material/difficulty.
3. User starts interview.
4. System checks usage limit.
5. AI generates questions.
6. User answers first question.
7. AI gives feedback.
8. User continues through questions.
9. System saves interview session.
10. User sees summary feedback.

### 6.7 Free User Hits Usage Limit → Sees Upgrade/Limit Message

1. User starts an AI action.
2. System checks usage logs.
3. User has no remaining free usage.
4. System blocks request.
5. User sees friendly limit message.
6. User is shown:
   - Try again later
   - Upgrade/demo plan message
   - View usage in settings

### 6.8 Admin Views Users / Logs / Basic Usage

1. Admin logs in.
2. Admin opens `/admin`.
3. `proxy.ts` verifies session and admin role.
4. Admin views summary cards.
5. Admin opens `/admin/users`.
6. Admin views users and plans.
7. Admin opens `/admin/logs`.
8. Admin views usage/API/error logs.
9. Normal users attempting same routes are redirected or blocked.

---

## 7. Pages and Routes

### Public Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/features` | Feature overview |
| `/pricing` | Free/pro/demo plan explanation |
| `/login` | Login page with email/password and Google OAuth |
| `/signup` | Signup page with email/password and Google OAuth |
| `/forgot-password` | Password reset request |
| `/auth/callback` | Handles Supabase OAuth callback/session exchange |

### Protected Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Main user dashboard |
| `/dashboard/materials` | Upload and manage materials |
| `/dashboard/roadmaps` | Learning goals and roadmaps |
| `/dashboard/flashcards` | Flashcard decks |
| `/dashboard/quizzes` | Quizzes and attempts |
| `/dashboard/interview` | Mock interview mode |
| `/dashboard/progress` | Progress tracking |
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | Plan, usage, preferences |

### Admin Routes

| Route | Purpose |
|---|---|
| `/admin` | Admin overview |
| `/admin/users` | View users and roles/plans |
| `/admin/logs` | API, usage, and error logs |

### API Route Groups

| Route Group | Purpose |
|---|---|
| `/api/materials` | Material CRUD |
| `/api/upload` | File upload and processing entry |
| `/api/ai/chat` | RAG chat |
| `/api/ai/roadmap` | Roadmap generation |
| `/api/ai/flashcards` | Flashcard generation |
| `/api/ai/quiz` | Quiz generation |
| `/api/ai/interview` | Interview generation/feedback |
| `/api/progress` | Progress updates |
| `/api/admin/*` | Admin-only data |
| `/api/billing/*` | Optional Stripe test mode routes |

---

## 8. Frontend Requirements

### Responsive Design

The app must work on:

| Device | Requirement |
|---|---|
| Mobile | Single-column layout, collapsible sidebar/menu |
| Tablet | Responsive cards and readable tables |
| Desktop | Sidebar + content layout |

### Layout Requirements

- Public navbar on landing pages.
- Dashboard sidebar for protected pages.
- Topbar with user menu.
- Main content container with consistent spacing.
- Mobile-friendly navigation.
- Admin layout separate from user dashboard.

### UI Components

Required base components:

- Button
- Input
- Textarea
- Select
- Card
- Modal
- Dropdown
- Tabs
- Badge
- Toast
- Skeleton loader
- Empty state
- Error state
- Table
- Progress bar
- File upload dropzone

### Auth UI Requirements

- Login page must support email/password login.
- Login page must show **“Continue with Google”** button.
- Signup page must support email/password signup.
- Signup page must show **“Continue with Google”** button.
- Google OAuth button must not appear as the only login option.
- Email/password login must remain supported.
- Auth errors must be shown safely.
- Logged-in users visiting `/login` or `/signup` should be redirected to `/dashboard`.

### Loading States

- Auth loading
- OAuth redirect/callback loading
- Dashboard loading
- Upload processing
- AI generation loading
- Chat response loading
- Quiz submission loading
- Admin logs loading

### Error States

- Auth error
- Google OAuth error
- Upload error
- AI generation error
- Empty data error
- Permission error
- Rate limit error
- Network/database error

### Empty States

Examples:

- “No materials yet. Upload your first note.”
- “No roadmaps yet. Create a learning goal.”
- “No flashcards yet. Generate a deck from your material.”
- “No quiz attempts yet.”
- “No interview sessions yet.”

### Form Validation

- Required fields must validate.
- Email format must validate.
- File type and size must validate.
- AI generation forms must validate selected material/topic.
- Quiz answers must validate before submit if required.

### Toast Messages

Use toast messages for:

- Login success/failure
- Google sign-in success/failure
- Upload success/failure
- Roadmap created
- Flashcards generated
- Quiz submitted
- Profile updated
- Limit reached
- Delete confirmation
- Generic errors

### Theme

- Dark/light theme is optional.
- MVP can start with one clean theme.
- If theme is included, it must not delay core features.

### Accessibility Basics

- Buttons must have readable labels.
- Inputs must have labels.
- Color contrast should be acceptable.
- Keyboard navigation should work for major forms.
- Modals should be closable.
- Loading states should not trap the user.
- Google OAuth button must have accessible text label.

### SEO Basics

- Landing page title and description.
- Features page title and description.
- Pricing page title and description.
- Open Graph metadata optional.
- Dashboard pages do not need SEO indexing.

### Performance Basics

- Avoid loading all user data at once.
- Paginate or limit long lists.
- Keep AI requests server-side.
- Use skeletons for slow content.
- Keep uploaded file preview lightweight.
- Avoid huge client bundles.

---

## 9. Backend Requirements

### Auth

- Use Supabase Auth.
- Supabase Auth must support email/password.
- Supabase Auth must support Google OAuth.
- Do not add other OAuth/social login providers in MVP.
- All protected APIs require authenticated user.
- Server must get user from session, not from client-provided user ID.
- API must always get user ID from server session after OAuth.
- Profile row should be created or ensured after email/password signup.
- Profile creation must work for both email/password users and Google OAuth users.
- After Google OAuth login, create or load the user profile row before sending user to dashboard.
- If profile creation fails, show safe error and do not expose backend details.

### Database CRUD

Required CRUD areas:

- Materials
- Learning goals
- Roadmaps
- Roadmap tasks
- Flashcard decks
- Flashcards
- Quizzes
- Quiz questions
- Quiz attempts
- Interview sessions
- Progress events
- Usage logs
- API/error logs

### User Ownership

- Every user-owned row must include owner reference.
- User can only read/write their own data.
- Admin access must be role-protected.
- Never trust `userId` sent from frontend.
- OAuth users and email/password users follow the same ownership rules.

### API Route Validation

Every API route must validate:

- Auth session
- Request method
- Request body
- Required IDs
- User ownership
- Usage limits, if AI route
- Rate limits, if protected heavy route

### AI Generation Routes

Required AI routes:

- `/api/ai/chat`
- `/api/ai/roadmap`
- `/api/ai/flashcards`
- `/api/ai/quiz`
- `/api/ai/interview`

Each AI route must:

- Validate user session.
- Validate input.
- Check usage limit.
- Fetch only user-owned data.
- Call AI provider server-side.
- Validate AI output shape conceptually.
- Save valid output.
- Log usage.
- Return safe errors.

### File Upload Handling

- Validate file type.
- Validate file size.
- Store original file.
- Save metadata.
- Extract text.
- Store extracted text or reference.
- Chunk content.
- Generate embeddings.
- Store chunks and embeddings.
- Handle processing failures.

### Material Metadata

Each material should track:

- Title
- Type
- Size
- Storage path
- Processing status
- Extracted text status
- Chunk count
- Owner
- Created/updated timestamps

### RAG Storage Flow

1. Upload material.
2. Extract text.
3. Chunk text.
4. Embed chunks.
5. Store chunks with embeddings.
6. On question, embed query.
7. Search matching chunks.
8. Generate answer from matched chunks.
9. Return grounded answer.

### Progress Storage

Track:

- Roadmap task completion
- Quiz attempts
- Interview sessions
- Flashcard deck creation
- Material upload events
- AI generation events

### Usage Limit Tracking

Track:

- User ID
- Route/action type
- Plan
- Count
- Period
- Timestamp
- Status: success/blocked/error

### Error Handling

- Use generic user-facing errors.
- Log detailed server-side errors.
- Never expose API keys, SQL errors, or provider stack traces.
- AI failures must not crash the app.
- Upload failures must keep material status clear.
- OAuth failures must show safe user-facing messages.

### Logging

Required logs:

- Usage logs
- API logs
- Error logs

Admin can view logs in basic form.

### Export-Ready Logic

If export is included:

- Export only user-owned data.
- Support TXT/JSON first.
- PDF export is optional.
- Log export action if useful.

---

## 10. Middleware / Proxy Requirements

Use **`proxy.ts`**, not old `middleware.ts`.

### Public Auth Routes

- `/login` must remain public for logged-out users.
- `/signup` must remain public for logged-out users.
- `/forgot-password` must remain public.
- `/auth/callback` must remain public.
- OAuth callback must not be blocked by `proxy.ts`.

### Protected Dashboard Routes

- Protect `/dashboard/*`.
- Logged-out users redirect to `/login`.
- Logged-in users can access dashboard routes.

### Auth Redirects

| User State | Route | Behavior |
|---|---|---|
| Logged out | `/dashboard/*` | Redirect to `/login` |
| Logged out | `/admin/*` | Redirect to `/login` |
| Logged in | `/login` | Redirect to `/dashboard` |
| Logged in | `/signup` | Redirect to `/dashboard` |
| Any user | `/auth/callback` | Allow route to handle OAuth callback |

### Admin Route Protection

- Protect `/admin/*`.
- Require authenticated session.
- Require role: `admin`.
- Normal users should be redirected or shown forbidden state.
- Admin check should be server-side.

### Role Checks

Roles:

| Role | Access |
|---|---|
| `user` | Dashboard and own data |
| `admin` | Dashboard, own data, admin pages |
| `blocked` optional | No protected app access |

### Plan Checks

Plans:

| Plan | Access |
|---|---|
| `free` | Limited AI generations |
| `pro` | Higher limits |
| `demo_admin` optional | Higher limits for portfolio demo |

Plan checks should apply mostly to AI APIs, not basic dashboard viewing.

### Rate Limiting Strategy

- Rate limit AI routes.
- Rate limit upload processing route.
- Rate limit by authenticated user ID.
- Fallback to IP-based limit for unauthenticated or suspicious requests.
- Use Upstash Redis if included.
- Basic database counters can be fallback.

### Security Headers

Set basic security headers through app config or proxy where appropriate:

- Content Security Policy, if manageable
- `X-Content-Type-Options`
- `Referrer-Policy`
- Frame restrictions if needed
- Avoid exposing unnecessary framework details

### API Protection

- Private APIs require auth.
- AI APIs require auth + usage check + rate limit.
- Admin APIs require admin role.
- Upload APIs require auth + file validation.
- Billing APIs are optional and test-mode only.

### Cookie / Session Checks

- Use Supabase SSR-compatible session handling.
- Refresh should keep session.
- Expired sessions should redirect cleanly.
- Client should not decide protected access alone.
- OAuth-created sessions must be readable server-side after `/auth/callback`.

### Maintenance Mode Idea

Optional post-MVP:

- Environment variable can enable maintenance mode.
- Admin can bypass.
- Normal users see friendly message.

---

## 11. AI / RAG Requirements

### AI Features in MVP

| AI Feature | MVP Requirement |
|---|---|
| RAG chat | Answer questions from uploaded notes |
| Roadmap generation | Generate structured learning plan |
| Flashcard generation | Generate question/answer cards |
| Quiz generation | Generate multiple-choice questions |
| Mock interview | Generate questions and basic feedback |
| Coding task generation | Should-have, not must-have |

### What Should Be Generated

#### Roadmap

Conceptual structure:

- Title
- Description
- Difficulty
- Estimated duration
- Ordered tasks
- Task descriptions
- Completion status

#### Flashcards

Conceptual structure:

- Deck title
- Card front/question
- Card back/answer
- Topic
- Difficulty

#### Quiz

Conceptual structure:

- Quiz title
- Questions
- Options
- Correct answer
- Explanation
- Topic
- Difficulty

#### Interview

Conceptual structure:

- Session title
- Questions
- Expected answer points
- User answer
- Feedback
- Improved answer
- Score/rating, optional

### RAG Flow

The RAG flow must follow:

1. User uploads material.
2. Server extracts text.
3. Server chunks text.
4. Server generates embeddings.
5. Server stores chunks and embeddings.
6. User asks a question.
7. Server embeds the question.
8. Server searches relevant chunks filtered by user ownership.
9. Server builds prompt using matched chunks.
10. AI answers using only relevant context.
11. App returns answer and optional source references.
12. App logs usage.

### Source-Grounded Answer Behavior

The AI chat should:

- Prefer uploaded material over generic knowledge.
- Say when context is insufficient.
- Avoid pretending the notes contain information they do not contain.
- Keep answers clear and student-friendly.
- Reference source material conceptually where possible.
- Avoid hallucinated citations.

### Fallback Behavior If AI Fails

If AI fails:

- Show friendly error.
- Do not crash UI.
- Do not save broken output as valid.
- Log server-side error.
- Allow retry if user has usage remaining.
- For roadmap/flashcards/quizzes, fallback can suggest manual retry.

### Usage Limits

Apply usage limits to:

- Chat messages
- Roadmap generation
- Flashcard generation
- Quiz generation
- Interview generation
- Embedding-heavy processing if needed

### Safety / Quality Rules

AI outputs should be:

- Structured
- Practical
- Beginner-friendly
- Based on selected material when provided
- Not overly long
- Saved only after validation
- Regenerated only after user action

### Hallucination Reduction Rules

- Use retrieved chunks for chat.
- In prompt, instruct model not to invent unsupported facts.
- If no relevant chunks are found, return insufficient-context response.
- Store source chunk IDs with AI answer if possible.
- Keep temperature moderate/low for factual outputs.
- Validate JSON-like output before saving.

---

## 12. Data Requirements

Do **not** write full SQL in this PRD. SQL belongs in `DATABASE_SCHEMA.md`.

### Major Entities

| Entity | Purpose | Relationships |
|---|---|---|
| `users/profiles` | Stores app profile, role, plan, display name | One profile per auth user; works for email/password and Google OAuth users |
| `materials/documents` | Stores uploaded material metadata | Belongs to user |
| `material_chunks` | Stores extracted chunks and embeddings | Belongs to material and user |
| `learning_goals` | Stores user learning goals | Belongs to user |
| `roadmaps` | Stores AI-generated roadmaps | Belongs to user and optional goal/material |
| `roadmap_tasks` | Stores roadmap steps | Belongs to roadmap |
| `flashcard_decks` | Stores generated flashcard set | Belongs to user/material |
| `flashcards` | Stores individual cards | Belongs to deck |
| `quizzes` | Stores generated quiz | Belongs to user/material |
| `quiz_questions` | Stores quiz questions/options/answers | Belongs to quiz |
| `quiz_attempts` | Stores user quiz score and answers | Belongs to user and quiz |
| `interview_sessions` | Stores mock interview sessions | Belongs to user/material/goal |
| `progress_events` | Stores learning activity | Belongs to user |
| `usage_logs` | Tracks AI usage and limits | Belongs to user |
| `api_logs` | Tracks API requests | Admin-readable |
| `error_logs` | Tracks server errors | Admin-readable |
| `plans/usage_limits` | Defines free/pro/demo limits | Used by usage system |

### Relationship Rules

- User owns materials.
- Material owns chunks.
- User owns goals.
- Goal can have roadmaps.
- Roadmap owns tasks.
- Material can generate flashcards/quizzes/interviews.
- User owns all generated outputs.
- Usage logs connect user + action type.
- Admin can view logs based on role.
- User profile creation must work regardless of whether the auth method is email/password or Google OAuth.

---

## 13. Security Requirements

### API Keys

- AI provider keys must stay server-side.
- Supabase service role key must stay server-side only.
- Stripe secret key must stay server-side only.
- Resend/API email keys must stay server-side only.
- Never expose secrets in frontend variables.

### Google OAuth Security

- Google OAuth Client ID/Secret must be configured in Supabase/Google Cloud, not exposed in frontend.
- OAuth redirect URLs must be restricted to localhost and production app URLs only.
- Do not request unnecessary Google scopes beyond basic profile/email.
- Do not store Google provider tokens unless needed.
- Google provider tokens are not needed for MVP.
- Do not add GitHub, Facebook, Apple, or other OAuth providers in MVP.
- OAuth callback errors must not expose internal provider details.

### Supabase RLS / User Ownership

- Enable RLS on user-owned tables.
- Policies must enforce `auth.uid()` ownership.
- Users cannot read/write other users’:
  - Materials
  - Chunks
  - Roadmaps
  - Flashcards
  - Quizzes
  - Attempts
  - Interview sessions
  - Progress
- Admin access must be explicit.
- RLS must work for both email/password users and Google OAuth users.

### Auth Required on Private APIs

Private APIs require authenticated session:

- Materials APIs
- Upload APIs
- AI APIs
- Progress APIs
- Profile APIs
- Admin APIs

### Never Trust Client `userId`

- Frontend must not decide ownership.
- API must get user ID from session.
- Any client-provided user ID should be ignored or validated carefully.
- OAuth login must still use server session to identify the user.

### File Type and Size Validation

- Allow only supported file types.
- Reject dangerous file types.
- Limit file size.
- Limit extracted text length if needed.
- Store files in user-specific paths.
- Do not execute uploaded content.

### Rate Limiting AI Routes

- Rate limit all AI routes.
- Rate limit upload processing if it triggers embeddings.
- Track usage per user.
- Block abusive repeated requests.
- Return clear limit messages.

### Generic User-Facing Errors

Do not expose:

- SQL errors
- API provider raw errors
- OAuth provider raw errors
- Stack traces
- Secret names
- Internal storage paths
- Service role details

Use safe messages:

- “Something went wrong.”
- “Could not process this material.”
- “Usage limit reached.”
- “You do not have access.”
- “Google sign-in failed. Please try again.”
- “Could not complete login. Please try again.”

### Environment Variables

Required env categories:

- Supabase URL/public anon key
- Supabase service role key
- AI provider key
- Upstash Redis keys, if included
- Resend key, if included
- Stripe keys, test mode only if included
- App URL

Google OAuth Client ID/Secret are configured in Supabase/Google Cloud provider settings and must not be exposed through frontend code.

### CORS Basics

- Same-origin app does not need broad CORS.
- Do not use `*` with credentials.
- Public APIs are out of scope.
- Keep API access internal to the app.

### Security Headers

- Add basic security headers.
- Avoid unsafe inline scripts where possible.
- Restrict framing if needed.
- Use safe referrer policy.
- Use content type protection.

### Admin Access Checks

- Admin UI must check role.
- Admin API must check role server-side.
- Normal users must not access admin logs or user lists.
- Admin logs should not expose sensitive document content.

### Safe Handling of Uploaded Materials

- Uploaded documents are private by default.
- Users can only access their own files.
- Extracted text should be treated as private user data.
- AI prompts should only include current user’s selected content.
- Do not send unrelated user data to AI provider.

---

## 14. Free Tier / Cost Constraints

The MVP must be buildable for free or almost free.

### Recommended Free / Low-Cost Services

| Tool | MVP Use | Required? |
|---|---|---|
| Vercel Hobby | Deploy Next.js app | Required |
| Supabase Free | Auth, Postgres, Storage | Required |
| Supabase Auth Google Provider | Google OAuth login | Required for Google OAuth |
| Supabase Storage | Store uploaded files | Required |
| Supabase pgvector | Store embeddings and search chunks | Required |
| Gemini API free tier | AI generation and embeddings | Required |
| Upstash Redis free tier | Rate limiting | Strongly recommended |
| Stripe test mode | Demo upgrade/billing flow | Optional |
| Resend free tier | Email-ready flows | Optional |
| Sentry free tier | Error monitoring | Optional |
| PostHog free tier | Product analytics | Optional |
| GitHub Actions free limits | CI checks | Recommended |

### Cost Rules

- Do not require paid OpenAI API for MVP.
- Do not require real Stripe payments.
- Do not require OCR services.
- Do not require paid vector database.
- Do not require background job infrastructure.
- Keep AI calls limited.
- Use usage limits from day one.
- Use one AI provider first to reduce complexity.
- Use Google OAuth only as an extra login method, not as a Google API integration.

### Paid / Live Billing

Paid billing is **not required** for the first MVP.

Stripe test mode can be included only as:

- Demo upgrade button
- Fake plan change flow
- Portfolio SaaS architecture showcase

No real payment collection in MVP.

---

## 15. Success Metrics

### MVP Completion Metrics

| Metric | Success Definition |
|---|---|
| Auth works | User can sign up, log in, log out with email/password and sign in with Google |
| Google OAuth works | Google OAuth user can complete callback, get profile row, and land on dashboard |
| Dashboard protected | Logged-out users cannot access dashboard |
| Upload works | User can upload valid notes/PDF/text |
| RAG works | User can ask questions from uploaded material |
| Roadmap works | User can generate and save roadmap |
| Flashcards work | User can generate and view flashcards |
| Quiz works | User can generate quiz, attempt it, and see score |
| Interview works | User can practice basic mock interview |
| Progress works | User can mark roadmap tasks and see progress |
| Limits work | Free usage limit blocks extra AI requests |
| Admin protected | Normal users cannot access admin |
| Deploy works | App is live on Vercel |

### User Experience Metrics

- New user understands app from landing page.
- User can sign up/login using email/password.
- User can sign in using Google.
- User can upload first material without confusion.
- AI actions have clear loading states.
- Errors are understandable.
- Empty states guide next action.
- Mobile layout is usable.
- User can complete one full learning loop.

### Technical Metrics

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Tests pass when added.
- RLS/user ownership is enforced.
- API keys are server-side.
- OAuth secrets are not exposed to frontend.
- AI route rate limits work.
- Logs capture important failures.
- App deploys successfully.

### Portfolio / Interview Metrics

The README and demo should clearly explain:

- Product problem
- Tech stack
- Architecture
- Database entities
- RAG flow
- Auth/proxy protection
- Email/password + Google OAuth auth flow
- Rate limiting
- Usage limits
- Security decisions
- Testing/deployment
- What was learned

---

## 16. Acceptance Criteria

### Final MVP Checklist

- [ ] User can visit public landing page.
- [ ] User can sign up and log in with email/password.
- [ ] User can sign in with Google.
- [ ] `/auth/callback` handles OAuth callback.
- [ ] OAuth user profile is created or loaded.
- [ ] Google OAuth works locally and in production after redirect URL setup.
- [ ] User can log out.
- [ ] Forgot password page exists.
- [ ] Dashboard is protected.
- [ ] Logged-out users are redirected from dashboard.
- [ ] Logged-in users are redirected away from login/signup.
- [ ] User profile is created or loaded.
- [ ] User can create a learning goal.
- [ ] User can upload material.
- [ ] Invalid files are blocked.
- [ ] Uploaded material metadata is saved.
- [ ] User can view uploaded materials.
- [ ] User can delete own material.
- [ ] Basic text extraction/chunking flow exists.
- [ ] Embeddings are stored for chunks.
- [ ] User can chat with uploaded notes.
- [ ] RAG answer uses uploaded context.
- [ ] RAG fallback appears when context is weak.
- [ ] User can generate roadmap.
- [ ] Roadmap tasks are saved.
- [ ] User can mark roadmap tasks complete.
- [ ] User can generate flashcards.
- [ ] Flashcards are saved and viewable.
- [ ] User can generate quiz.
- [ ] User can attempt quiz.
- [ ] User can see quiz score.
- [ ] User can review wrong answers.
- [ ] User can start mock interview.
- [ ] User can answer interview questions.
- [ ] User receives basic feedback.
- [ ] Progress tracking updates.
- [ ] Free usage limit works.
- [ ] AI routes are rate-limited.
- [ ] User data is isolated.
- [ ] Admin route is protected.
- [ ] Normal users cannot access admin pages.
- [ ] API errors are safe and generic.
- [ ] Loading states exist.
- [ ] Error states exist.
- [ ] Empty states exist.
- [ ] Mobile layout works.
- [ ] Tablet layout works.
- [ ] Desktop layout works.
- [ ] `proxy.ts` is used for route protection.
- [ ] `middleware.ts` is not used.
- [ ] `/auth/callback` is not blocked by `proxy.ts`.
- [ ] API keys are not exposed to frontend.
- [ ] OAuth secrets are not exposed to frontend.
- [ ] Build passes.
- [ ] App deploys on Vercel.
- [ ] README explains architecture clearly.

---

## 17. 10-Day Build Mapping

| Day | Focus | PRD Feature Mapping | Exit Gate |
|---|---|---|---|
| Day 1 | Docs | RESEARCH.md, PRD.md, PLAN.md, DESIGN_SYSTEM.md, DATABASE_SCHEMA.md, AGENT_RULES.md, SKILLS.md | No code. Clear product, MVP, data model, and agent rules. |
| Day 2 | Scaffold / design system | Next.js setup, layout, theme tokens, base UI components, empty/error/loading states | Build passes and UI foundation feels consistent. |
| Day 3 | Auth / profile / proxy | Signup, login, logout, forgot password, Google OAuth button, `/auth/callback`, profile creation for email/password users, profile creation for OAuth users, session provider, `proxy.ts` route protection | Logged-out users cannot access dashboard. Refresh keeps session. Google OAuth user lands on dashboard. |
| Day 4 | Roadmaps CRUD | Learning goals, roadmaps, roadmap tasks, progress updates, filters, ownership | User A cannot read/edit User B data. |
| Day 5 | Materials upload | PDF/TXT/text upload, metadata, preview, delete, validation, ownership | Bad files blocked. Users only access their own files. |
| Day 6 | AI generator | Generate roadmaps, flashcards, quizzes, interview questions, save outputs, fallback, usage counter | AI failure does not break app. Outputs save to DB. |
| Day 7 | RAG chat | Extract text, chunk content, store chunks, embeddings, vector search, grounded answer | Answers are grounded in uploaded material. |
| Day 8 | Quiz / interview | Quiz attempts, scoring, wrong-answer review, weak-topic basics, minimal mock interview sessions, progress charts | User can practice, see score, and know weak topics. |
| Day 9 | Admin / logs / rate limits / plans | Minimal admin dashboard, user list, role/plan checks, API logs, error logs, Upstash rate limit, free/pro limits, Stripe test checkout optional | Normal users blocked from admin. Rate limit works. |
| Day 10 | Testing / polish / deploy | Unit tests, API tests, Playwright auth flow, Google OAuth smoke check, SEO, accessibility, README, Vercel deploy | Lint + typecheck + test + build pass. App deployed. |

---

## 18. Risks and Scope Control

### Biggest Risks

| Risk | Why It Matters | Mitigation |
|---|---|---|
| Scope explosion | Too many features can block finishing | Follow strict MVP list |
| PDF parsing issues | PDFs can be messy or unreadable | Support normal PDFs/TXT first |
| RAG complexity | Retrieval quality can be hard | Keep chunking simple and test with small files |
| AI output invalid shape | AI may return messy output | Validate output before saving |
| Usage cost/quota issues | AI routes can burn free tier | Add limits early |
| Auth/RLS mistakes | User data leakage is serious | Enforce ownership from day one |
| OAuth redirect misconfiguration | Google login can fail locally or in production | Configure localhost and production redirect URLs carefully |
| Profile creation after OAuth fails | OAuth users may log in without app profile data | Ensure profile row after callback/session load |
| Admin overbuild | Admin can consume too much time | Keep admin basic |
| Billing distraction | Real payments are unnecessary | Stripe test mode only |
| UI polish trap | Too much design tweaking slows core build | Use design system and move phase-by-phase |
| Testing too late | Bugs pile up | Add command gates and smoke tests |

### What to Cut First If Behind Schedule

Cut in this order:

1. Admin dashboard polish
2. Stripe test mode
3. Email-ready flows
4. Export PDF
5. Export features entirely
6. Study calendar
7. Advanced weak-topic detection
8. Coding task generation
9. Advanced quiz review
10. Complex analytics

### What Must Never Be Cut

These define the project’s core value:

- Auth
- Email/password login
- Google OAuth login
- Protected dashboard
- Materials upload
- User ownership
- RAG chat with uploaded notes
- AI roadmap generation
- At least one study asset generator: flashcards or quizzes
- Basic progress tracking
- Usage limits/rate limiting
- Clean deployment
- README architecture explanation

### Quality Gates Before Moving to Next Phase

Before moving phases:

- Feature works end-to-end.
- UI looks acceptable on mobile and desktop.
- User ownership is checked.
- Loading state exists.
- Error state exists.
- Empty state exists where needed.
- No obvious console errors.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- From testing phase onward, tests pass.
- Changes are committed on correct branch.
- Builder can explain what changed without reading code.

For Day 3 specifically:

- Email/password signup works.
- Email/password login works.
- Google OAuth login works.
- `/auth/callback` handles success and failure.
- Profile row is created or loaded for both auth methods.
- Logged-in users are redirected away from `/login` and `/signup`.
- Logged-out users cannot access `/dashboard`.
- Google OAuth works with both localhost and production redirect URL setup.

---

## 19. Final PRD Summary

### Final MVP Definition

SkillForge AI MVP is a full-stack AI learning platform where authenticated users can sign up or log in using email/password or Google OAuth, upload learning material, generate roadmaps, flashcards, quizzes, and mock interview questions, chat with uploaded notes using RAG, track basic progress, and use the app within free/pro-style usage limits from a protected dashboard.

### Final Feature List

#### Core Product

- Landing page
- Auth with email/password
- Auth with Google OAuth
- Dashboard
- Profile/settings
- Learning goals
- Materials upload
- Material metadata
- Text extraction/chunking
- RAG chat
- Roadmap generation
- Flashcard generation
- Quiz generation
- Mock interview basics
- Progress tracking
- Usage limits
- Rate limiting
- Admin basics
- Error/loading/empty states
- Responsive UI
- Deployment

#### Core Architecture

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Google OAuth provider
- Supabase Postgres
- Supabase Storage
- Supabase pgvector
- Gemini API
- Upstash Redis
- `proxy.ts`
- `/auth/callback`
- Vercel deployment

#### Core Security

- Server-side API keys
- Auth-protected APIs
- RLS/user ownership
- Admin role checks
- File validation
- Rate limiting
- Generic errors
- Secure environment variables
- Google OAuth Client ID/Secret kept out of frontend
- Restricted OAuth redirect URLs
- Basic profile/email Google scopes only
- No provider token storage for MVP

### What File Should Be Created Next After PRD.md

The next file should be:

**`DATABASE_SCHEMA.md`**

It should define:

- Tables
- Columns
- Relationships
- Indexes
- pgvector structure
- RLS policies
- Storage bucket rules
- Migration order
- Seed/demo data plan

After `DATABASE_SCHEMA.md`, create:

1. `AGENT_RULES.md`
2. `DESIGN_SYSTEM.md`
3. `PLAN.md`
4. `SKILLS.md`
