# Row-based detail pages for projects & hobbies

## Problem

Project and hobby cards on the homepage are summaries only — there's no way to click through to a fuller writeup. The site owner (non-developer) needs a way to add a "real page" for a project or hobby: a title, and a flexible sequence of image/text rows, editable by hand-editing plain data files without touching JSX or React.

## Goals

- Dedicated, shareable static pages: `/projets/<slug>` and `/passions/<slug>`, built at export time (site is `output: 'export'` for GitHub Pages — no server, so all pages must be pre-rendered via `generateStaticParams`).
- A row/column content schema simple enough to hand-edit: rows contain columns; a column is either an image or a text block; widths are percentages; leftover width is split automatically; overflowing widths wrap to a new visual line for free via CSS.
- Text columns support: an optional subtitle, paragraphs, bullet lists, and inline `**bold**` / `[label](url)` markup — via a small custom parser, no new dependency.
- Cards opt in via a `slug` field (same pattern as the `image` field added earlier to project cards). A card with a `slug` becomes a clickable link to its detail page and its existing (currently inert) hover arrow icon becomes meaningful. A card without a `slug` renders exactly as it does today.
- Two example pages, one per content type, to prove the system and serve as copy-paste templates:
  - Project: **Montage Vidéo** → `/projets/montage-video`
  - Hobby: **Musique** → `/passions/musique`

## Non-goals

- No markdown library, no CMS/admin UI, no WYSIWYG editor.
- No modal/lightbox variant — dedicated pages only.
- No change to the summary card layout/content beyond adding the optional `slug` field.

## Data schema

```ts
type DetailPage = {
  title: string
  rows: Row[]
}

type Row = {
  /** Row's own width, as % of the page content area, centered. Default 100. */
  width?: number
  columns: Column[]
}

type Column =
  | { image: string; alt?: string; width?: number }
  | { text: TextBlock[]; width?: number }
// width: % of the row. Columns without a width split the leftover space evenly.

type TextBlock =
  | { subtitle: string }
  | { paragraph: string } // inline **bold** and [label](url) supported
  | { list: string[] }    // each item also supports **bold** and [label](url)
```

Width resolution (pure function, computed at render time):
1. Sum the explicit `width` values in a row's columns → `used`.
2. `remaining = max(0, 100 - used)`, split evenly across columns with no explicit `width`.
3. Each column is rendered with that computed width as a CSS flex-basis, `flex-grow: 0`, `flex-shrink: 0`, inside a `flex flex-wrap` row container.
4. If declared widths sum over 100% (e.g. two columns at 60%), the second simply doesn't fit on the line and CSS wraps it to a new line by itself — this is the "ghost row" behavior, achieved with zero extra data or logic.

## Rendering

- `components/detail-page.tsx`: shared renderer — `<DetailPageContent page={DetailPage} />`, maps rows → columns → block renderers.
- `lib/rich-text.tsx`: the inline parser (`**bold**`, `[label](url)`) plus block components for subtitle/paragraph/list.
- Row images render as plain `<img>` (not `next/image`) since `images.unoptimized: true` is already set for static export — this avoids forcing a crop and preserves each image's natural aspect ratio, appropriate for full illustrative photos (unlike the fixed 2:1 thumbnails on summary cards).
- Detail pages reuse the existing `Navbar` and `Footer`, plus a "back to portfolio" link to the relevant homepage anchor (`/#projets` or `/#passions`).

## Routing

- `content/projets.ts` and `content/passions.ts`: each exports `Record<slug, DetailPage>`, with a short comment block at the top of the file documenting the schema inline (so the non-dev owner sees the cheat-sheet right where they're editing).
- `app/projets/[slug]/page.tsx` and `app/passions/[slug]/page.tsx`: look up the slug in the corresponding content record, call `generateStaticParams()` to enumerate all slugs for the static export, render 404-ish fallback (`notFound()`) for unknown slugs.

## Card linking

- `components/projects-section.tsx` and `components/hobbies-section.tsx`: add optional `slug?: string` to each item's type.
- When present, wrap the `Card` in a `next/link` `<Link>` to `/projets/${slug}` or `/passions/${slug}`; the existing `group` hover styling (and the currently-inert `ExternalLink` icon on project cards) applies automatically since it's already keyed off `.group`.
- When absent, render the `Card` exactly as today — unwrapped, no link, no behavior change.
- Wire `slug: "montage-video"` onto the existing "Montage Vidéo" project and `slug: "musique"` onto the existing "Musique" hobby, since those are the two examples.

## Testing / verification

- `npm run build` must succeed (confirms `generateStaticParams` produces valid static output for both new routes).
- Manual check via local dev server + Playwright screenshot: homepage cards for Montage Vidéo and Musique are clickable and navigate to their detail pages; other cards (no `slug`) are unchanged; both detail pages render correctly at desktop and mobile widths, including a row that intentionally overflows 100% to confirm the wrap/"ghost row" behavior.
