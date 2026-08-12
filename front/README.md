# Mockups — BB Platform

Static HTML/JS. No build step, no server, no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server -d front 8080   # then http://localhost:8080
```

A dark demo bar at the top links between all pages. It is mockup chrome only and does not exist in the real site.

## Pages

| File | Represents | Interactive |
|---|---|---|
| `index.html` | Home — 8 sections per spec §2 | — |
| `freelanceri.html` | Audience hub, course grid, chooser table, comparison | — |
| `curs.html` | Course template (Restart în Beauty) | module accordion, FAQ accordion |
| `quiz.html` | Branching quiz + result page | **fully working tree**, back, deep-link, share |
| `podcast.html` | Episode grid | **working tag filter** |
| `gratuitati.html` | Free resources | **working hourly-earnings calculator** |
| `blocks.html` | **Gallery of every interactive block** | all of them, with usage notes |
| `admin.html` | Payload admin sketch | tabs, draggable tree-editor nodes |

## Interactive blocks

`assets/ui.css` + `assets/ui.js` — dependency-free, auto-initialising from `data-*` attributes, idempotent (safe to call `UI.init()` again after rendering new DOM).

| Block | Attribute | What it does |
|---|---|---|
| Curtain reveal | `data-curtain` | Image splits in two and slides apart to expose text + CTAs behind. Click image, click button, or `Esc`. Add `data-curtain-auto` to open on scroll-into-view |
| Carousel | `data-carousel` | Scroll-snap track, arrows, progress dots, mouse drag, touch swipe, arrow keys. Visible count via `--per`, auto-reduces on small screens |
| Expanding panels | `data-panels` | Horizontal panels that expand on hover/focus revealing copy + button; stacks vertically on mobile |
| Before / after | `data-compare` | Draggable comparison slider. Built on `input[type=range]`, so keyboard and screen readers work for free |
| Marquee | `data-marquee="30"` | Auto-duplicating infinite ticker, pauses on hover; value is duration in seconds |
| Counters | `data-count="22"` | Counts up once on scroll-into-view, eased. `data-count-suffix` for `+` or `%` |
| Sticky steps | `data-sticky-steps` | Pinned visual while steps scroll past; active step highlights and swaps the visual label |
| Scroll reveal | `data-reveal` | Fade/slide in on entry. Values: `left`, `right`, `scale`. Siblings auto-stagger |
| Hover utilities | `.zoom` `.lift` `.ul-draw` | Image zoom inside frame, card lift, underline that draws in |

Where they are used: curtain on Home (Featured Program) and Podcast (player), carousel for Home testimonials, marquee under the Home hero, counters in "Despre Lore", before/after on the course page, panels and sticky-steps demoed in `blocks.html`.

Three rules the blocks follow:
- **Reduced motion is respected** — every animation is disabled under `prefers-reduced-motion`, counters jump to their final value, carousels scroll instantly.
- **No-JS degradation** — reveal styles only apply once `ui.js` adds `.ui-js` to `<html>`, so content is never left invisible.
- **Keyboard reachable** — carousels take arrow keys, panels take Enter/Space, the compare slider is a real range input, curtains close on `Esc`.

`assets/tokens.css` is the design system — palette, type scale, and every shared component (buttons, level badges, course card, accordion, testimonial, header, footer). It ports directly into `apps/web/styles/tokens.css` in Phase 2.

`assets/chrome.js` injects the demo bar, site header and footer so the pages stay standalone (`fetch()` of partials is blocked on `file://`).

## Design decisions visible here

- **Sister brand to nailart-studio.ro**: off-white `#FAF8F5`, near-black `#14110F`, warm taupe `#C9BCAE`, generous whitespace, photography-led hero.
- **Own accent**: emerald `#1F5F4E` — 7.8:1 on canvas, signals growth and money rather than consumer beauty.
- **Serif display + sans body** for the denser editorial feel course content needs; system font stacks only, so nothing loads from the network.
- **Wide container**: `--wrap` is 1560px with a fluid `--gutter` (`clamp(1.25rem, 4vw, 4.5rem)`), so large screens don't strand the content in a narrow column. `--edge` exposes the distance from viewport edge to content edge, which lets full-bleed sections line up with everything inside `.wrap`.
- **Full-bleed hero** (`.hero-split`): text aligns to the normal content edge while the image runs to the viewport edge. Add `.hero-split--flip` to mirror it.

## Conventions

- Hatched dashed blocks are **photography placeholders** and state the required crop (4:5, 3:2, 16:9, 1:1). No stock imagery was invented.
- Amber `[TBD]` and `[bracketed]` text marks content the client has not supplied. Left visible deliberately — see PLAN.md §7.
- Emerald-bordered `note` callouts explain a decision or flag a risk to whoever is reviewing. They are commentary, not page content.

## Known-honest gaps

- Only **Restart în Beauty** is a real course; every other card is an explicit placeholder, and the quiz routes unmatched branches to consultanță and free resources instead of faking a catalogue.
- Testimonial names, all prices, module counts and the guarantee window are placeholders.
- Mobile layouts collapse via CSS but have not been tested on real devices.
- `admin.html` is illustration only — Payload generates the real admin from collection definitions.
