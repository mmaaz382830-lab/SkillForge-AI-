# SkillForge AI Research

## Executive summary

SkillForge AI should be positioned as a focused, developer-friendly study OS for people who learn from their own materials and want measurable outputs: roadmaps, flashcards, quizzes, mock interviews, coding tasks, and a chat interface grounded in uploaded notes. The strongest market signal is that the most compelling tools in this space already cluster around three real user behaviors: turning source material into study assets, asking grounded questions over personal documents, and receiving structured guidance rather than one-off answers. Quizlet leans hard into flashcards and test prep, NotebookLM into source-grounded learning artifacts, ChatPDF and Humata into document Q&A, and Khanmigo/Coursera Coach into guided tutoring and pedagogy. That leaves a practical gap for a portfolio-grade product that combines document-grounded learning with interview prep and project-task generation in one workflow. citeturn0search0turn0search19turn1search0turn27search16turn28search1turn28search0turn2search0turn4search2

From a product-strategy perspective, the best 10-day MVP is not “an AI school in a box.” It is a narrow but impressive vertical slice: upload notes or PDFs, extract and chunk them, store embeddings, chat with them using RAG, generate a learning roadmap, generate flashcards and quizzes, run a basic mock interview mode, and track progress at a simple level. This scope is broad enough to show full-stack depth and AI product thinking, but narrow enough to stay realistic on Vercel Hobby plus Supabase Free with a low-cost model provider. citeturn26search0turn26search6turn7search10turn7search13turn13search0

The best beginner-to-intermediate stack for this project is Next.js App Router on Vercel, Supabase for auth/database/storage/vector search, Gemini Developer API for generation and embeddings, Upstash Redis for rate limiting, Resend for transactional email, Stripe test mode for plan UX, and optional Sentry/PostHog for observability. That stack is unusually coherent because each tool has a strong free or low-cost path, official docs for App Router and SSR-friendly auth, and enough real-world credibility to read well in interviews and on a résumé. citeturn23search6turn23search0turn32search0turn32search3turn7search13turn6search5turn13search0turn14search0turn8search3turn15search0turn30search2

## Competitive landscape

The market splits into four clusters. The first is **AI study tools** like Quizlet, StudyFetch, and Turbo AI, which optimize test preparation and note transformation. The second is **source-grounded knowledge tools** like NotebookLM, ChatPDF, Humata, and Perplexity Spaces, which are strongest at document chat and synthesis. The third is **pedagogy-first assistants** like Khanmigo and Coursera Coach, which focus on tutoring, hints, and guided mastery. The fourth is **interview-prep tools** like Final Round AI, which focus on mock interviews and coaching rather than learning from long-form study materials. SkillForge AI’s opportunity is to combine the best of those clusters for technical learners: grounded learning plus preparation for coding and interviews. citeturn0search0turn27search16turn28search1turn28search0turn27search2turn2search0turn4search2turn5search2

