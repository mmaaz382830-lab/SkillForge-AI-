# SkillForge AI — DESIGN_SYSTEM.md

**Project:** SkillForge AI  
**Document:** DESIGN_SYSTEM.md  
**Version:** MVP / 10-Day Build Scope  
**System name:** SkillForge AI — Neo-Brutalist Learning System  
**Purpose:** Define a bold, handcrafted, light-first visual system for the SkillForge AI MVP so the app does not look like another generic AI SaaS template.

---

## 1. Design System Purpose

### Why the old generic system is rejected

The previous design direction is rejected because it creates the common vibe-coded AI app look:

- dark-first navy/charcoal dashboard
- generic blue/violet AI accent
- soft borders and subtle shadows
- safe corporate typography
- predictable shadcn-style cards
- generic SaaS landing sections
- “premium AI dashboard” without a memorable identity

That style is clean, but it is too common. SkillForge AI needs a stronger identity because the project is meant to become a serious portfolio piece.

### Why this new system exists

This system makes SkillForge AI feel like a **bold digital study desk** where notes, quizzes, roadmaps, flashcards, interviews, and progress become physical learning cards.

The product should feel:

- handcrafted, not generated
- clear, not cluttered
- playful, not childish
- serious, not boring
- portfolio-grade, not template-grade
- student-friendly, not corporate-heavy
- developer-friendly, not fake-futuristic

### How it prevents AI-generated-looking UI

This file gives the build agent a strict visual language:

- warm paper backgrounds
- black ink borders
- hard offset shadows
- bold editorial typography
- color-blocked learning sections
- physical button press motion
- card-based study metaphors
- useful UI states for every flow

Agents must not replace this with generic dark SaaS styling.

### How it supports Day 2

Day 2 should implement the design foundation only:

- app shell
- visual tokens
- base components
- navigation shell
- loading/error/empty states
- responsive structure

Day 2 must not implement auth logic, AI APIs, uploads, RAG, quizzes, or admin functionality.

---

## 2. Core Visual Direction

### Product identity

SkillForge AI is a **neo-brutalist learning command desk**.

The UI should look like a stack of study cards, annotated notes, checklist blocks, quiz cards, and interview feedback sheets arranged inside a modern web app.

### Visual metaphor

| Metaphor | UI Translation |
|---|---|
| Study desk | warm paper page background, organized cards |
| Notes | paper blocks, source snippets, upload cards |
| Flashcards | physical card surfaces with hard shadows |
| Roadmap | checklist cards and progress strips |
| Quiz | bold option cards with clear selection states |
| Interview prep | structured feedback sheets |
| AI assistant | useful study-answer card, not magic sparkle bot |

### Core visual ingredients

- **Paper base:** warm cream background instead of dark navy.
- **Ink system:** strong black text, black borders, black CTA blocks.
- **Hard shadows:** 2px/4px/6px offset shadows, no blur.
- **Editorial type:** bold Space Grotesk-style headings.
- **Color blocks:** yellow, green, pink, blue used intentionally.
- **Physical interaction:** buttons and cards press or lift on hover.
- **Useful structure:** dashboard is practical, not decorative.

---

## 3. What To Avoid

Strictly avoid:

- generic dark SaaS theme
- blue-violet AI gradient identity
- glassmorphism
- floating 3D dashboards
- random AI sparkles
- thin gray borders
- soft blurred shadows
- same Inter-only corporate look
- boring empty dashboards
- too many cards with the same background
- low-contrast gray text
- random color usage
- finance-style copy or finance examples from the inspiration site
- unstyled default shadcn look
- generic hero copy like “unlock next-generation AI productivity”

If a screen could belong to 100 other AI startups, it is not finished.

---

## 4. Design Inspiration Translation

This system borrows design language from a neo-brutalist reference, but the product content must stay fully SkillForge.

