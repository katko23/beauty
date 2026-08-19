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
| `directii.html` | **The six complete design directions** | live scaled previews of each real page |
| `design-1…6.html` | One full Home per direction — a different layout each | the blocks each direction uses |
| `design-6-podcast.html` | **Podcast page in the growmysalonbusiness shape** — a chronological directory, not a card grid | search, tag filter, progressive paging |
| `teme.html` | The five palettes, side by side | live preview per palette |
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

## Design directions

Two different things live here, and it matters which one you're looking at.

### `directii.html` — six complete designs

Six separate Home pages. Not one layout recoloured: the **blocks move**. Each page has its own header shape, hero composition, section order and choice of interactive blocks. The content is identical across all of them on purpose, so the client compares design and not copy.

| | Direction | Palette + style | What is structurally different |
|---|---|---|---|
| `design-1.html` | **Editorial** | smarald · serif | Sticky horizontal nav, full-bleed split hero, proof ticker, featured programme behind a curtain reveal, 3-up card grid, testimonial carousel |
| `design-2.html` | **Swiss** | bleumarin · grotesk | Two-row hairline nav, **no photograph above the fold**, 4-column data band, the catalogue **as a table instead of cards**, sticky-steps method, quotes on rules |
| `design-3.html` | **Soft** | teracotă · rounded | Floating pill nav, centred hero with the visual *below* the copy, expanding panels, card carousel, the calculator in-page, FAQ accordion, light footer |
| `design-4.html` | **Couture** | prună · minimal | Centred logo with nav underneath, full-bleed image hero with the headline over it, **no cards anywhere** — the catalogue is a typographic index; mentorat qualifies instead of selling |
| `design-5.html` | **Bold** | noir · heavy | Boxed logo, headline owns the full width with the image underneath as an offset block, the problem as three oversized numbered panels, 2-up cards with hard shadows, poster quote |
| `design-6.html` | **Client Dream** | pastel · outline | The direction assembled from the client's own picks — see below. Half/half hero, yellow numbers band, the four adopted blocks, plus its own podcast page |

A dark bar at the top of each switches between them. It is mockup chrome and disappears under `?preview=1`, which is how the hub renders its thumbnails.

### The two axes underneath

The five designs are built from two independent token layers, and either can be applied to the *rest* of the mockup (course page, hub, quiz, podcast, free resources) without touching markup:

- **`assets/themes.css` — colour only** (`data-theme`): `smarald`, `teracota`, `pruna`, `bleumarin`, `noir`, `pastel`. Nothing but palette tokens, so a palette can be judged on colour alone. `teme.html` shows them side by side.
- **`assets/styles.css` — everything else** (`data-style`): `editorial`, `swiss`, `soft`, `couture`, `bold`, `dream`. Type pairing, corner radius, how a card is delimited, button shape, section density.

The switcher at the bottom right of every standard page sets both. The choice persists in `localStorage` and can be forced from the URL: `curs.html?theme=pruna&style=couture`.

`assets/theme.js` is the single registry — id, swatches, rationale, structural notes, paired page — and it runs in `<head>` so both attributes are set before first paint (no flash of the wrong design). `directii.html` and `teme.html` are both generated from it, so their spec tables can't drift from what the pages actually are.

`noir` is the only palette that inverts value, so it carries a handful of extra rules for components that hard-code "light text on dark" (`.ftr`, `.mockbar`, `.section--ink`, `.btn--onDark`). Everything else is pure token substitution.

Adding a palette or style = one object in `theme.js` + one block in the matching CSS file. No page edits.

### Direction 06 — Client Dream

The only direction that is not our proposal. It is assembled from what the client reacted to across the first five, so every choice in it is traceable to a piece of their feedback:

| Their words | What it became |
|---|---|
| "same colours as teracota, but pastel — white and creme" | `data-theme="pastel"`: canvas goes to pure white, the clay family stays, section bands become cream `#FBF2E8` |
| "a bit yellow, for contrast" | `--zest` / `--zest-wash` / `--zest-deep`. Used as a band, a rule and a highlighter (`.mark`) — **never as text on white**, where it has no contrast |
| "text on white background, black text" | body copy is `#131010` on `#FFFFFF` everywhere; colour is carried by the bands, never by the paragraph |
| "Serif contrast, 400" + "buttons: outline only, tracking .22em" | lifted from 04 Couture |
| "cards are ok with: no border, diffuse shadow" | lifted from 03 Soft |
| "corners should be 0" | `--radius: 0` — and explicitly also on the round controls the blocks ship with (carousel arrows, dots, tags). Portraits stay round |
| "we loved *Patru feluri în care poți lucra cu noi*" | kept verbatim, expanding panels |
| "*Programe pentru fiecare etapă*", "*Câștigul tău real pe oră*" | kept; the calculator is **live here**, same formula as `gratuitati.html` so the numbers agree |
| "*Aceeași agendă, alt rezultat* — half of the page is good" | compare slider on one half, the argument on the other (`.split6`) |
| "for the podcast, something like growmysalonbusiness.com/podcast" | `design-6-podcast.html` — see below |

**Why the podcast page is a list, not a grid.** Our earlier `podcast.html` is a card grid with a thumbnail per episode. The reference site runs a chronological *directory* — number, guest, title, one "Listen Now" link per row — because a catalogue of 300+ episodes is scanned vertically, not browsed as a gallery, and because a grid demands artwork for every episode. `design-6-podcast.html` follows the reference order: hero → subscribe (platform row + first-name/email capture) → Apple Podcasts reviews → the directory, with search, tag filter and progressive paging.

The direction reuses the shared blocks and tokens like any other, so applying it to the rest of the mockup is still just `index.html?theme=pastel&style=dream`.

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