| Product | Official site | Main features | Target users | Pricing or free tier | Strengths | Weaknesses | What SkillForge AI should learn | How SkillForge AI can differ |
|---|---|---|---|---|---|---|---|---|
| Quizlet | Official product page citeturn0search16turn0search0turn0search19turn0search22 | Flashcards, AI flashcard generation, Magic Notes, practice tests, Q-Chat | Students, teachers, classrooms | Free tier available; paid plans public at about $35.99/year and $44.99/year on surfaced pricing pages citeturn0search0turn0search7turn0search4 | Clear study loop, polished flashcards, familiar mental model | Weak on deep portfolio-worthy workflow design and full-source RAG across many user artifacts | Flashcards and quizzes are still core and must feel fast, not “enterprise” | Go beyond memorization into roadmap generation, weak-topic analysis, coding tasks, and interview prep |
| Notion AI | Official product page citeturn0search5turn0search14 | Workspace AI, knowledge retrieval, drafting, search, agents | Knowledge workers, teams, students already in Notion | Free and Plus get limited complimentary AI responses; Business and Enterprise include Notion AI; other AI capabilities use credits on current pricing page citeturn0search1turn0search14 | Strong “all-in-one workspace” story | General-purpose, not deeply optimized for studying from uploaded material | Strong UX matters more than model novelty | Specialize for learning outcomes instead of generic writing/search |
| NotebookLM | Official product page citeturn27search1turn27search16turn27search18 | Source-grounded chat, study guides, briefings, mind maps, audio overviews, flashcards, quizzes, slide decks | Students, researchers, knowledge workers | Free version exists; upgrades add higher limits via Google AI plans or Workspace citeturn1search0turn34search0turn34search7 | Best-in-class source-grounded learning artifact generation | Less productized around long-term progress and interview prep | Ground answers in user sources and turn them into multiple study formats | Add progress, mastery tracking, interview mode, and project-task generation |
| Khanmigo | Official product page citeturn2search0turn2search14 | AI tutor, guided hints, teacher tools, homework support | K-12 learners, parents, teachers, districts | Learner and parent subscriptions surfaced at $4/month or $44/year; teacher tools free in supported regions/locales citeturn2search1turn2search7turn2search3 | Pedagogy-first, safety-conscious, grounded in Khan content | Limited geographic availability for some plans and not centered on user-uploaded knowledge bases | Tutor behavior should scaffold instead of just answer | Focus on self-learners and developer interview prep rather than school-only tutoring |
| ChatPDF | Official product page citeturn3search0turn28search1turn28search12 | PDF chat, built-in citations, multi-file chats, summaries, flashcards, AI writer | Students, researchers, professionals | Free plan allows 2 documents per day according to the official site; Plus offers unlimited document analysis and extras citeturn3search0turn3search4 | Extremely clear value proposition, good citation UX | Document chat can feel narrow and transient | “Chat with notes” must be incredibly obvious and fast | Add durable learning outputs, progress, and interviews beyond one-off PDF Q&A |
| Humata AI | Official product page citeturn28search0turn28search11turn28search14 | Ask questions across files, summarize, compare docs, team knowledge base, custom prompts | Researchers, professionals, teams | Free plan surfaced with up to 60 pages and 10 answers; paid tiers add page allowances and features citeturn3search5turn28search11 | Multi-document knowledge-base framing is strong | Pricing tied to pages/answers can feel restrictive for students | Chunking, retrieval, and trustworthy references matter | Target learners directly, not just document workers |
| Perplexity Spaces | Official product page citeturn3search12turn27search2turn27search22 | Shared workspaces, file uploads, internal knowledge search, connectors | Researchers, teams, enterprise users | Core search is free; Pro is $20/month or $200/year and unlocks Spaces, uploads, higher limits; higher enterprise tiers exist citeturn3search12turn3search2turn3search6 | Excellent research workflow and strong web+file blend | Less tailored to memorization and deliberate practice | Combining web context with private notes is powerful | Keep the core experience study-first, not research-first |
| Coursera Coach | Official product page or official blog coverage citeturn4search2turn4search3turn4search6turn4search9 | Learning assistance, recaps, guided practice, pre-assessment review, feedback | Online course learners and educators | Not sold as a separate public subscription in surfaced sources; appears bundled into supported courses and some previews citeturn4search9turn4search16 | Good pedagogy and strong course grounding | Closed ecosystem; depends on Coursera content | Guided practice and feedback loops are valuable | Bring similar coaching behavior to user-uploaded notes and interview prep |
| StudyFetch | Official product page citeturn33search0turn5search4turn33search3 | Study plan, AI tutor, notes, quizzes, flashcards, games, visuals, lecture recording | Students | Public official pages clearly show “Start for Free,” but surfaced sources did not expose a clean public pricing table citeturn33search0 | Very wide feature surface and strong student language | Can feel broad and feature-heavy | Students like multi-output workflows from one upload | Build a tighter, more serious developer-learning path with cleaner information architecture |
| Turbo AI | Official product page citeturn28search3turn33search1 | Turn PDFs, videos, audio into notes, flashcards, quizzes, podcasts; folders and editing | Students | Official site says free to start and mentions a generous free tier, with paid upgrades for unlimited and advanced capabilities citeturn28search3turn33search1 | Great “turn anything into study assets” messaging | Public pricing details are less transparent in surfaced sources | Inputs should be flexible: PDF, text, links later | Differentiate with RAG, mastery tracking, and interview workflows |
| Final Round AI | Official product page citeturn5search2turn5search6turn5search10 | AI mock interviews, interview reports, interview copilot, role-based question prep | Job seekers, interview candidates | Free plan exists; official surfaced pages mention paid plans starting around $25/month and expose higher subscription options on its subscription page citeturn5search2turn5search10 | Strong interview-prep positioning | Not a full learning platform and not grounded in personal study notes by default | Mock interview is a high-portfolio-value feature | Tie mock interviews directly to what the user studied and uploaded |

The key pattern across the best products is that they do **one primary job very clearly**. Quizlet says “study with flashcards.” ChatPDF says “chat with your PDF.” NotebookLM says “learn from your sources.” Final Round AI says “practice interviews.” SkillForge AI should not launch as “an all-purpose AI education platform.” It should launch as **the best way to turn your own notes into a roadmap, study assets, and interview practice**. That is a sharper story and a better portfolio narrative. citeturn0search16turn28search1turn27search16turn5search2

