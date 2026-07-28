import type { NodeKind } from './types.ts'

// Proportional label sizing: shrink the font so a label fits its box instead of
// wrapping into garble. Logical px in canvas coords — fitView scales.
//
// Two regimes by kind:
//   - 'term' chips render on ONE horizontal line (CSS `white-space: nowrap`), so we
//     size the WHOLE label against the box width with a small floor; anything still
//     too long clips cleanly in CSS.
//   - 'symbol' labels keep the clean word-wrap: size to the longest WORD (words stay
//     whole, wrap only at spaces) with a two-line height budget.

/** Fit a leaf label ('symbol' / 'term') to its box. */
export function fitLabelPx(label: string, w: number, h: number, kind: NodeKind): number {
  if (kind === 'term') {
    const chars = Math.max(1, label.replace(/\s+/g, ' ').trim().length)
    const byWidth = Math.max(w - 4, 6) / (chars * 0.72)
    const byHeight = Math.max(h - 4, 6) / 1.2
    return Math.max(4, Math.min(byWidth, byHeight, 22))
  }
  const words = label.split(/\s+/).filter(Boolean)
  const longest = Math.max(1, ...words.map((word) => word.length))
  const byWidth = Math.max(w - 20, 8) / (longest * 0.72)
  const lines = words.length > 1 ? 2 : 1
  const byHeight = Math.max(h - 18, 8) / (lines * 1.25)
  return Math.max(7, Math.min(byWidth, byHeight, 22)) // symbol cap
}

/** Fit a container's on-border TITLE (one nowrap uppercase line) to its box width.
 *  Low floor + conservative advance so narrow rail titles shrink to fit, not clip. */
export function fitTitlePx(label: string, w: number): number {
  const avail = Math.max(w - 8, 6)
  const px = avail / (Math.max(label.length, 1) * 0.86) // uppercase + letter-spacing runs wide
  return Math.max(4, Math.min(px, 11))
}
