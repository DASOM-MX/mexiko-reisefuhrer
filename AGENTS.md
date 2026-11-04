This is an EmDash site -- a CMS built on Astro with a full admin UI.

## Commands

```bash
npm run dev              # Start the Astro dev server
npx emdash types      # Regenerate TypeScript types from a running site
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

## Key Files

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `astro.config.mjs`       | Astro config with `emdash()` integration, database, and storage                    |
| `src/live.config.ts`     | EmDash loader registration (boilerplate -- don't modify)                           |
| `seed/seed.json`         | Schema definition + demo content (collections, fields, taxonomies, menus, widgets) |
| `emdash-env.d.ts`        | Generated types for collections (auto-regenerated on dev server start)             |
| `src/layouts/Base.astro` | Base layout with EmDash wiring (menus, search, page contributions)                 |
| `src/pages/`             | Astro pages -- all server-rendered                                                 |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** -- Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** -- Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** -- CLI commands for content management, seeding, type generation, and visual editing flow.

## Documentation

The EmDash docs are available as an MCP server at `https://docs.emdashcms.com/mcp`. When you need to verify an API, hook, config option, field type, or pattern, call `search_docs` against the live documentation rather than relying on training-data recall. The docs reflect current behaviour; assumptions may not.

This template ships with `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` so Claude Code, Cursor, and VS Code auto-discover the docs server. Other tools (OpenCode, Windsurf, etc.) need a manual one-time setup -- see [docs.emdashcms.com/docs-mcp](https://docs.emdashcms.com/docs-mcp).

## Rules

- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- When Astro's cache is enabled, pass content-query hints to `Astro.cache.set(cacheHint)`. Use the `WithCacheHint` variants for site settings, menus, taxonomies, and widget areas rendered by cached routes.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"category"` not `"categories"`).

## This Site

Mexiko Reiseführer: the website of a licensed tour guide in Mexico (individual
tours for small groups). German is the default language; English and Spanish
are translations.

### Design

The design is option **3a "Warm editorial"** from the Claude Design project
"Facelift Home". Google Sans Flex throughout, a cream canvas (`--mx-canvas`),
ink text, and a muted terracotta (`--mx-accent`) used only on small details
(step numbers, eyebrows). Brand tokens are the `--mx-*` variables in
`src/styles/theme.css`; the template tokens are mapped onto them so the blog
pages share the palette. Light mode only.

Sections fade in on scroll (images ease from `scale(1.06)`, text rises 18px,
siblings stagger 90ms). The script lives in `src/components/home/HomePage.astro`
and respects `prefers-reduced-motion`.

### i18n

- `astro.config.mjs` → `i18n`: `de` (default, unprefixed), `en` (`/en`), `es` (`/es`).
  Never enable `prefixDefaultLocale`: it breaks `/_emdash/admin`.
- Content is row-per-locale (EmDash translation groups). Always pass
  `{ locale }` to `getEmDashEntry` / `getEmDashCollection` / `getMenu`.
- Theme strings (not content) are in `src/i18n/ui.ts`.
- Per-locale routes are thin files that call a loader in `src/lib/content.ts`
  and render a view component (`HomePage`, `PageView`, `DestinationView`).
  Loaders return `null` → the route does `Astro.rewrite("/404")`
  (rewrites only work in pages, not components).

### Schema (`seed/seed.json`)

| Collection | Purpose | Routes |
| --- | --- | --- |
| `home` | One entry per locale (slug `startseite`) holding every homepage text and image | `/`, `/en/`, `/es/` |
| `destinations` | Sehenswürdigkeiten; `featured` ones show on the homepage, ordered by `sort_order` | `/sehenswuerdigkeiten/{slug}` (+ `/en`, `/es`) |
| `galleries` | Photo albums. The first 3 `photos` are the card's hover previews; ordered by `sort_order` | `/galerie`, `/en/gallery`, `/es/galeria` (+ `/{album}`) |
| `testimonials` | Erfahrungsberichte (not rendered yet) | – |
| `posts` | Blog (template pages, German only so far) | `/posts`, `/posts/{slug}` |
| `pages` | Über mich, Impressum, Datenschutz | `/pages/{slug}` (+ `/en`, `/es`) |

Images, the homepage and destination image lists, flags and ordering are `translatable: false`, so they stay in
sync across languages. Seeded translations do not inherit them, which is why the
seed repeats them in every locale (media is deduplicated by content hash).

### Gallery

- `/galerie` (localized bases in `GALLERY_BASE`, `src/i18n/ui.ts`; build links with
  `galleryPath()`) shows `AlbumCarousel.tsx`, a React island (`motion`) fed plain
  props from `loadGalleryIndex` (contract: `src/components/gallery/types.ts`).
  Intro copy is `home.gallery_page_title` / `gallery_page_text`.
- Album pages (`GalleryView.astro`) have a `<dialog>` lightbox in a plain script.
- The collection's `urlPattern` is `/galerie/{slug}`, so EmDash's sitemap and
  hreflang emit `/en/galerie/…` and `/es/galerie/…`; those routes 301 to the
  localized paths. Keep them.
- `photos` is translatable on purpose: the admin's Translate button copies the
  source entry, so translations start with the same photos and only captions change.

### Contact form

The forms plugin (`@emdash-cms/plugin-forms`) stores submissions and emails
notifications. Forms live in plugin storage, not the seed: run
`scripts/create-contact-forms.mjs` once per environment. The `home` entry's
`contact_form` field holds the form slug (`kontakt-de` / `-en` / `-es`).
Email delivery needs an email provider configured in EmDash.

### Rules

- Every editable word or image belongs in the CMS, not in templates.
- New pages use `Base.astro` and the `--mx-*` tokens. Section padding: 96px
  desktop, `--mx-gutter` sides (16px on phones), max width `--mx-max` (1280px).
- The template's blog pages (`posts`, `category`, `tag`, `search`, `404`) still
  use template classes and English strings. Restyle and localize them, rather
  than copying their structure into new pages.