## Feature opportunity analysis

The scoring below is an inference-based product prioritization for a student/developer persona on a five-point scale, where higher is better for MVP importance, portfolio value, interview value, and user usefulness. For technical difficulty, higher means harder. The ordering reflects both user value and build realism for a 10-day sprint. The rationale is grounded in how current products concentrate their value around uploads, grounded chat, study artifacts, and guided tutoring rather than around admin-heavy or platform-heavy features. citeturn28search1turn28search0turn27search16turn4search2

| Feature | MVP importance | Technical difficulty | Portfolio value | Interview value | User usefulness | Practical read |
|---|---:|---:|---:|---:|---:|---|
| AI chat with notes using RAG | 5 | 4 | 5 | 5 | 5 | **Anchor feature** |
| Upload notes/PDFs/text | 5 | 2 | 5 | 5 | 5 | **Non-negotiable input layer** |
| AI roadmap generation | 5 | 3 | 4 | 5 | 5 | **High-value differentiator** |
| Mock interview mode | 4 | 3 | 5 | 5 | 4 | **Best “wow” feature after RAG** |
| Flashcard generation | 4 | 2 | 4 | 4 | 5 | **Fast win** |
| Quiz generation | 4 | 2 | 4 | 4 | 5 | **Fast win** |
| Coding task generation | 3 | 3 | 5 | 5 | 4 | **Very strong for dev persona** |
| Progress tracking | 3 | 2 | 4 | 4 | 5 | **Needed, but keep simple** |
| Weak topic detection | 3 | 4 | 5 | 5 | 5 | **Great phase-two feature** |
| Export to PDF/TXT/JSON/CSV | 3 | 2 | 4 | 4 | 3 | **Good polish** |
| Free/Pro usage limits | 5 | 2 | 4 | 4 | 4 | **Necessary product realism** |
| Study calendar | 2 | 3 | 3 | 3 | 3 | **Easy to overbuild** |
| Admin dashboard | 1 | 3 | 3 | 3 | 2 | **Avoid in MVP except minimal analytics** |

A strong MVP order emerges from that table. The first layer is **content ingestion and retrieval**: upload, parse, chunk, embed, retrieve, chat. The second layer is **study transformation**: roadmap, flashcards, quizzes. The third layer is **career relevance**: mock interview and coding-task generation. The fourth layer is **retention and progress**: quiz attempts, completion state, simple streaks or percent-complete. Everything after that is polish or monetization scaffolding. citeturn27search16turn28search1turn5search6

For portfolio value, the winning feature combination is not just “RAG.” Recruiters and interviewers will care more if the app demonstrates a coherent learning loop: document upload, semantic retrieval, structured output generation, user state, guarded routes, quotas, and analytics. In other words, the project becomes much stronger when it looks like a real SaaS product instead of a single AI demo. That is why simple plan limits, progress logs, and audit-friendly ownership checks deserve space in the MVP even though they are less glamorous than generation features. citeturn23search6turn24search0turn24search3turn26search0

## Free-tier and tool audit

The table below focuses on the practical choices that matter for this build. Pricing and quotas move often, so the safest implementation rule is to store links to the official pricing pages in your repo docs and recheck them before launch.