| Reference Pattern | SkillForge Translation |
|---|---|
| Finance cards | Learning cards: materials, quizzes, flashcards, roadmaps |
| Portfolio card | Progress card / current roadmap card |
| Expense categories | Learning modes: Materials, Roadmaps, Flashcards, Quizzes, Interview, Progress |
| AI finance assistant | SkillForge Study Assistant / RAG Chat |
| Black CTA button | Start Learning / Upload Material / Generate Quiz |
| Bright feature blocks | Color-coded learning sections |
| Hard-shadow illustrations | Stacked note cards and dashboard preview |
| Pressable buttons | Physical study-tool interactions |

Do not copy wording, numbers, finance UI, rupee examples, stock visuals, or finance feature labels.

---

## 5. Theme Strategy

### MVP theme decision

Use a **light-first warm paper neo-brutalist theme** for MVP.

### Why light-first

- It is more distinct than generic dark AI dashboards.
- It fits notes, reading, study cards, and learning workflows.
- It makes the app feel handcrafted and memorable.
- It supports long reading better than low-contrast dark UI.
- It gives the portfolio project a stronger visual identity.

### Theme rules

- No theme toggle in Day 2.
- No dark-first product shell.
- Dark panels are allowed only as rare contrast blocks.
- Dashboard stays mostly paper/cream with black structure.
- Dark mode is post-MVP only.

---

## 6. Color System

### Core palette

| Token | Hex | Purpose | Use For | Do Not Use For |
|---|---:|---|---|---|
| `paper.base` | `#fffdf7` | main page background | landing, dashboard, auth, admin | dark SaaS backgrounds |
| `paper.muted` | `#f7f1e5` | secondary warm surface | alternate sections, subtle panels | low-contrast text areas |
| `ink.text` | `#18181b` | primary text | headings, body, UI labels | disabled text |
| `ink.border` | `#000000` | border/shadow system | cards, buttons, nav, inputs | decorative clutter |
| `accent.yellow` | `#fde047` | primary highlight | CTA, roadmap, key phrase block | every card at once |
| `accent.green` | `#86efac` | progress/learning success | progress, completed states, success cards | warning/error states |
| `accent.pink` | `#ff9ebb` | quiz/interview/challenge | quiz blocks, interview highlights | success states |
| `accent.blue` | `#bfdbfe` | RAG/info/source | chat, sources, info blocks | primary CTA replacement |
| `state.success` | `#4ade80` | success | completed, passed quiz, processed | decoration only |
| `state.error` | `#ef4444` | failure | upload failed, wrong answer, delete | harmless info |
| `state.warning` | `#facc15` | caution | usage near limit, processing delay | critical failure |
| `card.dark` | `#18181b` | rare contrast card | CTA strip, AI highlight, sidebar option | full app background |

### Feature color mapping

| Feature | Main Accent | Reason |
|---|---|---|
| Materials | Blue | source documents and RAG context |
| Roadmaps | Yellow | planning and direction |
| Flashcards | Green | revision and progress |
| Quizzes | Pink | challenge/practice |
| Interview | Pink + black | pressure/practice/feedback |
| Progress | Green | completion and growth |
| Admin/logs | Cream + black | functional and serious |

### Color rules

- Use black borders consistently.
- Use accent colors as large intentional blocks, not random decoration.
- Do not use more than 3 major colors in one viewport.
- No gradients as the main identity.
- Status must always include text, not just color.
- Keep normal reading surfaces cream/white.

---

## 7. Typography System

### Font stack

| Role | Recommended Font | Purpose |
|---|---|---|
| Headings | Space Grotesk or similar geometric display | strong editorial identity |
| Body/UI | Inter or similar readable sans | forms, cards, dashboard text |
| Code/technical | JetBrains Mono or Geist Mono | routes, code snippets, API labels |

### Type scale

| Style | Desktop Size | Mobile Size | Weight | Usage |
|---|---:|---:|---:|---|
| Hero | 64–80px | 42–52px | 500–700 | landing headline only |
| Section title | 40–56px | 30–38px | 500–700 | landing sections |
| Page title | 32–44px | 28–34px | 600–700 | dashboard pages |
| Card title | 20–24px | 18–22px | 700 | feature cards, material cards |
| Body large | 18px | 17px | 400–500 | landing intro |
| Body | 16px | 16px | 400 | normal UI text |
| Small | 13–14px | 13px | 400–600 | helper text, metadata |
| Label | 12px | 12px | 700 | category labels, small badges |

