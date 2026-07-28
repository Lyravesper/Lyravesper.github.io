# Row-based detail pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dedicated, static, hand-editable detail pages for projects and hobbies (`/projets/<slug>`, `/passions/<slug>`), built from a row/column content schema, with two example pages (Montage Vidéo, Musique) and clickable cards linking to them.

**Architecture:** Content lives as plain typed data objects (`content/projets.ts`, `content/passions.ts`); a shared renderer (`components/detail-page.tsx` + `lib/rich-text.tsx`) turns that data into HTML; two `[slug]` dynamic routes pre-render every entry via `generateStaticParams` (required — the site has no server, `next.config.mjs` sets `output: 'export'`). Cards opt in to linking via an optional `slug` field, same pattern as the `image` field added earlier.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4. No new dependencies.

## Global Constraints

- Site is statically exported (`output: 'export'` in `next.config.mjs`) — every route must be enumerable at build time via `generateStaticParams`. No server-only APIs (no `cookies()`, `headers()`, API routes).
- `images.unoptimized: true` is already set — do not use `next/image` for content authored by the row/column schema; plain `<img>` is correct and simpler here (see Task 3).
- No new npm dependencies. The inline `**bold**` / `[label](url)` parser is hand-written (~30 lines), not a library.
- TypeScript build errors don't block `next build` (`ignoreBuildErrors: true`), but write correct types anyway — that flag is a safety net, not a license to skip typing.
- Tailwind's preflight sets `box-sizing: border-box` globally — column width math in Task 3 relies on this.
- Do not run `git commit` during implementation. This repository has no commits yet and the user has not asked for any — leave all changes staged/unstaged for the user to review and commit themselves.
- Verification in this codebase means: `npm run build` succeeds, plus manual checks via the dev server (curl for reachability, Playwright for visual/behavioral checks) — there is no unit test runner installed, and adding one is out of scope.
- French copy throughout (site language is `fr`); match the existing tone in `components/projects-section.tsx` / `hobbies-section.tsx`.

---

### Task 1: Content types and column-width resolver

**Files:**
- Create: `lib/detail-content.ts`

**Interfaces:**
- Produces: `type TextBlock`, `type Column`, `type Row`, `type DetailPage`, `function resolveColumnWidths(columns: Column[]): number[]` — used by Task 3.

- [ ] **Step 1: Write the file**

```ts
export type TextBlock =
  | { subtitle: string }
  | { paragraph: string }
  | { list: string[] }

export type Column =
  | { image: string; alt?: string; width?: number }
  | { text: TextBlock[]; width?: number }

export type Row = {
  /** Row's own width, as % of the page content area, centered. Default 100. */
  width?: number
  columns: Column[]
}

export type DetailPage = {
  title: string
  rows: Row[]
}

/**
 * Resolves each column's effective width as a percentage. Columns with an
 * explicit `width` keep it. Columns without one split whatever's left
 * evenly. If the explicit widths alone already exceed 100, the leftover
 * is 0 and width-less columns get 0 (there normally aren't any in that
 * case — see content files for the intended way to force a wrap: give
 * every column in the row an explicit width whose sum exceeds 100).
 */
export function resolveColumnWidths(columns: Column[]): number[] {
  const used = columns.reduce((sum, c) => sum + (c.width ?? 0), 0)
  const undefinedCount = columns.filter((c) => c.width === undefined).length
  const remaining = Math.max(0, 100 - used)
  const share = undefinedCount > 0 ? remaining / undefinedCount : 0
  return columns.map((c) => c.width ?? share)
}
```

- [ ] **Step 2: Verify the resolver with a throwaway script**

Create a scratch file (outside the repo, e.g. in the OS temp dir) with plain JS duplicating just the function body, so it can run with no TS toolchain:

```js
function resolveColumnWidths(columns) {
  const used = columns.reduce((sum, c) => sum + (c.width ?? 0), 0)
  const undefinedCount = columns.filter((c) => c.width === undefined).length
  const remaining = Math.max(0, 100 - used)
  const share = undefinedCount > 0 ? remaining / undefinedCount : 0
  return columns.map((c) => c.width ?? share)
}

console.log(resolveColumnWidths([{ width: 30 }, {}]))            // expect [30, 70]
console.log(resolveColumnWidths([{ width: 60 }, { width: 60 }])) // expect [60, 60]
console.log(resolveColumnWidths([{}, {}]))                       // expect [50, 50]
console.log(resolveColumnWidths([{ width: 45 }, {}, {}]))        // expect [45, 27.5, 27.5]
```