| Tool | Use in SkillForge AI | Current free tier or pricing signal | Risks or limitations | Best alternative | MVP status |
|---|---|---|---|---|---|
| Vercel Hobby | Deploy Next.js app and API routes | Free forever; personal/non-commercial use guidance; typical monthly Hobby guidance includes 100 GB Fast Data Transfer, 4 CPU-hours active CPU, 100 GB-hours function execution, 100 build hours; Hobby can hit waits instead of overages, with 100 deploys/day and 32 builds/hour surfaced in limits docs; Hobby cron is limited to once per day citeturn26search1turn26search0turn26search6turn26search2turn26search9 | Personal-use restrictions, hard waits after limits, not ideal for background-heavy ingestion | Netlify or Cloudflare Pages | **Required** |
| Supabase Free | Auth, Postgres, Storage, vector search | Free plan includes 500 MB database, 1 GB storage, 5 GB egress, and 50,000 monthly active users; free projects can be paused after low activity; pgvector is available as a Postgres extension in Supabase citeturn7search10turn7search15turn7search13turn7search2 | Database and egress limits; possible pausing on inactivity | Neon + Clerk + Cloudflare R2 + separate vector DB | **Required** |
| Supabase Auth | Sign-up, sign-in, sessions, passwordless/social later | Included in Supabase; SSR-compatible with cookies via `@supabase/ssr`; supports password, magic links, OTP, social login; some auth rate limits apply and custom SMTP defaults can bottleneck signups citeturn24search2turn32search3turn32search18turn7search0turn7search15 | Email deliverability and signup rate limits need care in production | Clerk or Auth.js | **Required** |
| Supabase Storage | User file uploads for PDFs/notes | Uses same free-project storage limits above; Storage supports RLS-based access policies citeturn7search10turn24search3 | Storage is cheap but not infinite; scanned PDFs can balloon usage | Cloudflare R2 or AWS S3 | **Required** |
| Supabase pgvector | Store embeddings and do retrieval | Built into Supabase Postgres via `vector` extension; no separate vector bill on Free beyond normal DB usage citeturn7search2turn7search9turn7search17 | Large embedding tables consume regular DB storage and need indexing | Upstash Vector, Pinecone, Weaviate Cloud | **Required** |
| Upstash Redis | Rate limiting, lightweight caching, quotas | Free Redis includes 256 MB and 500K commands/month, with 10 GB bandwidth surfaced in plan table citeturn6search5turn6search10 | Command caps can appear quickly under aggressive AI traffic | Simple Postgres counters or Cloudflare KV | **Optional but strongly recommended** |
| Gemini Developer API | Primary text generation and embeddings | Gemini API pricing page shows many free-tier entries for generation, and `gemini-embedding-001` is available on free and paid tiers; some models note that free-tier usage may be used to improve products, while paid tier does not citeturn13search0turn13search1 | Free-tier limits are model-specific and may change; privacy posture differs between free and paid tiers | Groq for generation; local embeddings for retrieval | **Required** |
| OpenAI API | Optional premium model path | Official help pages show API usage is billed separately, uses prepaid billing, and do not surface a guaranteed general public free API tier; surfaced billing examples show free trial remaining as $0.00 for setup docs citeturn12search0turn12search1 | Requires payment method; easiest route to surprise costs | Gemini or Groq | **Optional** |
| Groq API | Fast low-cost generation fallback | Groq has a free tier with rate limits/restrictions and a paid Developer tier; exact rate limits are account-visible and can vary; Groq’s docs explicitly distinguish free-tier restrictions from paid features citeturn25search0turn25search6turn25search17turn25search12 | Exact free quotas are less transparently fixed in public docs than some competitors | Gemini Developer API | **Optional** |
| Hugging Face Inference Providers | Tiny-credit experimentation or model routing | Free users get $0.10 monthly credits; Pro users get $2.00 monthly credits; usage beyond credits is pay-as-you-go at provider rates with no HF markup citeturn8search2turn8search6turn8search14 | Credits are too small for a real consumer app backend | Local models via Ollama or direct provider APIs | **Optional** |
| Stripe test mode | Payments and plan-upgrade UX without charging | Stripe test mode and sandboxes let you test integrations without moving real money citeturn8search3turn8search7turn8search11 | Adds product complexity before monetization is real | Skip payments in MVP, or use a fake upgrade gate | **Optional** |
| Resend | Transactional email for waitlist, receipts, magic links later | Free accounts: 100 emails/day and 3,000/month; pricing page shows Free at $0 and Pro at $20/month for 50,000/month; default API rate limit surfaced at 5 requests/second/team citeturn14search0turn29search1turn29search2turn29search3 | Daily quota is small; both sent and received emails count | MailerSend or Brevo | **Optional** |
| Nodemailer | SMTP abstraction if you want vendor-neutral email code | Free open-source library; built-in SMTP transport and other transports documented officially citeturn17search3turn17search0turn17search5 | Not an email provider by itself; you still need SMTP | Resend SDK, Brevo SMTP, MailerSend | **Optional** |
| MailerSend | SMTP/API alternative to Resend | Free plan includes 500 emails/month and 10 verification credits citeturn17search2 | Smaller free tier than Resend | Resend | **Optional** |
| Brevo | SMTP/API alternative to Resend or Nodemailer backend | Free forever; official FAQ states accounts can start sending up to 300 emails/day once approved citeturn18search0 | Heavier broader platform than you need for MVP | Resend | **Optional** |
| GitHub Actions | CI for lint, tests, build checks | Public repos use standard runners free and unlimited; for private repos GitHub Free includes 2,000 minutes/month, 500 MB artifact storage, 10 GB cache storage citeturn16search7turn16search5turn16search0 | Private-repo minutes can disappear faster than expected | Local CI + Vercel deploy checks | **Recommended** |
| Sentry | Error tracking and tracing | Free Developer plan includes 1 user plus surfaced quotas of 5k errors, 5 GB logs, 5M spans, and 50 replays citeturn30search0turn15search3 | Easy to over-instrument too early | Plain logs or Vercel logs | **Optional** |
| PostHog | Product analytics and feature-usage insights | Free tier includes 1M analytics events, 5K session replay recordings, 1M feature-flag requests, 100K exceptions, and more on its current page citeturn15search1turn30search2 | Can become distracting before you even have users | Simple internal event table | **Optional** |
| PyMuPDF | Fast PDF text extraction | Open-source high-performance PDF extraction/manipulation library citeturn19search0turn19search4 | Text extraction on messy/scanned docs can be imperfect | Unstructured | **Recommended** |
| Unstructured OSS | Better document preprocessing for LLM pipelines | Open-source toolkit for ingesting and preprocessing PDFs, images, HTML, Word docs, and more citeturn19search2turn19search6turn19search17 | Heavier dependency footprint than a minimal parser | PyMuPDF | **Optional for MVP, strong phase-two option** |
| Tesseract OCR | OCR fallback for scanned PDFs/images | Open-source OCR engine under Apache 2.0 citeturn19search1turn19search9turn19search20 | OCR is slow and adds operational complexity | Skip OCR in MVP or use an external OCR API later | **Avoid in first 10 days unless necessary** |
| PDF.js | In-browser PDF rendering/preview | Open-source PDF parsing and rendering library for web apps citeturn19search3turn19search11 | Parsing is not the same as robust extraction | Native browser preview or simple file cards | **Optional** |
| Sentence Transformers | Local open-source embeddings | Open-source framework for producing embeddings and reranking models citeturn20search0turn20search12 | Running local embeddings is awkward on hobby serverless hosting | Gemini embeddings | **Optional** |
| Ollama `nomic-embed-text` | Local embedding option for dev environments | Open embedding model surfaced on Ollama; designed only for embeddings citeturn20search2turn20search17 | Good locally, awkward on Vercel Hobby | Gemini embeddings | **Optional for local experimentation** |