### Typography rules

- Big headings are part of the identity.
- Do not make dashboard text tiny.
- Do not use low-contrast gray as primary text.
- Use uppercase only for small labels, not paragraphs.
- AI answers should be comfortable to read: 16px with good line height.
- Buttons use bold text.
- Headings can be expressive; dashboard labels stay practical.

---

## 8. Spacing System

Use an 8px grid.

| Token | Size | Usage |
|---|---:|---|
| `space-1` | 8px | tight gaps, icon spacing |
| `space-2` | 16px | form fields, card internals |
| `space-3` | 24px | standard card padding |
| `space-4` | 32px | dashboard sections, card groups |
| `space-6` | 48px | medium landing sections |
| `space-8` | 64px | large landing sections |
| `space-section` | 96px | major landing breaks |

### Spacing rules

- Landing pages need large breathing room.
- Cards need generous padding so the brutal style feels intentional.
- Dashboard should be compact but never cramped.
- Mobile page padding should be 16px.
- Use spacing consistency instead of decoration.
- Do not use giant empty cards to fake premium spacing.

---

## 9. Borders, Shadows, Radius, and Depth

### Border system

| Token | Value | Usage |
|---|---|---|
| `border.strong` | `2px solid #000` | cards, buttons, nav, inputs |
| `border.light` | `1.5px solid #000` | small separators only |
| `border.focus` | `3px solid #000` or yellow outline | active/focus controls |

### Shadow system

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `2px 2px 0 #000` | badges, small buttons |
| `shadow-md` | `4px 4px 0 #000` | standard cards/buttons |
| `shadow-lg` | `6px 6px 0 #000` | hero cards, major feature blocks |

### Radius system

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 4px | tiny chips |
| `radius-md` | 8px | inputs, badges |
| `radius-lg` | 12px | cards, modals |
| `radius-xl` | 16px | hero cards, feature panels |
| `radius-pill` | 999px | pill badges only |

### Depth rules

- No blurred shadows.
- No soft glows.
- Shadows should look physical.
- Button hover should press into the shadow.
- Card hover can lift slightly.
- Rotation is allowed only for decorative hero/study cards, not dashboard data cards.

---

## 10. Motion Rules

| Motion | Behavior | Duration |
|---|---|---:|
| Button hover | translate `2px, 2px`; reduce shadow | 180–220ms |
| Card hover | translate `-2px, -2px`; stronger shadow | 180–220ms |
| Icon hover | rotate up to 3deg | 150–200ms |
| Modal enter | slight scale/opacity | 180–220ms |
| Toast enter | slide/opacity | 180–220ms |

Rules:

- Avoid constant animation.
- Avoid heavy scroll effects in MVP.
- Motion should support the physical card metaphor.
- Respect reduced motion if implemented.
- No floating AI orbs.

---

## 11. Layout System

### Public landing page

Structure:

1. sticky nav with cream background and thick bottom border
2. large hero with bold headline
3. angled yellow highlight behind one phrase
4. hero visual with stacked learning cards
5. problem section
6. three-step “Upload → Generate → Practice” section
7. color-block feature cards
8. RAG/source-grounded section
9. pricing/free plan section
10. final CTA
11. footer

Hero visual must be a believable SkillForge preview:

- upload card
- generated roadmap card
- quiz/interview card
- source-grounded chat snippet

No fake finance dashboard. No fake 3D glass UI.

### Auth pages

- centered brutal card
- cream background
- product name/logo at top
- email/password form
- divider
- Continue with Google button
- small helper links
- hard border and shadow

### Dashboard shell

- paper background
- sidebar with black border structure
- topbar with thick bottom border
- main content max width around 1200–1280px
- cards with hard shadows
- color-coded quick actions
- practical stats

### Feature pages

