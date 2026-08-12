# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

No application code yet. The directory holds:

- `docs/Sarcină Tehnică Website BB V2.docx.md` — the Romanian technical specification (22 June 2026), source of truth for site structure and page content.
- `docs/link.md` — the two reference sites: growmysalonbusiness.com (structure/model) and nailart-studio.ro (visual sister brand).
- `PLAN.md` — the agreed implementation plan: Payload CMS 3 + Next.js in Docker, phased, with the content model, container topology and open risks. **Read this before proposing architecture** — the decisions in §1 are settled, and where it disagrees with the spec it says why.
- `front/` — static HTML/JS mockups sharing one design system (`front/assets/tokens.css`). The quiz and the hourly-earnings calculator actually work. See `front/README.md`.

Two facts the spec gets wrong, confirmed live: the production site `beautybusiness.ro` is a **Tilda** one-page webinar funnel charging through **Stripe**, not GetCourse; and the new platform launches on a **subdomain** (name pending client), so every URL below rebases onto `NEXT_PUBLIC_BASE_URL`.

## What the spec describes

beautybusiness.ro — an educational platform for beauty-industry professionals in Romania, Moldova, and the diaspora. Content and UI copy are in Romanian; podcast episodes may be RO and/or RU.

### Core architecture: multi-product hub model

The site is organized around **audience bifurcation**, not around products:

```
/                                       Home — orients, does not sell
/programe/                              Bifurcation page: freelancer or salon owner?
/programe/freelanceri/                  Audience hub — grid of all courses for freelancers
/programe/freelanceri/<slug-curs>/      Individual course page (shared template)
/programe/proprietari-salon/            Audience hub — same structure, different audience
/programe/proprietari-salon/<slug>/     Individual course page (same template)
/mentorat/                              Premium, by-application-only
/podcast/                               Authority channel
/gratuitati/                            Lead-gen entry point (email capture)
/membership/                            Recurring revenue product
/consultanta/                           1:1 sessions
```

The two audience hubs share one page structure, and every course page uses one reusable template (spec §6). **Adding a course must mean adding a card to a hub grid plus one templated page — never a page redesign.** Course cards are standardized: level badge (ENTRY / INTERMEDIAR / AVANSAT, color-coded), title, specific audience, meta-info, one-sentence promise, 3–4 outcome bullets, price, CTA. Preserve this uniformity when editing.

Only one course is fully specified — *Restart în Beauty* (freelancers, intermediate, 6 modules). Everything else in the grids is an intentional placeholder.

### Funnel roles per page

Each page has one job and should not be repurposed:
- **Home** and **/programe/** route visitors; they do not sell.
- **/gratuitati/** captures email before delivering any resource; conversion happens later.
- **/mentorat/** qualifies rather than sells — price is deliberately never public, and the page includes an explicit "not for you if…" section.
- **/consultanta/** is the lower-commitment counterpart to mentorat and links onward to it after 2–3 sessions.

### External integrations

- **GetCourse (getcourse.ro)** — course hosting, login (header "Cont / Login" links out to it), and the CRM that receives every lead-capture form on /gratuitati/ and in the footer newsletter.
- **Calendly or TidyCal** embed — booking on /consultanta/.
- **Spotify / Apple Podcasts / YouTube** — per-episode links; the featured player points at YouTube.
- **Interactive calculator** ("Câștigul tău real pe oră") on /gratuitati/ — inputs: service price RON, duration min, consumables RON, monthly reschedule %; outputs net hourly earnings vs. a benchmark, with optional email-the-result capture into GetCourse.

## Conventions from the spec

- `[TBD]` and `[bracketed text]` mark content the client has not supplied — prices, module counts, guarantee windows, course names. Leave them as visible placeholders; do not invent values.
- Romanian diacritics are used throughout (including in the filename). Keep them.
- Testimonials are specified to carry a concrete number (e.g. "+30% price, zero clients lost"), name, professional type, and city.

## Note

A Gemini CLI config exists at `~/.gemini/settings.json`. To bring over anything importable (MCP servers, slash commands, subagents, skills, instructions), reply `/import` to see a scan, then `/import --yes=<digest>` to apply. If `/import` isn't available on this surface, run `claude import` from a terminal.