The cheapest credible MVP path is therefore: **Vercel Hobby + Supabase Free + Gemini free tier + optional Upstash free + optional Resend free**. That combination minimizes both infra complexity and the chance that you spend your first week debugging cloud glue instead of building product. OpenAI should be treated as a later optimization or premium tier option, not as a default dependency. citeturn26search0turn7search10turn13search0turn6search5turn29search1turn12search0

## Recommended stack

The most practical stack for SkillForge AI is shown below.

| Layer | Recommendation | Why this is the best fit now |
|---|---|---|
| Frontend framework | **Next.js App Router + TypeScript** | Route Handlers, Server Components, and App Router give you one coherent full-stack codebase and a very interview-friendly architecture story. Next.js officially recommends Route Handlers in the `app` directory for request handling. citeturn23search6turn23search0turn23search3 |
| UI library | **Tailwind CSS + shadcn/ui** | Fastest path to a polished SaaS look without abstracting away frontend fundamentals; also pairs naturally with Next.js and makes your repo look modern and production-aware. This is a design recommendation rather than a pricing claim. |
| Auth | **Supabase Auth** | One provider for auth, cookies-based SSR support, passwordless options, and tight integration with RLS. citeturn24search2turn32search3turn32search18 |
| Database | **Supabase Postgres** | Real SQL, easy schema design, excellent for portfolio credibility, and integrates with auth and storage. citeturn7search6turn7search10 |
| File storage | **Supabase Storage** | Keeps user uploads under the same auth and RLS model as the database. citeturn24search3turn7search18 |
| Vector database | **pgvector in Supabase** | Enough for an MVP and much better for learning than outsourcing vectors to another vendor. citeturn7search2turn7search9turn7search17 |
| Embeddings | **Gemini embeddings first** | Official free-tier support makes it the strongest low-cost default. citeturn13search0turn13search1 |
| Generation provider | **Gemini Developer API first, Groq optional fallback** | Gemini has generous free-tier signals and an embedding model on the same platform; Groq is useful as a speed-oriented alternative later. citeturn13search0turn25search12turn25search1 |
| Rate limiting | **Upstash Redis** | Simple, serverless-friendly, and cheap enough to protect AI routes without building your own limiter on day one. citeturn6search10turn6search5 |
| Email | **Resend** | Cleaner developer experience than raw SMTP and a reasonable free tier for early transactional mail. citeturn29search1turn29search2 |
| Payment testing | **Stripe test mode** | Standard SaaS practice, zero need to process real money during MVP. citeturn8search3turn8search11 |
| Deployment | **Vercel Hobby** | Best DX for Next.js and enough for a demo/portfolio MVP if ingestion stays lightweight. citeturn26search1turn26search0 |
| Testing tools | **Vitest + React Testing Library + optional Playwright smoke tests** | Shows engineering maturity without excessive setup; this is a best-practice recommendation. |
| Logging and monitoring | **Console logs first, Sentry second** | Start simple, add Sentry once routes stabilize. Sentry’s free plan is enough for a small portfolio project. citeturn30search0turn15search3 |
| Analytics | **PostHog later** | Great free tier, but only worth adding once you want usage evidence for product thinking. citeturn30search2turn15search1 |

