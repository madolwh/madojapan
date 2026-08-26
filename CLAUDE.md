# Project: madojapan

## What this is

A static site pairing short Japanese lessons with a flashcard practice layer.
Content originates from short-form video; the site is the permanent, searchable
home for that material.

**The name:** always lowercase — `madojapan`, never "MadoJapan" or "Madojapan".
This applies everywhere: logo, page titles, meta tags, headings, body copy.
Treat the name as a word in its own right. Do **not** build the brand on the
窓 ("window") reading — no 窓 mark, no window or aperture metaphor in the
design, no "a window into Japan" copy. Also never cherry blossoms or torii
gates.

**Audience:** anyone learning Japanese, globally. Written in English.
The distinctive angle is Singlish/Chinese-speaker comparisons — that's the
editorial voice, not a limit on who it's for.

**The site's one job:** a visitor lands on a lesson, understands one thing,
and can immediately drill it as a flashcard.

**Live at:** https://madojapan.pages.dev (Cloudflare Pages, auto-deploys from
`main` on GitHub — `madolwh/madojapan`). No custom domain yet.

## Stack — do not change without asking

- **Astro 7** (static output, `output: 'static'`)
- **Content Collections** with Zod schema for all lessons and vocab
- **Vanilla TS islands** for interactivity — no React, no framework
- **Tailwind 4**, via the `@tailwindcss/vite` plugin (not the deprecated
  `@astrojs/tailwind` integration)
- **Pagefind** for search, indexed at build time after `astro build`
- **No backend, no database, no auth, no user accounts**
- Node 22 (`.nvmrc`), matching the Cloudflare Pages build image

If a task seems to need a server, a database, or a login — stop and flag it.
The answer is almost certainly a different approach.

### Commands

```
npm run dev       # predev subsets fonts first
npm run build     # prebuild subsets fonts, then astro build + pagefind
npm run preview   # serves dist/ — the only way to test search
npm run check     # astro check
npm run fonts     # regenerate the font subset by hand
```

Pagefind only runs in `build`, so **search is dead on the dev server**. Test it
against `npm run preview`. Two launch configs exist in `.claude/launch.json`:
`madojapan-dev` (4321) and `madojapan-preview` (4322).

## File structure

```
src/
  content.config.ts        # both collection schemas — the source of truth
  content/
    lessons/               # one .md per lesson, authored by hand
    vocab/                 # one .md per word or phrase
  layouts/BaseLayout.astro # head, SEO, OG, skip link, header/footer
  components/              # Header.astro, Footer.astro — that's all
  pages/
    index.astro            # home
    lessons/index.astro    # listing + category/level filtering
    lessons/[slug].astro   # the lesson page
    practice.astro         # the flashcard deck — the ONLY interactive route
    research/index.astro   # analysis listing (hand-maintained, see below)
    research/foreign-language-effect.astro
    search.astro           # Pagefind UI
    rss.xml.ts, 404.astro
  styles/global.css        # tokens + every non-Tailwind rule
scripts/
  subset-fonts.mjs         # prebuild/predev: trims @font-face, subsets glyphs
  posters.mjs              # 1080×1350 word posters from real content files
  posters-phrases.mjs      # same, for phrase-shaped lessons
posters/                   # generated HTML; PNGs are gitignored
public/
  audio/                   # hard rule 2 — local audio only
  favicon.svg, robots.txt
```

Generated and gitignored: `public/fonts/`, `src/styles/fonts.css`,
`posters/**/*.png`, `dist/`, `.astro/`. All reproducible — never hand-edit.

**`/research/` pages are `.astro`, not content collection entries**, and
`research/index.astro` lists them from a hand-maintained array. Adding an
analysis means adding it to that array too, or the page ships unreachable —
which has happened once already.

## Content model

Lessons are markdown files. I author these by hand. **Never** invent lesson
content or vocab pairs — if content is missing, scaffold the file with clearly
marked `TODO` placeholders and tell me what to fill in.

Lesson frontmatter schema:

```yaml
title: string
slug: string
summary: string          # one sentence, shown in listings
category: enum           # 'singlish' | 'kanji' | 'slang' | 'philosophy' | 'study' | 'travel' | 'speaking'
level: enum              # 'beginner' | 'intermediate' | 'advanced'
videoUrl: string?        # external link, NOT embedded
audioUrl: string?        # local file in /public/audio
vocab: string[]          # slugs referencing vocab entries
publishedAt: date
draft: boolean
```

Vocab entry schema:

```yaml
term: string             # the Japanese term
reading: string?         # kana reading — omit for whole phrases
romaji: string
meaning: string          # English — the short gloss
description: string?     # the longer telling: what the word feels like
register: enum           # 'casual' | 'polite' | 'slang' | 'formal'
singlishEquivalent: string?
chineseNote: string?     # for kanji-drift entries — the full comparison
chineseMeaning: string?  # a few words: the punchline version, used on posters
```

Rules the schema can't express:

- **`chineseNote` belongs to lesson 01 only.** It is the kanji-drift joke, not
  a field every word fills in.
- **A vocab entry joins the practice deck by being referenced from a published
  lesson.** Orphans stay out. Delete the reference and it leaves the deck.
- **`reference()` validates shape, not existence.** A typo'd slug builds clean
  and resolves to `null`. `[slug].astro` throws on missing references — keep
  that guard.
- **Lesson numbers on the listing are positions, not IDs.** Publishing a new
  lesson renumbers every other one. See the to-do list.

## Hard rules

1. **Video is linked, never embedded.** No iframes, no platform SDKs.
   A styled outbound link on the lesson page. This keeps pages fast and
   keeps the site independent of any platform.
2. **Audio is a local file** in `/public/audio`, played with a native
   `<audio>` element styled minimally. No audio libraries.
3. **Mobile-first.** Most traffic arrives from a phone via a link in bio.
   Design at 375px, then scale up.
4. **No client-side JS on lesson pages** except the audio element.
   Interactivity lives on the flashcard route only.
5. **Japanese text needs proper font stack and `lang="ja"`** on any element
   containing Japanese, for correct glyph rendering and screen readers.
6. **Furigana** uses semantic `<ruby>` markup, not styled spans.

Rule 4 is verified, not assumed: production lesson pages ship **0 script
tags**. Check it after any change that adds interactivity to a lesson.

## Flashcard behaviour

Spaced-repetition style, but **stateless across sessions** (no accounts).

- Session state in memory only; progress resets on reload — that's acceptable
- Flip on click/tap and on spacebar
- After flip: "Got it" / "Again" — "Again" reshuffles the card back into the
  deck later in the same session
- Full keyboard support: space to flip, arrow keys to rate
- Respect `prefers-reduced-motion` — the flip animation must degrade to a
  cross-fade

Do not build a persistent SRS algorithm (SM-2, Anki-style intervals). Without
accounts there is nowhere to store the intervals. If I ask for one, remind me
of this.

**Two flip cards exist, deliberately.** `/practice` is the real deck (TS
island). The demo card inside `six-things-no-tutor` is CSS-only — a
visually-hidden `<input type=checkbox>` plus an adjacent `<label>`, driven by
`.flipcard-toggle:checked + .flipcard-inner`. That keeps rule 4 intact and
gets spacebar for free as native checkbox behaviour. The checkbox must stay
focusable — hide it with `opacity` and size, never `display: none`.

`backface-visibility: hidden` hides a face **visually but not from screen
readers**. `/practice` toggles `aria-hidden` to fix that. CSS alone cannot, so
the demo card's answer stays readable to AT — acceptable there because the
answer is in the surrounding prose anyway.

## Design direction

Locked. Swiss/modernist, type-led, light only — `color-scheme: light`, never
follows the OS dark preference.

**Palette** (Tailwind tokens in `@theme`, `src/styles/global.css`):

