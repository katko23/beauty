# BB Platform — Implementation Plan

Course platform for beautybusiness.ro: public marketing site + admin board, containerised, with a branching quiz that recommends a course.

Derived from `Sarcină Tehnică Website BB V2.docx.md` and the decisions taken in the planning session. Where this plan and the spec disagree, this plan wins and says why.

---

## 1. Decisions of record

| # | Decision | Choice | Consequence |
|---|---|---|---|
| 1 | Scope | Marketing CMS now; data model shaped so LMS is a phase-2 migration | GetCourse keeps course delivery and student accounts |
| 2 | Stack | Payload CMS 3 (API + admin) + Next.js 15 (public site) + Postgres 16 + Caddy | Schema in TypeScript, git-reviewed |
| 3 | Quiz | Branching decision tree | Precise result copy per path; tree must be rewired per new course |
| 4 | Tree authoring | React Flow visual editor inside Payload admin | Biggest single cost item (~1–2 weeks), maintained by us forever |
| 5 | Lead capture | No gate — full result free, soft email offer after | Fewer leads; compensated with shareable result URL + retargeting |
| 6 | Language | Romanian only, `localized: true` on all text fields, `/ru/` reserved | Russian is later translation work, not a rebuild |
| 7 | Design | Sister brand to nailart-studio.ro | Shared warm-neutral DNA, own accent, denser editorial type |
| 8 | Accent | Emerald `#1F5F4E` on `#FAF8F5` | 7.8:1 contrast, AA/AAA; signals growth, not consumer beauty |
| 9 | Domain | Subdomain, **name pending client** | All URLs built from `NEXT_PUBLIC_BASE_URL`; renaming is a config change |
| 10 | Hosting | One VPS, docker compose, Caddy auto-TLS, nightly `pg_dump` → S3 | ~€10–20/month, portable |
| 11 | v1 | 10 spec pages + quiz + tree editor + calculator + podcast import + mentorat form + Calendly | ~8–12 weeks solo |

---

## 2. Container topology

```
                    ┌─────────────────────────────┐
   :443 ───────────►│ caddy      auto-TLS, proxy  │
                    └──────┬───────────────┬──────┘
                           │               │
              /*           │               │  /admin/*, /api/*
                    ┌──────▼──────┐ ┌──────▼────────────────┐
                    │ web         │ │ api                   │
                    │ Next.js 15  │ │ Payload 3             │
                    │ SSG + ISR   │ │ admin UI + REST/GQL   │
                    │ :3000       │ │ :3001                 │
                    └──────┬──────┘ └──────┬────────────────┘
                           │ fetch         │
                           └───────┬───────┘
                                   │
                            ┌──────▼──────┐    ┌──────────────┐
                            │ db          │    │ backup       │
                            │ Postgres 16 │───►│ nightly dump │
                            └─────────────┘    │ → S3/R2      │
                                               └──────────────┘
```

Two application images as requested: `bb-api` and `bb-web`. Media uploads go to S3-compatible storage (Hetzner Object Storage or Cloudflare R2) via `@payloadcms/storage-s3`, **not** a container volume — otherwise a redeploy loses every image Lore uploaded.

### `docker-compose.yml` (production shape)