If you want the shortest path to something impressive, keep generation on **one provider** in the first version. The easiest choice is Gemini alone: generation plus embeddings from one API surface. That reduces config sprawl, billing confusion, and debugging time. Only introduce a second provider when you have a clear rationale such as faster inference for mock interviews or a cost-controlled premium tier. citeturn13search0turn25search1

## Product strategy

### MVP scope

For a 10-day build, the **must-have** scope is this: authentication, upload notes/PDF/text, document parsing, chunking and embeddings, RAG chat over user-owned documents, roadmap generation, flashcard generation, quiz generation, a lightweight mock interview mode, and very simple progress tracking based on completed roadmap items and quiz attempts. This is the narrowest complete loop that still feels like a real product. citeturn27search16turn28search1turn5search6

The **should-have** set is coding-task generation, export to JSON/TXT/PDF, plan-limits UX, and a lightweight dashboard for recent uploads, roadmap completion, and quiz history. These features improve the SaaS feel and portfolio strength, but they should not block launch. They are especially useful for helping the app read as “full-stack product” rather than “LLM wrapper.” citeturn26search0turn7search10turn23search6

The **nice-to-have** set is weak-topic detection, study calendar, spaced repetition scheduling, shared study collections, collaborative workspaces, and richer analytics. These are excellent phase-two features because they need more user-state history, more UX refinement, and more background job logic than a 10-day MVP usually supports. citeturn27search3turn15search1turn30search2

The features to **avoid for now** are full OCR pipelines for scanned documents, a true multi-tenant admin suite, complicated subscription billing logic, connector-heavy integrations, and elaborate AI agents that continue work autonomously. Each of those can consume days of engineering time while adding surprisingly little portfolio signal compared with a solid first version of RAG, roadmap generation, and guided interview practice. OCR especially is a classic scope trap because Tesseract or equivalent tooling adds accuracy and performance headaches immediately. citeturn19search9turn19search2

### User personas

| Persona | Pain points | Goals | How SkillForge AI helps | Most important features |
|---|---|---|---|---|
| Exam-focused student | Notes are messy, studying feels unstructured, hard to know what to revise first | Turn class material into a study plan that actually ends in better recall | Converts uploads into a roadmap, flashcards, quizzes, and note chat | Uploads, roadmap, flashcards, quizzes, progress |
| Beginner full-stack developer | Learns from scattered tutorials and notes but struggles to connect concepts into projects | Learn deeply and show working knowledge in interviews and on GitHub | Generates learning roadmap, coding tasks, and project-style exercises from notes | Roadmap, coding tasks, note chat, progress |
| AI/ML interview candidate | Knows theory unevenly and needs practice explaining concepts clearly | Prepare for technical and behavioral interview questions with grounded examples | Uses uploaded notes to generate mock interview prompts and follow-ups | Mock interview, quizzes, weak-topic detection, note chat |
| Self-learner with PDFs | Has books, PDFs, and copied notes but no unified system | Search and understand personal material quickly | Builds a personal knowledge base with citations and study artifacts | Uploads, RAG chat, summaries, flashcards |
| Admin or solo platform owner | Needs visibility into product usage and abuse without enterprise overhead | Run the app cheaply and safely | Uses plan limits, basic analytics, and admin-safe moderation tools later | Usage limits, monitoring, simple admin metrics |

### Product positioning

**One-line pitch**

SkillForge AI turns your notes into a personal learning roadmap, study system, and interview coach.

**Thirty-second pitch**

SkillForge AI is an AI-powered study and interview-prep platform for students and developers. Upload your notes, PDFs, or text, and it turns them into a structured roadmap, flashcards, quizzes, coding tasks, and mock interview questions. Because the chat is grounded in your own material through RAG, it feels less like generic AI and more like a personal tutor built around what you are actually learning. This positioning borrows the source-grounded clarity of NotebookLM and ChatPDF, the study-asset generation of Quizlet and StudyFetch, and the coaching angle of Khanmigo and Coursera Coach, while pushing harder into developer learning and interview preparation. citeturn27search16turn28search1turn0search19turn33search3turn2search0turn4search2

**Portfolio or résumé description**