| Page | Layout Direction |
|---|---|
| Materials | upload dropzone + material card/list |
| Roadmaps | list of roadmap cards + detail checklist |
| Flashcards | deck list + physical card study mode |
| Quiz | focused question panel + option cards |
| Interview | question, textarea, feedback card |
| RAG Chat | selected material + study answer cards + source snippets |
| Admin | tables/cards, functional not decorative |

---

## 12. Grid System

| Area | Desktop | Tablet | Mobile |
|---|---|---|---|
| Landing hero | 12-column, split text/visual | stacked or 2-column | 1 column |
| Feature cards | 3 columns | 2 columns | 1 column |
| How it works | 3 columns | 2 columns | 1 column |
| Dashboard stats | 4 columns | 2 columns | 1 column |
| Quick actions | 3–4 cards | 2 cards | 1 card |
| Materials | list/card hybrid | cards/list | cards |
| Flashcards | deck + active card | active card first | one card |
| Quiz | centered panel | centered panel | stacked |
| Admin table | full table | compact table | card rows or scroll |

Rules:

- Do not squeeze desktop tables into mobile.
- Dashboard cards must stack cleanly.
- One-column mobile layout is the default.
- Keep line length readable.

---

## 13. Component Design Rules

### Component style baseline

All major components use:

- cream/white or intentional accent background
- black border
- hard shadow
- readable label
- consistent radius
- hover/focus state
- color only with meaning

### Component table

| Component | Purpose | Visual Treatment | Avoid |
|---|---|---|---|
| Button | trigger action | hard border, hard shadow, press hover | soft gradient buttons |
| Input | collect text | cream/white, black border, bold label | placeholder-only labels |
| Textarea | long answers/notes | large readable field, black border | tiny interview answer box |
| Select | choose difficulty/material | bordered control | too many options |
| Card | group content | 2px border + 4px shadow | many nested cards |
| Feature card | landing feature | accent block + icon chip | generic gray cards |
| Stat card | dashboard metric | compact hard card | fake analytics |
| Material card | file metadata/actions | icon chip + status badge | hidden file status |
| Roadmap task card | checklist item | checkbox + title + time | unclear completion state |
| Flashcard card | study revision | large physical card | tiny cramped cards |
| Quiz option card | answer selection | selectable bordered card | radio-only tiny UI |
| Interview feedback card | answer feedback | structured strengths/missing/improved | harsh walls of text |
| AI answer card | generated answer | readable study sheet | chat bubble clone |
| Source card | chunk reference | small paper snippet | fake page citations |
| Badge | status/metadata | pill or chip with border | decorative badges |
| Toast | short feedback | small brutal card | replacing inline errors |
| Modal | focused decision | centered card + shadow | complex workflow modal |
| Dropdown | compact menu | bordered menu | hiding primary actions |
| Tabs | related views | bold active border | many tiny tabs |
| Table | admin/logs | cream rows with black grid | exposing private note text |
| Progress bar | progress/usage | black outline + labeled fill | color-only progress |
| Skeleton | loading shape | muted paper blocks | shimmer overload |
| EmptyState | guide next action | friendly card + CTA | “No data.” only |
| ErrorState | explain failure | red/pink border/card | raw error dump |
| FileUploadDropzone | upload material | big dashed/hard border card | drag-only upload |
| Sidebar | navigation | strong active item | hidden labels |
| Topbar | page shell | thick bottom border | floating transparent nav |
| User menu | account actions | bordered dropdown | unsafe logout placement |

---

## 14. Button System

| Button | Style | Usage |
|---|---|---|
| Primary | black bg, white text, black border, hard shadow | main CTA |
| Highlight | yellow bg, black text, black border, hard shadow | landing CTA, roadmap action |
| Secondary | cream/white bg, black text, black border | supporting action |
| Ghost | transparent, black text, no heavy shadow | nav/sidebar |
| Danger | red/pink bg, black border | delete/failure action |
| Icon | square bordered chip | compact controls |
| Loading | pressed/disabled style + loading text | in-progress action |

CTA copy examples:

- Start Learning Free
- Upload Material
- Generate Roadmap
- Turn Into Flashcards
- Start Quiz
- Start Interview
- Chat With Notes

