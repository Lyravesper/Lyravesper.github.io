export type TextBlock =
  | { subtitle: string }
  | { paragraph: string }
  | { list: string[] }

export type MediaPlayer = {
  title: string
  composer: string
  /** Image or gif shown as the cover art. */
  cover: string
  /** Any standard YouTube URL (watch, youtu.be, embed — extra query params like a playlist are ignored). */
  youtubeUrl: string
}

export type Column =
  | { image: string; alt?: string; width?: number }
  | { text: TextBlock[]; width?: number }
  | { player: MediaPlayer; width?: number }

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