Built a full-stack AI learning platform with Next.js, Supabase, pgvector, and retrieval-augmented generation. Users can upload study material, chat with their notes, generate learning roadmaps, flashcards, quizzes, coding tasks, and mock interview questions, while progress and usage limits are tracked through a SaaS-style architecture.

**Recruiter-friendly explanation**

This project demonstrates modern product engineering around AI, not just API calls. It includes file ingestion, vector search, grounded generation, auth, storage, route protection, quotas, and user-facing learning workflows.

**GitHub README description**

SkillForge AI is a full-stack AI learning and interview-prep app that converts uploaded notes, PDFs, and text into roadmaps, flashcards, quizzes, coding tasks, and source-grounded chat using RAG. Built to showcase production-style AI SaaS architecture while helping students and developers learn more effectively.

## Architecture and security

### Architecture recommendation

The cleanest architecture is a **single Next.js App Router application** deployed on Vercel. The UI lives in server and client components under `app/`. API endpoints live in `app/api/*/route.ts` using Route Handlers. Authentication flows through Supabase Auth with SSR-friendly cookie handling via `@supabase/ssr`. User data, learning artifacts, and retrieval metadata live in Supabase Postgres. Raw uploaded files live in Supabase Storage. Embeddings live in Postgres vector columns with `pgvector`. This is fully aligned with the official Next.js App Router, Route Handler, and Supabase SSR guidance. citeturn23search6turn23search0turn23search3turn32search0turn32search3turn32search18turn7search9

A good data model for the MVP is:

- `profiles`
- `documents`
- `document_chunks`
- `roadmaps`
- `roadmap_items`
- `flashcard_decks`
- `flashcards`
- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `interview_sessions`
- `interview_messages`
- `progress_events`
- `usage_events`
- `subscriptions` or a simpler `plans` field on `profiles`

This schema is not from a vendor doc; it is the most practical normalized structure for the workflows you want to show in interviews.

The recommended **RAG flow** is straightforward. A user uploads a file to Storage. The server records metadata in `documents`. A parse step extracts text. The text is chunked with document- and user-level metadata. Each chunk is embedded and stored in `document_chunks`. During chat, the app embeds the query, retrieves top-k chunks filtered by ownership, constructs a grounded prompt, and sends it to the generation provider. The answer stores optional citations back to chunk IDs for later UX. Supabase explicitly documents vectors in Postgres, semantic search patterns, and RAG with permissions, which is exactly the shape you want here. citeturn7search21turn24search12turn7search2turn7search9

Use `proxy.ts` to protect broad route groups such as `/app`, `/dashboard`, and `/admin`, because Next.js Proxy runs before routes render. Keep request-specific logic like CORS and method handling in Route Handlers. Next.js explicitly notes that Proxy executes before routes and that CORS can be configured in Route Handlers for individual routes. citeturn23search13turn23search21turn23search0

For **role-based access**, store a role such as `user` or `admin` in `profiles`, then enforce access with RLS-backed checks and server-only admin queries. Supabase recommends using RLS for application access and notes that you can implement RBAC on top of RLS. For **plan-based access**, store plan metadata and monthly counters in Postgres, optionally backed by Upstash for rate-limiter speed. Protect paid routes at the application layer, but still enforce usage writes and reads with ownership-aware RLS policies. citeturn24search13turn24search0turn6search10

### Security requirements

The non-negotiable rule is to keep **API keys server-side only**. Vercel environment variables are configured outside source code, encrypted at rest, and can be scoped per environment. Use only server-side environment variables for model providers, Resend, Stripe, and service-role Supabase keys. Never expose them through `NEXT_PUBLIC_` variables unless the value is genuinely public. citeturn23search1turn23search15turn23search19

For **authentication and sessions**, use Supabase Auth with SSR cookies. Supabase’s SSR guidance specifically recommends configuring the client to use cookies for server-side rendering, which matches the App Router model. This is the safest way to make authenticated server components and Route Handlers agree on user identity. citeturn32search3turn32search18turn32search0

For **authorization and user ownership**, rely on Row Level Security everywhere user data is stored or referenced. Supabase’s RLS docs explicitly note that `auth.uid()` returns `null` when unauthenticated and that policies should clearly check for authentication. Storage should use RLS-backed access policies too, not just obscured file paths. This is how you prevent one user from reading another user’s documents, chunks, flashcards, or quiz attempts. citeturn24search0turn24search3turn24search9