Rules:

- One main CTA per screen.
- Danger actions require confirmation.
- Disabled buttons need a visible reason.
- Do not use vague labels like “Submit” when a stronger action exists.

---

## 15. Form System

### Form visual rules

- Inputs are cream/white cards with black borders.
- Form cards use 2px black border + 4px shadow.
- Focus uses thicker border or yellow outline.
- Labels are bold and clear.
- Helper text must be readable.
- Error state uses red border and helpful text.
- Preserve user input after failed submit when safe.

### Auth form rules

- Email/password stays supported.
- Google OAuth is secondary, not the only method.
- Divider text: “or continue with”.
- Google button uses secondary brutal button style.
- Auth card should look secure, not playful chaos.

### Upload form rules

- Show supported types: PDF, TXT, Pasted Text.
- Show max size.
- Show processing status after submit.
- Failed upload must show a recoverable action.

### AI generation form rules

- Show selected material/topic.
- Show difficulty.
- Show requested count.
- Show usage warning if near limit.
- Loading copy must explain what is happening.

---

## 16. Public Landing Page Rules

### Landing sections

1. **Navbar** — product name, key links, primary CTA.
2. **Hero** — headline, short description, CTA pair, stacked learning preview.
3. **Problem** — scattered notes and unclear path.
4. **How it works** — Upload → Generate → Practice.
5. **Feature cards** — Materials, Roadmaps, Flashcards, Quizzes, Interview, RAG Chat.
6. **Source-grounded learning** — explain answers use uploaded material.
7. **Learning modes** — show each study output as a physical card.
8. **Pricing/free plan** — simple free/pro/demo explanation.
9. **Final CTA** — strong black or yellow action block.
10. **Footer** — project links and concise description.

### Hero copy direction

Good:

```text
Turn your notes into roadmaps, quizzes, and interview prep.
```

Possible subcopy:

```text
Upload your study material and SkillForge AI turns it into a clear learning system: roadmap, flashcards, quizzes, mock interviews, and note-grounded answers.
```

Avoid:

```text
Unlock next-generation AI productivity with magical automation.
```

### Hero visual rules

Use:

- stacked paper cards
- upload → roadmap → quiz/interview flow
- dashboard preview with black border and shadow
- source snippet card

Avoid:

- fake 3D floating dashboard
- finance visuals
- glassmorphism
- random gradient blobs

---

## 17. Dashboard Rules

### Dashboard should show

- welcome panel
- quick actions
- stats cards
- usage remaining
- current roadmap/progress
- recent activity
- first-user empty state

### Dashboard visual language

- cream/paper base
- black borders
- hard-shadow cards
- color-coded quick actions
- minimal charts
- progress bars with labels
- useful real content

### Recommended dashboard cards

| Card | Accent | Purpose |
|---|---|---|
| Upload Material | Blue | start source workflow |
| Generate Roadmap | Yellow | plan learning |
| Flashcards | Green | revise |
| Quiz | Pink | practice |
| Interview | Pink/black | prepare explanations |
| Usage Remaining | Cream/black | quota awareness |

Do not show fake huge analytics, random decorative cards, overloaded charts, or generic dark SaaS panels.

---

## 18. Auth Page Rules

### Login/signup layout

- centered card
- product logo/name above
- title and small supportive subtitle
- email/password fields
- submit button
- divider
- Continue with Google button
- switch auth link
- safe error message area

### `/auth/callback` state

Loading:

```text
Completing sign in...
```

Failure:

```text
Could not complete login. Please try again.
```

### Auth visual treatment

- cream background
- white/cream auth card
- 2px black border
- 4px hard shadow
- Google button as secondary brutal button
- no dark full-page auth screen

---

## 19. Materials Upload UI Rules

### Upload dropzone

A large paper card with:

- thick dashed or solid black border
- hard shadow
- upload icon chip
- clear instructions
- file type chips: PDF, TXT, Pasted Text
- max size helper
- browse button

Copy:

```text
Drop your PDF or TXT here, or browse files.
PDF and TXT supported for MVP. Scanned PDFs may not extract correctly yet.
```

### Material card

Show:

- title
- file type
- upload date
- processing status
- chunk count if processed
- actions: Preview, Chat, Generate, Delete

### Status badges

| Status | Treatment |
|---|---|
| Pending | cream/neutral badge |
| Processing | blue badge |
| Completed | green badge |
| Failed | red/pink badge |

---

## 20. RAG Chat UI Rules

### Chat should not be a ChatGPT clone

Use study-answer cards rather than tiny chat bubbles.

### Layout

- material selector at top
- context/status hint
- user question card
- AI answer card
- sources section as paper snippets
- composer/input at bottom

### Visual treatment

| Element | Style |
|---|---|
| User question | compact cream card |
| AI answer | larger blue-accent study sheet |
| Sources | small paper cards with short preview |
| Insufficient context | warning/info brutal banner |
| Loading | “Searching your material...” |

Rules:

- Do not invent citations.
- Show source cards only when chunks support the answer.
- Keep AI answers readable.
- No fake “magic thinking” animation.

---

## 21. Roadmap UI Rules

### Roadmap list

Each card shows:

- title
- difficulty badge
- estimated duration
- task count
- progress percentage
- AI-generated badge if relevant

### Roadmap detail

- title and description
- progress bar with black outline
- ordered task cards
- completion checkboxes
- estimated time

### Visual treatment

- yellow or cream highlight
- checklist-card feeling
- green completed state
- black outlined progress bar
- no timeline overengineering in MVP

Empty state:

```text
No roadmaps yet. Create a learning goal and generate your first roadmap.
```

---

## 22. Flashcard UI Rules

### Flashcard visual

A flashcard should feel like a physical study card:

- large centered card
- black border
- hard shadow
- readable front/back text
- topic badge
- difficulty badge
- flip/show-answer action

### Interaction

MVP can use:

- Show Answer button
- Show Question button
- Previous / Next
- `3 / 10` indicator

Avoid tiny cramped flashcards or complex spaced repetition UI.

---

## 23. Quiz UI Rules

### Quiz layout

- focused question panel
- progress indicator
- option cards
- submit/next action
- score summary
- wrong-answer review

### Option states

| State | Treatment |
|---|---|
| Default | cream card + black border |
| Hover/focus | stronger border/lift |
| Selected | yellow or blue highlight |
| Correct | green highlight + text label |
| Wrong | pink/red highlight + text label |
| Disabled | muted paper |

Rules:

- Exactly one clear selected state.
- Do not rely on color only.
- Keep explanations short and useful.

---

## 24. Mock Interview UI Rules

### Setup

Fields:

- topic
- material optional
- goal optional
- difficulty
- number of questions

### Interview flow

- one question at a time
- large answer textarea
- submit answer
- feedback card
- next question

### Feedback card

Must include:

- strengths
- missing points
- improved answer
- score range: 0–10
- next practice tip

Visual treatment:

- pink/cream challenge card
- black border
- structured feedback sections
- no harsh tone

MVP is text-only. No voice/video UI.

---

## 25. Admin UI Rules

Admin should be minimal and functional.

### Admin visual rules

- cream/white tables with black borders
- compact stat cards
- role/plan badges
- safe logs only
- no private note content in logs
- no decorative analytics wall

### Admin pages

| Page | UI |
|---|---|
| Admin overview | summary cards |
| Users | table on desktop, cards on mobile |
| Logs | route/status/time/safe code |

Admin should feel like a controlled internal panel, not a second product.

---

## 26. State Design Rules

| State | Visual Treatment | Copy Rule | Action |
|---|---|---|---|
| Loading | skeleton or bordered banner | specific message | wait |
| Skeleton | muted paper blocks | no fake data | none |
| Empty | friendly card + icon chip | explain next step | primary CTA |
| Error | pink/red bordered card | safe message | retry/back |
| Success | green badge/toast | short confirmation | continue |
| Warning | yellow banner/card | calm caution | explain |
| Disabled | muted card/control | reason visible | fix input/wait |
| Processing | blue badge/card | what is happening | wait/retry later |
| Rate limit | yellow/pink banner | try later | wait |
| Usage limit | quota card/banner | upgrade/wait message | view usage |