| Token     | Hex       | Use                                      |
| --------- | --------- | ---------------------------------------- |
| `paper`   | `#FFFFFF` | background                               |
| `ink`     | `#0A0A0A` | body text                                |
| `muted`   | `#71717A` | secondary text, metadata                 |
| `rule`    | `#E4E4E7` | hairlines, borders, chip outlines        |
| `alert`   | `#D90000` | links, focus rings, poster headers       |
| `marker`  | `#FFEA93` | highlight behind Japanese terms, `<mark>` |
| `tag`     | `#8DB355` | category chips                           |

**Type:** Inter Variable (Latin) + Noto Sans JP Variable (Japanese), both
shipped as webfonts. System stacks were tried and rejected — Apple, Windows
and Android license different fonts, so the same page renders differently on
each. Noto sits in the sans stack too, because Inter has no CJK and Japanese
inside English prose would otherwise drop to a system gothic and stop matching
the hero.

`scripts/subset-fonts.mjs` keeps only the `@font-face` blocks the site's
characters need and glyph-subsets each file: **223KB → 36KB**. It always
includes a Latin baseline, because the search box echoes arbitrary typed input.

**Locked constraints:**

- The brand name is lowercase everywhere. `.brand` uses
  `text-transform: lowercase !important` so it survives being nested inside
  `.display` or any future uppercase utility. Do not remove the `!important`.
- Japanese characters are the visual hero — set large, with real breathing
  room. The type *is* the design.
- Display type scales with `clamp()`, not breakpoint steps — `.display-xl`,
  `.display-lg`.
- Avoid: warm cream + terracotta, cherry-blossom pink.

## Diagrams and motion

Figures are hand-authored SVG inside the markdown, or plain HTML where the
content is really a text layout — the kanji decomposition is flex tiles, not
a drawing, so it reflows like text. Both are fine; pick by what the thing
actually is.

**Portrait first.** Most traffic is a phone. Draw at a ~340-unit viewBox that
fits 335px of usable width, then cap with `max-width` (30rem in prose, 34rem
full-bleed) so desktop scales it up. Nothing gets a `min-width`.

**Animation is CSS only** — hard rule 4 has no exception for motion. The
`.dg-*` utilities in `global.css` cover fade, grow, wipe, drop, liquid fill
and the tracker pop. Conventions worth keeping:

- Every effect declares **two timelines**: a time-based rule that fires on
  load, and an `@supports (animation-timeline: view())` block re-pointing it
  at the element's own scroll position. Scroll-driven is the one that
  matters — otherwise a figure below the fold finishes before the reader
  arrives. It is still not JavaScript: `view()` is a CSS timeline, not a
  scroll listener.
- Under a scroll timeline `animation-delay` does nothing; offsets come from
  `animation-range`. Set both, or the load fallback loses its stagger.
- Stagger past four steps uses an inline `--i` index and `calc()`, not one
  class per step — see the 28-day tracker.
- Use the `cover` phase for long cascades. `entry` is the instant the element
  crosses the viewport edge and is over too fast to read.
- Everything sits inside `@media (prefers-reduced-motion: no-preference)`.
  Motion is opt-in: that query is an explicit preference, not merely the
  absence of `reduce`, so a browser reporting neither stays still.
- Dash-flow offsets must be a whole multiple of the dash period, or the loop
  visibly jumps on restart (`6 5` → period 11 → offset -22).

**After any change here, confirm lesson pages still ship 0 script tags.**

## Traps that have already cost time

- **Blank lines end a raw-HTML block in CommonMark.** An HTML block inside a
  markdown lesson terminates at the first blank line, and everything after it
  gets parsed as markdown — which strips SVG `<text>` tags and leaks stray
  `<p>` siblings. Squeeze blank lines out of embedded HTML. This has bitten
  twice.
- **An unbalanced `</div>` in a lesson silently swallows later sections.** The
  build passes, the page renders, and a third of the content is gone. Verify
  tag balance, and check rendered `<h2>`s rather than trusting a clean build.
- **CSS Grid items default to `min-width: auto`** and won't shrink below their
  content. Wide SVGs expand the track and the page scrolls sideways. Fix goes
  on the grid *item* (`min-w-0`), not the container.
