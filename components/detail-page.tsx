import type { CSSProperties } from "react"
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
              <div className="flex flex-col md:flex-row md:flex-wrap -mx-3">
                {row.columns.map((column, j) => (
                  <div
                    key={j}
                    className="w-full px-3 mb-6 last:mb-0 md:w-auto md:shrink-0 md:grow-0 md:[flex-basis:var(--col-width)]"
                    style={{ "--col-width": `${widths[j]}%` } as CSSProperties}
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