Examples:

```text
Preparing your notes for AI chat...
```

```text
We could not find enough context in this material.
```

```text
Upload your first note to start building your learning system.
```

---

## 27. Responsive Design Rules

| Breakpoint | Width | Rules |
|---|---:|---|
| Mobile | `< 640px` | single column, menu drawer |
| Tablet | `640–1024px` | 1–2 columns |
| Desktop | `> 1024px` | sidebar + content |

Rules:

- Mobile uses one column.
- Nav becomes menu/drawer.
- Cards stack vertically.
- Tables become cards or horizontal scroll.
- Chat composer works on mobile.
- Minimum tap target is 44px.
- Avoid tiny mobile text.
- Hero headline scales down cleanly.
- Hard shadows must not cause horizontal overflow.

---

## 28. Accessibility Rules

- Strong text contrast.
- Visible focus states.
- Keyboard accessible buttons, tabs, and quiz options.
- Inputs have labels.
- Modals are closable.
- Error messages are readable.
- Do not rely only on color.
- Google OAuth button has accessible label.
- File upload has browse button, not drag-only.
- Motion is subtle.
- Focus states can use thicker black border or yellow outline.

---

## 29. Icon System

### Icon style

- simple line icons
- black stroke by default
- 16–20px for nav/actions
- 20–24px for cards/empty states
- icons inside bordered square chips when featured

### Icon categories

- upload
- notes/materials
- roadmap
- flashcards
- quiz
- interview
- progress
- RAG chat
- settings
- admin
- warning/error

Rules:

- Icons support labels; they do not replace labels everywhere.
- Do not mix many icon styles.
- Avoid random decorative icons.

---

## 30. Data Visualization Rules

For MVP, use:

- progress bars
- score cards
- stat cards
- usage bars
- status badges

Avoid:

- complex charts
- fake graphs
- advanced analytics
- animated dashboards

Examples:

```text
6 of 10 tasks completed · 60%
```

```text
8 / 10 correct · 80%
```

```text
12 of 20 AI actions used this month
```

Visual rule: every visualization must be understandable in 3 seconds.

---

## 31. Content and Microcopy Rules

### Tone

- friendly
- direct
- student-focused
- confident but not fake
- practical
- not generic AI marketing

### Good copy

- Upload your first note to start building your learning system.
- Turn this material into flashcards.
- We could not find enough context in this material.
- Your roadmap is ready.
- Keep going — 3 tasks left.
- Start interview practice.
- Chat with this material.

### Bad copy

- Unlock next-generation AI productivity.
- Experience magical learning automation.
- Invalid.
- Something went wrong.
- Revolutionize your workflow with AI.

### Button copy

Use action-specific labels:

- Upload Material
- Generate Roadmap
- Generate Flashcards
- Start Quiz
- Submit Answer
- Review Mistakes
- Continue Learning

---

## 32. Design Tokens Summary

| Category | Token Direction |
|---|---|
| Colors | paper cream, black ink, yellow, green, pink, blue |
| Typography | Space Grotesk headings, Inter body, JetBrains/Geist Mono code |
| Spacing | 8px grid: 8, 16, 24, 32, 48, 64, 96 |
| Radius | 4, 8, 12, 16, 999 |
| Borders | 2px black for major components |
| Shadows | 2px/4px/6px hard black offset |
| Motion | 180–220ms physical press/lift |
| Layers | base, sticky nav/sidebar, dropdown, modal, toast |
| Focus | thicker black border or yellow outline |

Do not write Tailwind config in this file. Day 2 can convert these into tokens.

---

## 33. Component Priority for Day 2

### Must build

1. Button
2. Input
3. Textarea
4. Card
5. Badge
6. Toast
7. Skeleton
8. EmptyState
9. ErrorState
10. Modal/Dialog
11. Dropdown
12. Tabs
13. Progress
14. FileUploadDropzone basic shell
15. Sidebar shell
16. Topbar shell