```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on: [web, api]
    restart: unless-stopped

  web:
    image: ghcr.io/OWNER/bb-web:${TAG:-latest}
    environment:
      NEXT_PUBLIC_BASE_URL: ${BASE_URL}
      PAYLOAD_API_URL: http://api:3001
      PAYLOAD_API_TOKEN: ${PAYLOAD_API_TOKEN}
      REVALIDATE_SECRET: ${REVALIDATE_SECRET}
    depends_on: [api]
    restart: unless-stopped

  api:
    image: ghcr.io/OWNER/bb-api:${TAG:-latest}
    environment:
      DATABASE_URI: postgres://bb:${DB_PASSWORD}@db:5432/bb
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      S3_BUCKET: ${S3_BUCKET}
      S3_ENDPOINT: ${S3_ENDPOINT}
      S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID}
      S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY}
      WEB_REVALIDATE_URL: http://web:3000/api/revalidate
      REVALIDATE_SECRET: ${REVALIDATE_SECRET}
      GETCOURSE_ACCOUNT: ${GETCOURSE_ACCOUNT}
      GETCOURSE_API_KEY: ${GETCOURSE_API_KEY}
      YOUTUBE_API_KEY: ${YOUTUBE_API_KEY}
    depends_on:
      db: { condition: service_healthy }
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: bb
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: bb
    volumes: [pg_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bb"]
      interval: 10s
      retries: 5
    restart: unless-stopped

  backup:
    image: offen/docker-volume-backup:v2
    environment:
      BACKUP_CRON_EXPRESSION: "0 3 * * *"
      AWS_S3_BUCKET_NAME: ${BACKUP_BUCKET}
      AWS_ENDPOINT: ${S3_ENDPOINT}
      AWS_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY}
    volumes:
      - pg_data:/backup/pg_data:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped

volumes: { pg_data: {}, caddy_data: {} }
```

`docker-compose.dev.yml` overrides both app services to bind-mount source and run `next dev` / `payload dev` with hot reload.

### Repo layout

```
bb-platform/
├── apps/
│   ├── api/                  # Payload — its own Dockerfile
│   │   ├── src/collections/
│   │   ├── src/globals/
│   │   ├── src/admin/components/QuizTreeEditor/
│   │   ├── src/endpoints/
│   │   └── src/jobs/
│   └── web/                  # Next.js — its own Dockerfile
│       ├── app/(site)/
│       ├── components/
│       └── styles/tokens.css
├── packages/types/           # generated Payload types, shared
├── front/                    # static mockups (this deliverable)
├── docker-compose.yml
├── docker-compose.dev.yml
├── Caddyfile
└── .github/workflows/deploy.yml
```

---

## 3. Content model

Collections in `apps/api/src/collections/`. Every user-facing text field carries `localized: true` from day one.

```
Courses            slug, title, audience(freelancer|salon), level(entry|intermediate|advanced),
                   forWho, metaInfo[], promise, outcomes[], modules[{title,body,exercise}],
                   priceLabel, installmentsLabel, enrollUrl, badge, methodology,
                   testimonials→, quizTags[], status(draft|published|upcoming), order, seo

AudienceHubs       audience, heroHeadline, heroSub, heroBadge, isForYouIf[],
                   chooserRows[{statement, course→}], comparisonEnabled, seo

Pages              slug, title, blocks[] (Hero, ProblemStatement, ThreeCards, SocialProof,
                   FeaturedProgram, PodcastTeaser, AboutLore, CtaFinal, RichText, Faq)

Episodes           number, title, slug, durationSec, summary, publishedAt, tags[],
                   youtubeId, spotifyUrl, appleUrl, thumbnail, source(manual|youtube|rss),
                   externalId  ← unique, dedupes the importer

FreeResources      title, type(webinar|pdf|calculator|audio), description, deliveryUrl,
                   file, requiresEmail, getcourseGroup, seo

Testimonials       name, role(freelancer|salon), city, quote, metric, photo, courses→[]

QuizNodes          key, question, helpText, options[{label, icon, next→QuizNode | course→Course
                   | outcome(consultanta|resources)}], isStart

QuizResults        course→, personaTitle, personaBody, plan30days[], ctaLabel, ctaUrl

Leads              email, firstName, source(newsletter|quiz|calculator|resource|mentorat),
                   payload(jsonb), consentText, consentAt, ip, userAgent,
                   getcourseSyncedAt, getcourseError

Applications       mentorat form submissions — businessContext, goals, blockers, revenue,
                   consent fields, status(new|reviewed|call|accepted|declined)

Globals            Nav, Footer, SiteSettings (analytics IDs, calendly URL, social links)
```

