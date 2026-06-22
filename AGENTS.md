<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SkillForge AI Source of Truth

The SkillForge docs in `docs/` are the source of truth. Follow this priority when docs or generated guidance conflict:

1. `docs/PRD.md`
2. `docs/PLAN.md`
3. `docs/DATABASE_SCHEMA.md`
4. `docs/DESIGN_SYSTEM.md`
5. `docs/AGENT_RULES.md`
6. `docs/SKILLS.md`

Day 2 work must stay within scaffold and design-system scope. Do not implement Day 3+ logic such as auth, Supabase, proxy or middleware protection, migrations, uploads, API routes, AI/RAG, quizzes, interviews, admin business logic, Stripe, or deployment.

Do not override the Neo-Brutalist Learning System defined in `docs/DESIGN_SYSTEM.md`.