Run: `node <scratch-file-path>`
Expected: the four printed arrays match the `expect` comments exactly. Delete the scratch file afterward.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/detail-content.ts`.

---

### Task 2: Inline rich-text parser and block renderers

**Files:**
- Create: `lib/rich-text.tsx`

**Interfaces:**
- Consumes: `TextBlock` from `lib/detail-content.ts` (Task 1).
- Produces: `function TextBlocks({ blocks }: { blocks: TextBlock[] }): JSX.Element` — used by Task 3.

- [ ] **Step 1: Write the file**

```tsx
import type { ReactNode } from "react"
import type { TextBlock } from "@/lib/detail-content"

/**
 * Parses "**bold**" and "[label](url)" inside a plain string into React
 * nodes. Anything else passes through as plain text. This is intentionally
 * tiny — it covers exactly the two markers content authors are told about,
 * nothing more.
 */
function renderInline(text: string): ReactNode[] {
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>)
    } else {
      const href = match[3]
      const isExternal = href.startsWith("http")
      nodes.push(
        <a
          key={key++}
          href={href}
          className="text-primary underline underline-offset-2 hover:opacity-80"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {match[2]}
        </a>
      )
    }
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }
  return nodes
}

export function TextBlocks({ blocks }: { blocks: TextBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if ("subtitle" in block) {
          return (
            <h3 key={i} className="text-lg font-semibold text-foreground">
              {block.subtitle}
            </h3>
          )
        }
        if ("paragraph" in block) {
          return (
            <p
              key={i}
              className="text-muted-foreground leading-relaxed text-pretty"
            >
              {renderInline(block.paragraph)}
            </p>
          )
        }
        return (
          <ul key={i} className="list-disc pl-5 space-y-1 text-muted-foreground">
            {block.list.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify the parser with a throwaway render script**

This is JSX, so verify through actual usage in Task 3's page rather than in isolation — Task 3's dev-server check (its Step 3) is this task's real verification. Confirm here only that it compiles:

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/rich-text.tsx`.

---

### Task 3: Detail page renderer

**Files:**
- Create: `components/detail-page.tsx`

**Interfaces:**
- Consumes: `DetailPage`, `resolveColumnWidths` from `lib/detail-content.ts` (Task 1); `TextBlocks` from `lib/rich-text.tsx` (Task 2).
- Produces: `function DetailPageContent({ page }: { page: DetailPage }): JSX.Element` — used by Task 7 and Task 8.

- [ ] **Step 1: Write the file**

```tsx
import type { DetailPage } from "@/lib/detail-content"
import { resolveColumnWidths } from "@/lib/detail-content"
import { TextBlocks } from "@/lib/rich-text"

export function DetailPageContent({ page }: { page: DetailPage }) {
  return (
    <article className="max-w-4xl mx-auto px-4 pb-16">
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-12 text-balance">
        {page.title}
      </h1>
      <div className="space-y-10">
        {page.rows.map((row, i) => {
          const widths = resolveColumnWidths(row.columns)
          return (
            <div key={i} className="mx-auto" style={{ width: `${row.width ?? 100}%` }}>
              <div className="flex flex-wrap -mx-3">
                {row.columns.map((column, j) => (
                  <div
                    key={j}
                    className="px-3 mb-6 last:mb-0"
                    style={{
                      flexBasis: `${widths[j]}%`,
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  >
                    {"image" in column ? (
                      <img
                        src={column.image}
                        alt={column.alt ?? ""}
                        className="w-full h-auto rounded-lg shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <TextBlocks blocks={column.text} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
```

Note on the width math: columns use `flexBasis` percentages with horizontal padding (`px-3`) rather than a flex `gap`. Because Tailwind's preflight sets `box-sizing: border-box`, padding is included inside each column's percentage width, so e.g. two columns at 50%/50% sum to exactly the row's full width with a visual gutter baked in — no overflow, no `calc()` needed. The row wrapper's `-mx-3` cancels the outermost padding so the row's edges still align with the page margin.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/detail-page.tsx`.

- [ ] **Step 3: Defer visual verification**

This component has no page to render it yet — visual verification happens in Task 7's Step 3, once a real route exists. Nothing to run here beyond the type-check above.

---

### Task 4: Make Navbar and Footer work when not on the homepage

**Context:** `Navbar`'s links are buttons that call `document.querySelector(href)` + `scrollIntoView` — this only works if the target section element exists in the current page's DOM. `Footer`'s links are plain `<a href="#projets">` etc. Both assume they're always rendered on the homepage. Once detail pages exist and reuse this Navbar/Footer (Tasks 7–8), every nav link would silently do nothing when clicked from `/projets/montage-video`. This must be fixed before Tasks 7–8 are useful.

**Files:**
- Modify: `components/navbar.tsx`
- Modify: `components/footer.tsx`

- [ ] **Step 1: Fix Navbar's scrollToSection to fall back to homepage navigation**

In `components/navbar.tsx`, replace the `scrollToSection` function:

```ts
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = `/${href}`
    }
    setIsMobileMenuOpen(false)
  }
```

(Only the body changes — same function signature, same call sites, no other edits needed in this file.)

- [ ] **Step 2: Fix Footer's anchor hrefs to be root-relative**

In `components/footer.tsx`, change all four navigation links from page-relative hashes to root-relative hashes:

```tsx
              <li>
                <a href="/#accueil" className="hover:text-primary transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/#projets" className="hover:text-primary transition-colors">
                  Projets
                </a>
              </li>
              <li>
                <a href="/#parcours" className="hover:text-primary transition-colors">
                  Parcours
                </a>
              </li>
              <li>
                <a href="/#passions" className="hover:text-primary transition-colors">
                  Passions
                </a>
              </li>
```

- [ ] **Step 3: Verify on the existing homepage (regression check)**

Run: `npm run dev`, wait for `http://localhost:3000/` to respond 200 (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`).

Using the Playwright MCP tools: navigate to `http://localhost:3000/`, click the "Projets" navbar button, confirm the page scrolls to the `#projets` section (its heading "Mes Projets" is visible in a screenshot). This confirms the fallback branch didn't break the normal same-page case.

Expected: clicking still smooth-scrolls on the homepage exactly as before Task 4.

---

### Task 5: Montage Vidéo project content

**Files:**
- Create: `content/projets.ts`

**Interfaces:**
- Consumes: `DetailPage` from `lib/detail-content.ts` (Task 1).
- Produces: `const projets: Record<string, DetailPage>` — used by Task 7.

- [ ] **Step 1: Write the file**

```ts
import type { DetailPage } from "@/lib/detail-content"

/**
 * Each entry is one project detail page, reachable at /projets/<key>.
 *
 * A page is a title + a list of rows. A row is a list of columns, plus an
 * optional `width` (% of the page, centered — leave it out for full width).
 *
 * A column is either:
 *   { image: "/assets/photo.jpg", alt: "description", width: 40 }
 *   { text: [ ...blocks ], width: 60 }
 *
 * `width` on a column is a % of its row. Leave it out and the column
 * splits whatever space is left evenly with the other width-less columns
 * in that row. If the widths in a row add up past 100 (e.g. two columns
 * both set to 60), the ones that don't fit wrap to their own new line
 * automatically — no extra row needed for that.
 *
 * Text blocks (mix and repeat in any order):
 *   { subtitle: "A small heading" }
 *   { paragraph: "Normal text. **bold** and [links](https://example.com) work inline." }
 *   { list: ["Bullet one", "Bullet two"] }
 */
export const projets: Record<string, DetailPage> = {
  "montage-video": {
    title: "Montage Vidéo",
    rows: [
      {
        columns: [
          {
            image: "/assets/r5.jpg",
            alt: "Poste de montage vidéo avec plusieurs écrans",
            width: 40,
          },
          {
            text: [
              { subtitle: "Trois caméras, un stagiaire, zéro plan B" },
              {
                paragraph:
                  "Pour la Nuit des Musées, on a filmé sur trois caméras en simultané, dont une tenue à bout de bras par un stagiaire qui découvrait le concept de « cadrage » en direct. Résultat : deux heures de rushes, une guêpe qui a jugé bon de traverser le champ à la minute 42, et un montage final de trois minutes qui ne garde heureusement aucune trace de l'un ou l'autre.",
              },
              {
                paragraph:
                  "Le montage se fait sous **Adobe Premiere Pro**, avec un luxe de patience pour synchroniser le son du micro-cravate et celui des caméras. Depuis, retour à une seule caméra fixe pour les événements suivants : moins de rushes, plus de café bu pendant qu'elle tourne toute seule.",
              },
            ],
            width: 60,
          },
        ],
      },
      {
        columns: [
          {
            text: [
              { subtitle: "Le matériel" },
              {
                list: [
                  "**Adobe Premiere Pro** pour le montage et l'étalonnage",
                  "Un micro-cravate, parce que le son d'une salle pleine à 15 mètres n'a jamais aidé personne",
                  "Une sauvegarde. Puis une deuxième sauvegarde.",
                ],
              },
            ],
            width: 60,
          },
          {
            text: [
              { subtitle: "Les délais, toujours serrés" },
              {
                paragraph:
                  "Entre la validation du programme et l'envoi de la vidéo, il reste en général trois jours. Quatre si on a de la chance. Le secret : commencer le montage avant que tous les rushes soient arrivés, et espérer que la meilleure prise ne soit pas la toute dernière.",
              },
            ],
            width: 60,
          },
        ],
      },
      {
        columns: [
          {
            text: [
              { subtitle: "Ce qui sert vraiment, au-delà du logiciel" },
              {
                list: [
                  "Rédiger un plan de montage avant d'ouvrir le logiciel, pas pendant",
                  "Regarder les rushes une fois en entier avant de couper quoi que ce soit",
                  "Voir aussi la page [Communication Visuelle](/#projets) pour les affiches qui annoncent ces événements",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}
```

Note: the second row's two columns are both `width: 60` on purpose — they sum to 120%, so the second one wraps to its own line below the first. This is the "ghost row" behavior described in the spec, demonstrated with real content rather than a throwaway example.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `content/projets.ts`.

---

### Task 6: Musique hobby content

**Files:**
- Create: `content/passions.ts`

**Interfaces:**
- Consumes: `DetailPage` from `lib/detail-content.ts` (Task 1).
- Produces: `const passions: Record<string, DetailPage>` — used by Task 8.

- [ ] **Step 1: Write the file**

```ts
import type { DetailPage } from "@/lib/detail-content"

/** Same schema as content/projets.ts — see that file for the full cheat-sheet. */
export const passions: Record<string, DetailPage> = {
  musique: {
    title: "Musique",
    rows: [
      {
        columns: [
          {
            text: [
              {
                paragraph:
                  "Il y a une playlist pour chaque étape d'un événement culturel : une pour préparer les affiches (calme, concentrée), une pour la veille du vernissage (café, stress, un peu de tout), et une, plus honteuse, pour le rangement de la salle une fois tout le monde parti.",
              },
              {
                paragraph:
                  "Je découvre en général les artistes bien après tout le monde, ce qui ne m'empêche pas d'en parler avec l'enthousiasme de quelqu'un qui vient de faire une découverte archéologique. **Désolée d'avance** si vous m'entendez chanter faux dans le bureau : la porte ferme mal.",
              },
            ],
          },
        ],
      },
      {
        width: 70,
        columns: [
          {
            image: "/assets/r6.jpg",
            alt: "Vinyles et enceinte",
            width: 45,
          },
          {
            text: [
              { subtitle: "En rotation ces temps-ci" },
              {
                list: [
                  "Un peu de tout, honnêtement",
                  "Ce que la médiathèque a mis en avant cette semaine",
                  "La bande-son du dernier vernissage, en boucle, sans l'avoir vraiment décidé",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}
```

Note: the second row uses `width: 70` on the row itself (a narrower, centered row — demonstrates row-level width) and gives only the image an explicit column width (45); the text column has none, so it automatically takes the remaining 55%.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `content/passions.ts`.

---

### Task 7: Project detail route

**Files:**
- Create: `app/projets/[slug]/page.tsx`

**Interfaces:**
- Consumes: `projets` from `content/projets.ts` (Task 5); `DetailPageContent` from `components/detail-page.tsx` (Task 3); `Navbar` from `components/navbar.tsx`; `Footer` from `components/footer.tsx` (both fixed in Task 4).

- [ ] **Step 1: Write the file**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DetailPageContent } from "@/components/detail-page"
import { projets } from "@/content/projets"

export function generateStaticParams() {
  return Object.keys(projets).map((slug) => ({ slug }))
}

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = projets[slug]
  if (!page) notFound()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
        <Link
          href="/#projets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>
      </div>
      <DetailPageContent page={page} />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds, and the route list printed includes `○ /projets/montage-video` (or equivalent static entry) alongside the existing `/` route.

- [ ] **Step 3: Visual verification**

Run: `npm run dev`, wait for `http://localhost:3000/projets/montage-video` to return 200.

Using the Playwright MCP tools: navigate to `http://localhost:3000/projets/montage-video`, take a screenshot at 1280x900 and at 390x844. Confirm:
- The title "Montage Vidéo" renders as a heading.
- The first row shows the image and text side by side at desktop width, and stacked at mobile width (mobile stacking is automatic from `flex-wrap` — a 40%/60% row still wraps at narrow viewports because the columns' actual rendered width, not just their percentage, no longer fits two per line at 390px... verify this is visually acceptable; if the columns look cramped rather than stacked at 390px, that's expected and acceptable for this feature — Tailwind breakpoint-based stacking was not part of the approved schema).
- The second row's two `width: 60` columns render one below the other (the "ghost row").
- The "Retour aux projets" link is present above the title.

Then remove the temporary build output: `rm -rf out .next` (Bash) after stopping the dev server.

- [ ] **Step 4: Clean up**

Stop the dev server. Remove any screenshot files written to the repo root during verification.

---

### Task 8: Hobby detail route

**Files:**
- Create: `app/passions/[slug]/page.tsx`

**Interfaces:**
- Consumes: `passions` from `content/passions.ts` (Task 6); `DetailPageContent` from `components/detail-page.tsx` (Task 3); `Navbar`, `Footer`.

- [ ] **Step 1: Write the file**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DetailPageContent } from "@/components/detail-page"
import { passions } from "@/content/passions"

export function generateStaticParams() {
  return Object.keys(passions).map((slug) => ({ slug }))
}

export default async function PassionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = passions[slug]
  if (!page) notFound()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
        <Link
          href="/#passions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux passions
        </Link>
      </div>
      <DetailPageContent page={page} />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds, route list now includes both `/projets/montage-video` and `/passions/musique`.

- [ ] **Step 3: Visual verification**

Same procedure as Task 7 Step 3, at `http://localhost:3000/passions/musique`. Confirm:
- Title "Musique" renders.
- Second row is visibly narrower than the page width and centered (the `width: 70` row).
- Image column and text column share that row correctly (45% / auto-computed 55%).

Clean up build output and screenshots afterward, same as Task 7.

---

### Task 9: Link the Montage Vidéo project card

**Files:**
- Modify: `components/projects-section.tsx`

**Interfaces:**
- Produces: `Project.slug?: string` field; cards with a `slug` become links to `/projets/<slug>`.

- [ ] **Step 1: Add the optional `slug` field to the type and to the Montage Vidéo entry**

In `components/projects-section.tsx`, add `slug?: string` to the `Project` type:

```ts
type Project = {
  title: string
  description: string
  icon: LucideIcon
  tools: string[]
  skills: string[]
  /** Optional illustration. Omit to keep the card text-only. */
  image?: string
  /** Optional detail-page slug (see content/projets.ts). Omit to keep the card non-clickable. */
  slug?: string
}
```

Add `slug: "montage-video"` to the "Montage Vidéo" entry (alongside its existing `image: "/assets/r3.jpg"`).

- [ ] **Step 2: Wrap linked cards in `next/link`**

Add the import:

```ts
import Link from "next/link"
```

Replace the `projects.map` block's returned element so a card with a `slug` renders inside a `Link`, and a card without one renders exactly as before:

```tsx
          {projects.map((project) => {
            const card = (
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <project.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {project.title}
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.image && (
                    <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={project.image}
                        alt={`Illustration : ${project.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {project.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs font-medium">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs font-medium border-primary/30 text-primary"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            if (!project.slug) {
              return <div key={project.title}>{card}</div>
            }

            return (
              <Link
                key={project.title}
                href={`/projets/${project.slug}`}
                className="block h-full"
              >
                {card}
              </Link>
            )
          })}
```

(The outer `map` callback keys its returned element by `project.title` in both branches — the `Card` itself doesn't need its own `key` since it's no longer the direct array child. `h-full` on the `Card` keeps it filling the grid cell now that `Link` is the direct grid child.)

- [ ] **Step 3: Build check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/projects-section.tsx`.

- [ ] **Step 4: Visual + behavioral verification**

Run: `npm run dev`. Using Playwright MCP tools: navigate to `http://localhost:3000/#projets`, take a snapshot to find the "Montage Vidéo" card, click it, confirm the browser URL becomes `http://localhost:3000/projets/montage-video` and the page shows the "Montage Vidéo" heading. Then navigate back and confirm the other three cards (no `slug`) are NOT wrapped in a link — clicking "Communication Visuelle" does nothing / URL stays on `/#projets`.

---

### Task 10: Link the Musique hobby card

**Files:**
- Modify: `components/hobbies-section.tsx`

**Interfaces:**
- Produces: hobby entries gain an optional `slug?: string` field; cards with a `slug` link to `/passions/<slug>`.

- [ ] **Step 1: Add an explicit type, the `slug` field, and wire the Musique entry**

`components/hobbies-section.tsx` currently has no named type for its data (inline array literal). Add one and use it:

```ts
import type { LucideIcon } from "lucide-react"

type Hobby = {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  iconColor: string
  /** Optional detail-page slug (see content/passions.ts). Omit to keep the card non-clickable. */
  slug?: string
}

const hobbies: Hobby[] = [
  {
    title: "Musique",
    description:
      "La musique m'accompagne au quotidien. Que ce soit pour me concentrer, me détendre ou m'inspirer, elle fait partie intégrante de ma vie. J'aime découvrir de nouveaux artistes et partager mes coups de coeur.",
    icon: Music,
    gradient: "from-primary/20 to-accent/10",
    iconColor: "text-primary",
    slug: "musique",
  },
  {
    title: "Création Artisanale",
    description:
      "Passionnée par le travail manuel, je crée des bijoux et m'adonne au tricot. Ces activités créatives me permettent de m'exprimer et d'offrir des pièces uniques à mes proches.",
    icon: Sparkles,
    gradient: "from-accent/20 to-primary/10",
    iconColor: "text-accent",
  },
  {
    title: "Nature & Photographie",
    description:
      "Les arbres et la nature sont une source d'inspiration infinie. J'aime me promener en forêt et capturer la beauté des paysages à travers la photographie, immortalisant ces moments de sérénité.",
    icon: TreePine,
    gradient: "from-primary/15 to-accent/15",
    iconColor: "text-primary",
  },
]
```

- [ ] **Step 2: Wrap linked cards in `next/link`**

Add the import:

```ts
import Link from "next/link"
```

Replace the `hobbies.map` block:

```tsx
          {hobbies.map((hobby) => {
            const card = (
              <Card className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform duration-300",
                      hobby.gradient
                    )}
                  >
                    <hobby.icon className={cn("h-8 w-8", hobby.iconColor)} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground text-center mb-3">
                    {hobby.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {hobby.description}
                  </p>
                </CardContent>
              </Card>
            )

            if (!hobby.slug) {
              return <div key={hobby.title}>{card}</div>
            }

            return (
              <Link key={hobby.title} href={`/passions/${hobby.slug}`} className="block h-full">
                {card}
              </Link>
            )
          })}
```

- [ ] **Step 3: Build check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/hobbies-section.tsx`.

- [ ] **Step 4: Visual + behavioral verification**

Same procedure as Task 9 Step 4, but for `http://localhost:3000/#passions` → click "Musique" → confirm navigation to `/passions/musique`. Confirm "Création Artisanale" and "Nature & Photographie" cards remain non-clickable.

---

### Task 11: Full regression pass

**Files:** none (verification only).

- [ ] **Step 1: Full static build**

Run: `npm run build`
Expected: succeeds. Route list includes `/`, `/projets/montage-video`, `/passions/musique`, `/_not-found`.

- [ ] **Step 2: Serve the static export and spot-check**

Run: `npx serve out` (or equivalent static server), then using curl or Playwright confirm all of the following return 200 / render correctly:
- `/`
- `/projets/montage-video/` (note `trailingSlash: true` is set in `next.config.mjs`)
- `/passions/musique/`

- [ ] **Step 3: Homepage regression**

Using Playwright MCP tools, screenshot the homepage hero, projects grid, and hobbies grid at 1280px and at 390px. Confirm nothing outside the four touched cards (Montage Vidéo, Musique) changed visually from before this feature.

- [ ] **Step 4: Clean up**

Remove `out/`, `.next/`, and any temporary screenshot files written to the repo during verification. Stop any background dev server processes.