### Build when needed

- MaterialCard
- RoadmapTaskCard
- FlashcardCard
- QuizOptionCard
- InterviewFeedbackCard
- AIAnswerCard
- SourceCard
- UsageCard
- Table
- UserMenu

### Post-MVP

- advanced charts
- calendar
- theme switcher
- rich text editor
- command palette
- notification center

---

## 34. Anti-AI-Looking UI Rules

### Strict rules

- No generic dark AI dashboard.
- No random huge gradient blobs.
- No glassmorphism.
- No copy-paste SaaS hero.
- No blue-violet default AI palette.
- No low-contrast gray text.
- No inconsistent border radius.
- No random icons.
- No blurred shadows.
- No fake 3D dashboard.
- No giant empty cards.
- No overused AI sparkles.
- No unstyled shadcn default look.

### What makes it handcrafted

- strong visual opinion
- consistent black border system
- physical hard shadows
- bold typography
- intentional color blocks
- real product-specific content
- useful empty states
- clear learning workflow
- screens that look designed, not generated

### Acceptance test

A screen is acceptable only if it still feels like SkillForge AI when screenshots are shown without explanation.

---

## 35. Design Quality Checklist

### Landing page

- [ ] Warm paper background
- [ ] Bold headline with clear product promise
- [ ] One highlighted phrase/block
- [ ] Real SkillForge feature cards
- [ ] No finance copy
- [ ] No generic AI fluff
- [ ] Mobile hero scales correctly

### Auth pages

- [ ] Brutalist auth card
- [ ] Email/password supported
- [ ] Google OAuth button present
- [ ] Safe error messages
- [ ] Callback loading/failure state

### Dashboard pages

- [ ] Useful within 5 seconds
- [ ] Clear quick actions
- [ ] Usage visible
- [ ] Progress visible
- [ ] Cards have consistent borders/shadows
- [ ] No fake analytics clutter

### Feature pages

- [ ] Materials upload is obvious
- [ ] RAG chat uses study-answer cards
- [ ] Roadmaps use checklist cards
- [ ] Flashcards feel physical
- [ ] Quiz options are accessible
- [ ] Interview feedback is structured

### Mobile

- [ ] Single-column layout
- [ ] Nav collapses
- [ ] Cards do not overflow
- [ ] Tap targets are 44px+
- [ ] Chat is usable
- [ ] Tables adapt

### Accessibility

- [ ] Focus states visible
- [ ] Labels present
- [ ] Contrast strong
- [ ] Color not the only status indicator
- [ ] Modals closable

### Recruiter demo quality

- [ ] Looks memorable
- [ ] Shows a real product loop
- [ ] Does not look like default AI SaaS
- [ ] UI supports the project story
- [ ] Screens feel designed, not generated

---

## 36. Final Design Summary

### Final direction

SkillForge AI uses a **light-first neo-brutalist learning system**: warm paper background, black ink borders, hard physical shadows, bold editorial typography, and color-coded learning cards.

The product should feel like a digital study desk where users turn notes into roadmaps, flashcards, quizzes, interviews, and source-grounded answers.

### What Day 2 should build first

Day 2 should build:

1. app shell foundation
2. theme/token variables from this system
3. base Button/Input/Textarea/Card/Badge components
4. feedback components: Toast, Skeleton, EmptyState, ErrorState
5. Modal/Dialog, Dropdown, Tabs, Progress
6. FileUploadDropzone shell
7. Sidebar shell and Topbar shell

### What must be avoided

- no dark-first redesign
- no generic blue/violet AI palette
- no finance copy or finance UI
- no glass cards
- no blurred shadows
- no fake dashboards
- no random decorative cards
- no overbuilding beyond Day 2

### Next file

After `DESIGN_SYSTEM.md`, the next Day 1 file should be:

```text
PLAN.md
```

`PLAN.md` should define the phase-by-phase implementation plan, branch strategy, command gates, acceptance criteria, and exact task breakdown for the 10-day SkillForge AI MVP.
