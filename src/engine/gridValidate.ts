import type { SceneGrid, SceneNodeSpec } from './types.ts'
import { tracks } from './grid.ts'

// Dev-only sanity checks for hand-authored scenes: warn on cells that run off their
// grid, or two non-backdrop peers that collide. A container is a backdrop its peers
// may sit on, so an overlap counts only when neither is a container and neither
// contains the other. Checked per level (children live in their parent's sub-grid).

type Rect = { id: string; c: number; r: number; cs: number; rs: number }

const rect = (n: SceneNodeSpec): Rect => {
  const [c, r, cs = 1, rs = 1] = n.cell
  return { id: n.id, c, r, cs, rs }
}

const overlaps = (a: Rect, b: Rect) =>
  a.c < b.c + b.cs && b.c < a.c + a.cs && a.r < b.r + b.rs && b.r < a.r + a.rs

const contains = (a: Rect, b: Rect) =>
  a.c <= b.c && a.r <= b.r && a.c + a.cs >= b.c + b.cs && a.r + a.rs >= b.r + b.rs

export function validateLayout(nodes: SceneNodeSpec[], grid: SceneGrid): void {
  const cols = tracks(grid.cols).length
  const rows = tracks(grid.rows).length

  for (const { id, cell } of nodes) {
    const [c, r, cs = 1, rs = 1] = cell
    if (c < 0 || r < 0 || c + cs > cols || r + rs > rows) {
      console.warn(`[layout] "${id}" cell ${JSON.stringify(cell)} runs off the ${cols}×${rows} grid`)
    }
  }

  const rects = nodes.map(rect)
  const backdrop = new Set(
    nodes.filter((n) => n.kind === 'container' || n.kind === 'group').map((n) => n.id),
  )
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]
      const b = rects[j]
      if (backdrop.has(a.id) || backdrop.has(b.id)) continue
      if (!overlaps(a, b) || contains(a, b) || contains(b, a)) continue
      console.warn(`[layout] "${a.id}" and "${b.id}" overlap`)
    }
  }

  for (const node of nodes) {
    if (node.children?.length && node.layout) validateLayout(node.children, node.layout)
  }
}
