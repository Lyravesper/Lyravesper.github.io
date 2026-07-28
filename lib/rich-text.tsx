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
