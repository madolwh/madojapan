# Build order — one session per step

Each step is a separate Claude Code session. Commit at the end of each.
Do not skip ahead: every step depends on the shape of the one before it.

---

## Session 0 — Setup (30 min)

0. **Before anything:** claim `madojapan` on Instagram, TikTok and YouTube,
   and check `madojapan.com` / `.sg`. Do this today even if the site is
   months away — handles get taken and the brand has to match across all of it.
1. Create the project folder (`madojapan`), `git init`
2. Drop `CLAUDE.md` in the root
3. Prompt: *"Scaffold an Astro project with Tailwind and content collections,
   static output. Nothing else yet — no pages, no styling."*
4. Commit: `chore: scaffold astro project`

**Done when:** `npm run dev` serves a blank page without errors.

---

## Session 1 — Content model (45 min)

The most important session. Get this wrong and everything downstream is painful.

1. Prompt: *"Set up content collections for `lessons` and `vocab` using the
   schemas in CLAUDE.md. Add Zod validation. Create two real sample lessons
   using the content I'm pasting below."*
2. **Paste in real content** — two actual lessons (e.g. sian/だるい and 草).
   Do not let it generate placeholder Japanese.
3. Verify the schema catches a deliberately broken file.

**Done when:** two real lessons exist as markdown and type-check passes.

**Why real content now:** layout decisions made against lorem ipsum fall apart
the moment real Japanese text — which is visually much denser than English —
goes in.

---

## Session 2 — One lesson page (1 hr)

1. Prompt: *"Build the single lesson page template at `/lessons/[slug]`.
   Render title, summary, body, the vocab list, the audio player, and the
   outbound video link. Mobile-first, minimal styling — structure only,
   no design system yet."*
2. Look at it on your actual phone before moving on.

**Done when:** both sample lessons render correctly at 375px wide.

---

## Session 3 — Design pass (1–2 hrs)

Now that real content is on screen, design against it.

1. Prompt: *"Propose 2 distinct design directions for this site — palette as
   4-6 named hex values, two typefaces with reasoning, and a layout concept
   for the lesson page. Show me both before writing any CSS."*
2. Pick one. Then: *"Apply direction [X] to the lesson page only."*
3. Screenshot it. Sit with it a day if you're unsure.

**Done when:** one lesson page looks like something you'd share.

---

## Session 4 — Index and navigation (1 hr)

1. Prompt: *"Build the lessons index with filtering by category and level.
   Client-side filtering, no JS framework. Then the site header and footer."*

**Done when:** you can browse from home → filtered list → a lesson.

---

## Session 5 — Flashcards (2 hrs, the hard one)

1. Prompt: *"Build the flashcard route at `/practice`. Deck is built from the
   vocab collection, filterable by lesson or category. Session state in memory
   only per CLAUDE.md. Full keyboard support, reduced-motion fallback."*
2. Test the keyboard path with the mouse untouched.
3. Test on your phone — tap targets and swipe behaviour.

**Done when:** you can run a 10-card deck start to finish on a phone.

---

## Session 6 — Search (45 min)

1. Prompt: *"Add client-side search across lessons and vocab using Pagefind."*

Pagefind indexes at build time and needs no server — the right fit for a
static site.

**Done when:** searching a Japanese term and its romaji both find the lesson.

---

## Session 7 — Ship (1 hr)

1. Prompt: *"Add SEO meta, Open Graph tags, a sitemap, and an RSS feed.
   Then run a Lighthouse audit and fix anything under 95."*
2. Connect the repo to Cloudflare Pages
3. Point a domain at it

**Done when:** it's live on a real URL.

---

## After launch — the only rule that matters

Adding a lesson must take under 15 minutes: write one markdown file, commit,
push. If it ever takes longer than that, the content model is wrong and that's
the thing to fix — not the design, not the features.

---

## Prompts that waste your time

- *"Build me a Japanese learning website"* — produces something generic you'll
  rebuild anyway
- *"Make it look better"* — no direction, so it defaults to the same look every
  AI produces
- *"Add user accounts so people can save progress"* — this breaks the entire
  no-backend premise. If you genuinely need it later, that's a separate
  architecture conversation, not a feature request.

## Prompts that work

- *"Here's the real content. Build the template around it."*
- *"Propose two directions and show me before you build."*
- *"Run the dev server and check this yourself, then tell me what's broken."*
- *"This file is doing too much. Split it and tell me your reasoning."*