Two things worth defending:

- **`enrollUrl` is per-course content, not code.** The spec says GetCourse; the live Tilda page charges through Stripe. Until that is resolved, each course carries its own checkout link and the ambiguity costs nothing.
- **`Leads` is stored locally *and* pushed to GetCourse.** GDPR export/delete requests need a local record, and if GetCourse is ever replaced you keep the list. `getcourseSyncedAt` makes failed pushes retryable instead of silently lost.

### Phase-2 LMS hooks

`Courses.modules` is already a structured array rather than rich text, so lessons attach to modules later. Adding `Enrollments`, `Lessons`, `Progress` in phase 2 does not touch anything built in phase 1.

---

## 4. URL map

All paths are relative to `NEXT_PUBLIC_BASE_URL` (subdomain pending client decision).

| Path | Source | Rendering |
|---|---|---|
| `/` | Pages(home) | SSG + ISR |
| `/programe/` | Pages(programe) | SSG |
| `/programe/[audienta]/` | AudienceHubs | SSG |
| `/programe/[audienta]/[slug]/` | Courses | SSG + ISR |
| `/mentorat/` | Pages | SSG, form is dynamic |
| `/podcast/` | Episodes | ISR 1h |
| `/podcast/[slug]/` | Episodes | SSG |
| `/gratuitati/` | FreeResources | SSG |
| `/membership/` | Pages | SSG |
| `/consultanta/` | Pages | SSG |
| `/quiz/` | QuizNodes | SSG tree + client routing |
| `/quiz/rezultat/[key]/` | QuizResults | SSG, shareable, OG image |
| `/legal/{confidentialitate,termeni,cookies}` | Pages | SSG |

Publishing in Payload fires an `afterChange` hook → `POST /api/revalidate` on `web` → targeted ISR revalidation. Editors see changes live without a redeploy.

---

## 5. Phases

Each phase ends in something demoable. Estimates are working days, solo.

### Phase 0 — Foundations (3–4d)
Monorepo, both Dockerfiles (multi-stage, non-root, `output: standalone` for Next), compose dev + prod, Caddyfile, Postgres, GitHub Actions building both images to GHCR, deploy script (`ssh → compose pull → up -d`).
**Done when:** `docker compose up` gives a running Payload admin and a Next.js page on one host, and a git push redeploys them.

### Phase 1 — Content model (4–5d)
All collections and globals above, roles (`admin`, `editor`), S3 media adapter with image sizes, localization enabled, seed script with Restart în Beauty and 6 testimonials from the spec.
**Done when:** Lore can log in and create a course, and it appears in the API.

### Phase 2 — Design system + core three pages (7–9d)
Port `front/assets/tokens.css` into `apps/web`, build the shared components (Header, Footer, Button, LevelBadge, CourseCard, Section, PhotoFrame, Accordion, TestimonialCard), then Home, Hub Freelanceri, and the course template.
**Done when:** the three mockups exist as real, CMS-driven, responsive pages.

### Phase 3 — Remaining pages (5–6d)
Hub Programe (bifurcation), Hub Proprietari Salon (reuses Phase 2 hub), Membership, Podcast grid + episode page, Gratuități, legal pages, Nav/Footer globals.
**Done when:** every URL in §4 resolves from CMS content.

### Phase 4 — Leads, GetCourse, GDPR (4–5d)
Form endpoint with rate limiting and honeypot, `Leads` collection, GetCourse API push with retry, transactional email (Resend/Postmark), cookie consent banner gating analytics, privacy policy content, per-lead export and delete endpoints.
**Done when:** a footer newsletter signup lands in Payload *and* GetCourse, and can be deleted on request.