For **file upload safety**, whitelist MIME types and file extensions, cap file size aggressively, reject suspicious uploads early, and separate original files from parsed text. In the first version, support normal PDFs and plain text only. Defer OCR-heavy scanned documents unless you absolutely need them. That keeps the ingestion pipeline tractable and lowers abuse risk. PyMuPDF and Unstructured are good extraction candidates, but scanned-document OCR should remain out of scope for the MVP. citeturn19search0turn19search6turn19search9

For **AI route protection**, add rate limiting per user and per IP on generation endpoints, especially upload processing, embeddings, roadmap generation, and chat. Upstash is well suited for this, and GitHub-style CI plus lightweight monitoring can help catch regressions before they become cost leaks. citeturn6search10turn6search5turn16search0

For **CORS**, only allow cross-origin requests if you truly need them. MDN defines CORS as a header-based mechanism for permitting origins other than the site’s own origin. In a same-origin Next.js app, most internal API routes do not need permissive CORS at all. If you later expose a public API, set `Access-Control-Allow-Origin` narrowly rather than using `*` with credentials. citeturn23search2turn23search12turn23search16

For **security headers**, set a Content Security Policy, `X-Content-Type-Options: nosniff`, a sane `Referrer-Policy`, and disable the `x-powered-by` header. Next.js documents custom headers and CSP setup, while MDN documents the semantics of CSP, `X-Content-Type-Options`, and `Referrer-Policy`. citeturn32search7turn32search4turn32search2turn32search8turn32search5turn32search19

For **error handling**, never return raw provider errors, SQL errors, or secrets to the client. Log server-side details privately, and return user-safe messages like “Document processing failed” or “Rate limit exceeded.” If you add Sentry, keep personally sensitive file contents out of telemetry. Sentry’s quotas are generous enough for a portfolio project, but disciplined instrumentation matters more than adding every tracing feature immediately. citeturn30search0turn30search1

### Final recommendation

The **recommended MVP feature list** is:

| Build now | Build soon after | Avoid for now |
|---|---|---|
| Auth, uploads, text extraction, chunking, embeddings, RAG chat, roadmap generation, flashcards, quizzes, mock interview mode, simple progress tracking, usage limits | Coding tasks, export, weak-topic detection, better analytics, richer dashboard | OCR-heavy scanned PDFs, complex billing, elaborate admin suite, collaborative workspaces, connectors |

The **recommended final stack** is:

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth + Postgres + Storage + pgvector
- Gemini Developer API for generation and embeddings
- Upstash Redis for rate limiting
- Resend for email
- Stripe test mode for payment UX
- Vercel Hobby for deployment
- Vitest and React Testing Library for tests
- Optional Sentry and PostHog after core flows stabilize

The best **10-day build strategy** is:

| Day | Focus |
|---|---|
| Day one | Project setup, auth, layout, protected routes |
| Day two | Upload flow, Storage integration, document metadata tables |
| Day three | PDF/text extraction and chunking |
| Day four | Embeddings, pgvector table, retrieval query |
| Day five | Source-grounded chat with citations |
| Day six | Roadmap generation and roadmap item persistence |
| Day seven | Flashcard and quiz generation, quiz attempts |
| Day eight | Mock interview mode and coding-task generation |
| Day nine | Progress dashboard, usage limits, export |
| Day ten | Security pass, polish, seed data, tests, README, demo script |

The **biggest risks** are scope explosion, document-processing edge cases, quota surprises, and weak authorization boundaries. The fastest risk reducer is to narrow accepted uploads to text and normal PDFs, keep generation on one provider, enforce RLS early, and avoid background-job fantasies that Hobby hosting does not support elegantly. citeturn26search0turn24search0turn24search3turn13search0

If you need to **reduce scope**, cut in this order: admin dashboard, study calendar, advanced analytics, OCR, payments, then coding-task generation. Keep RAG chat, roadmap, and one study asset generator no matter what. Those are the features that most clearly prove the project’s AI and full-stack value.

What to put in **RESEARCH.md** is the market analysis, feature scoring, free-tier audit, stack rationale, personas, positioning, architecture notes, security checklist, and MVP decision log. What to put in **PRD.md** is the user stories, screens, empty states, success metrics, acceptance criteria, and launch scope. What to put in **DATABASE_SCHEMA.md** is the SQL-oriented schema design, relationships, indexes, RLS policies, and migration order. What to put in **AGENT_RULES.md** is the prompting and runtime behavior for roadmap generation, quiz generation, mock interviews, citation style, safety behavior, and fallback rules when retrieval is weak.

The most interview-effective framing is this: **SkillForge AI is not just a chatbot over PDFs. It is a real AI SaaS app with ingestion, retrieval, grounded generation, progress state, auth, permissions, quotas, and product thinking.** If you build that well, it will teach you genuine full-stack engineering and also give you a serious portfolio project.