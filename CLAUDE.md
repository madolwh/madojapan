# Project: madojapan

## What this is

A static site pairing short Japanese lessons with a flashcard practice layer.
Content originates from short-form video; the site is the permanent, searchable
home for that material.

**The name:** always lowercase — `madojapan`, never "MadoJapan" or "Madojapan".
This applies everywhere: logo, page titles, meta tags, headings, body copy.
窓 (mado) means "window" in Japanese, so madojapan = a window into Japan.
The kanji 窓 is available as a mark if the design calls for one — but use it
with restraint, and never alongside cherry blossoms or torii gates.

**Audience:** anyone learning Japanese, globally. Written in English.
The distinctive angle is Singlish/Chinese-speaker comparisons — that's the
editorial voice, not a limit on who it's for.

**The site's one job:** a visitor lands on a lesson, understands one thing,
and can immediately drill it as a flashcard.

## Stack — do not change without asking

- **Astro** (static output, `output: 'static'`)
- **Content Collections** with Zod schema for all lessons and vocab
- **Vanilla TS islands** for interactivity — no React, no framework
- **Tailwind** for styling
- **No backend, no database, no auth, no user accounts**
- Deploy target: Cloudflare Pages

If a task seems to need a server, a database, or a login — stop and flag it.
The answer is almost certainly a different approach.

## Content model

Lessons are markdown files. I author these by hand. **Never** invent lesson
content or vocab pairs — if content is missing, scaffold the file with clearly
marked `TODO` placeholders and tell me what to fill in.

```
src/content/
  lessons/          # one .md per lesson
  vocab/            # one .md per word (or a single .json per lesson group)
```

Lesson frontmatter schema:

```yaml
title: string
slug: string
summary: string          # one sentence, shown in listings
category: enum           # 'singlish' | 'kanji' | 'travel' | 'speaking'
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
reading: string          # kana reading
romaji: string
meaning: string          # English
register: enum           # 'casual' | 'polite' | 'slang' | 'formal'
singlishEquivalent: string?
chineseNote: string?     # for kanji-drift entries
```

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

## Design direction

Not yet locked. When building UI, propose a small token set (4-6 hex values,
2 typefaces) and get approval before applying it site-wide. Avoid: warm cream
backgrounds with a terracotta accent, and cherry-blossom-pink "Japan" clichés.

Constraints that are locked:
- The brand name is set lowercase everywhere. Do not let a CSS
  `text-transform: capitalize` or a title-case utility override it.
- Japanese characters are the visual hero — set them large, with real breathing
  room. The type *is* the design.
- The English body face and the Japanese face must be paired deliberately, not
  left to a fallback.

## Working style

- Small commits, one feature each. Commit before starting anything risky.
- Run the dev server and check your own output before telling me something works.
- When a task is ambiguous, ask one question rather than guessing and building
  the wrong thing.
- Prefer deleting code over adding flags to it.