- **Text inside a `viewBox` cannot wrap**, so every label a drawing carries
  sets a floor on how narrow it can go. That floor is what forces landscape
  figures. Move long captions out into HTML and the same chart drops from
  700px to 340. Draw portrait, cap with `max-width`, never with `min-width`.
- **An `overflow-x: auto` wrapper silently becomes a scroll container**, and
  `view()` resolves against the nearest one. Setting overflow on one axis
  forces the other to compute as `auto`, so a horizontal-scroll box is a
  vertical scroll container too. If its scrollport matches its content height
  the timeline has no range, and every animation inside holds its first frame
  **forever** — a fade-in becomes permanently invisible. The build passes and
  a static check looks fine. This is why `.chart-scroll` was deleted. Never
  wrap animated content in an overflow box; check with
  `new ViewTimeline({subject: el}).source` and expect `documentElement`.
- **Never trust one measurement in the browser pane.** A collapsed pane
  (`innerWidth: 0`), a mid-transition `transform` read, or stale dev CSS after
  a rebuild all produce confident nonsense. Re-measure before acting.
- **The browser pane reports `visibilityState: hidden`**, which stops frame
  production: `ViewTimeline.currentTime` is `null` and time-based animations
  freeze at 0. Animation cannot be watched here. Verify it by scrubbing —
  set `animation-timeline: auto` in an injected style, then drive
  `animation.currentTime` by hand and screenshot. Timing and feel still need
  a real device; say so rather than implying they were checked.

## Working style

- Small commits, one feature each. Commit before starting anything risky.
- Run the dev server and check your own output before telling me something works.
- When a task is ambiguous, ask one question rather than guessing and building
  the wrong thing.
- Prefer deleting code over adding flags to it.

## Status

### Done

- Scaffold, schemas, both collections, static build to Cloudflare Pages
- Lesson page: display-size terms, phrase vs word layouts, furigana, marker
- Lessons index with category and level filtering
- `/practice` — working stateless deck, keyboard, reduced-motion
- Pagefind search at `/search`, plus a race-condition fix on fast typing
- SEO: sitemap, RSS, canonical, OG, 404
- Font subsetting; Lighthouse 100s across all pages
- Lesson 01 `kusa` — Japanese words that are insults in Chinese
- Lesson 02 `japanese-philosophy` — 9 words
- Lesson 03 `gyaru-flirting` — 6 phrases
- Lesson `six-things-no-tutor` — the study guide, with diagrams, a working
  CSS-only flip card, and a generated weekly plan + 28-day tracker
- `/research/foreign-language-effect` — 4 figures, sourced numbers
- Poster generators for Instagram carousels (kusa, gyaru)
- Every figure redrawn portrait — no sideways scrolling on a phone
- Scroll-driven CSS animation across both pages: the backlog fills as
  liquid, the tracker builds a day at a time, arrows flow

### Open decisions — mine, waiting on me

- **binjō (便乗) and 他人の飯を食う were left out** of lesson 02. Neither means
  what my source list claimed: 便乗 is bandwagon-jumping, not the sidewalk
  shuffle; 他人の飯を食う is leaving home to learn life's hardships, not
  enjoying someone else's cooking. Decide whether to include with the correct
  meanings or drop them.
- **`foreign-language-effect.md` is still `draft: true`** and duplicates the
  prose on `/research/foreign-language-effect`. Trim it to a pointer, or drop
  the lesson.
- **`level` on `kusa` and `six-things-no-tutor` is a guess**, flagged in the
  frontmatter. Confirm or change.
- **「あーね」って言って去る sits in the practice deck** but it's a punchline,
  not vocabulary. Consider pulling it.

### To build

- **`lessonNumber` in frontmatter.** Listing numbers are currently list
  positions, so publishing renumbers everything. A stable field fixes it.
- Custom domain — when bought, change `site` in `astro.config.mjs` and the
  `Sitemap:` line in `public/robots.txt` **together**; they must agree.
- No audio on any lesson yet; `public/audio/` is empty.
- No `videoUrl` set on any lesson yet.
- Categories `singlish`, `kanji` and `travel` exist in the schema but have no
  lessons.