### Phase 5 — Quiz runtime (5–6d)
Tree fetched at build, traversal in client state, progress bar, back navigation, deep-linkable path in the URL, result page with persona + course card + 30-day plan + soft email offer, per-result OG image for sharing, unmatched branches routed to `/consultanta/` and free resources.
**Done when:** the quiz runs end to end on CMS-authored nodes and the result is a shareable URL.

### Phase 6 — Visual tree editor (8–12d) ⚠ largest item
React Flow canvas mounted as a Payload custom view: nodes for questions/courses/outcomes, drag to connect, inline question editing, autosave, and a validator that blocks save on cycles, orphans, dead ends, and edges into unpublished courses. Plus a "play the tree" preview drawer.
**Done when:** Lore rewires the quiz without a developer and cannot save a broken tree.
*Cut line: not load-bearing for launch. If time pressure appears, ship Phase 5 with nodes edited as ordinary Payload documents and land this after.*

### Phase 7 — Podcast auto-import (3–4d)
Scheduled job pulling the YouTube uploads playlist and/or Spotify RSS, upserting `Episodes` on `externalId`, never overwriting editor-authored `summary`/`tags`, with an import log and manual "sync now" button.
**Done when:** a new YouTube episode appears on `/podcast/` within the hour with no manual entry.

### Phase 8 — Calculator + free resources (3–4d)
"Câștigul tău real pe oră" as an interactive island (fields, benchmark comparison, verdict copy, optional email-me-the-result → Leads → GetCourse), plus the resource cards and their delivery flows.
**Done when:** the calculator matches the mockup and its email path creates a GetCourse contact.

### Phase 9 — SEO, analytics, launch (3–4d)
Metadata per collection, `sitemap.xml`, `robots.txt`, canonicals off `BASE_URL`, JSON-LD (`Course`, `PodcastEpisode`, `Organization`), OG images, Plausible or GA4 + Meta pixel behind consent, Lighthouse pass, DNS cutover on the chosen subdomain, backup restore rehearsal.
**Done when:** a restore from S3 has actually been tested, not assumed.

**Total: 45–59 working days.** Roughly 9–12 weeks solo, excluding client content turnaround.

---

## 6. Risks

1. **Checkout destination unresolved.** Spec says GetCourse; production charges via Stripe on Tilda. Mitigated by per-course `enrollUrl`, but a real answer is needed before Phase 2 ships copy.
2. **One real course.** Both grids and most of the tree are placeholders. The quiz is built to route unmatched branches to consultanță and free resources rather than fake a catalogue — but the feature only earns its cost once there are 3+ courses.
3. **Every price is `[TBD]`.** Course, membership, consultanță packages, mentorship. Blocks Phase 2 and Phase 3 sign-off, not development.
4. **No photography.** The design is photo-led. Mockups mark exact crops and aspect ratios; a shoot or licensed library is a client dependency.
5. **No email gate + subdomain split.** Deliberate choices that together reduce lead volume and divide SEO authority. Compensations: shareable result URLs, retargeting pixel, strict canonicals, and `BASE_URL` built so moving to the root later is config plus a 301 map.
6. **Tree editor is custom code we own forever.** React Flow inside Payload's admin is not a supported integration path; Payload major upgrades may break it.
7. **GDPR is real work.** Consent text stored per lead, cookie banner gating analytics, export/delete. Not a checkbox at the end.

---

## 7. Client dependencies

Nothing below can be produced by development:

- Subdomain choice, DNS access, and confirmation of whether the root eventually migrates
- Where course payments land (GetCourse vs Stripe) and the live checkout links
- All prices, module counts, guarantee window, mentorship capacity
- Photography of Lore, salons, and students
- Real testimonials with names, cities, and permission to publish
- Final copy for every `[TBD]` and `[bracketed]` field in the spec
- GetCourse API credentials, YouTube channel ID / podcast RSS, Calendly or TidyCal account

---

## 8. Mockups

`front/` holds standalone HTML/JS mockups sharing one design system, openable directly in a browser with no build step. See `front/README.md`.
