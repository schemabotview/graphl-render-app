import type { SceneGrid, SceneNodeSpec } from './types.ts'
import { validateLayout } from './gridValidate.ts'

// Recursive grid resolver. Emits top-left pixel boxes because React Flow positions
// nodes by their top-left corner. A node with `children` + `layout` resolves those
// children INSIDE its own box, so a container truly measures its contents.

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** Pixel breathing room between a container's border and its inner children. */
const CONTAINER_INSET = 6

/** Resolve the scene tree into an id → absolute Box map (top-left origin). */
export function resolveGrid(
  nodes: SceneNodeSpec[],
  grid: SceneGrid,
  canvas: { width: number; height: number },
): Record<string, Box> {
  if (import.meta.env.DEV) validateLayout(nodes, grid)
  const out: Record<string, Box> = {}
  layoutLevel(nodes, grid, { x: 0, y: 0, w: canvas.width, h: canvas.height }, out)
  return out
}

/** Normalize a grid dimension to per-track WEIGHTS: `n` → n equal tracks `[1,…]`;
 *  an array passes through as relative track sizes. */
export const tracks = (dim: number | number[]): number[] =>
  Array.isArray(dim) ? dim : Array.from({ length: dim }, () => 1)

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Cumulative pixel offset BEFORE each track: `[w0,w1,w2]` → `[0,w0,w0+w1]`. */
const offsets = (sizes: number[]): number[] =>
  sizes.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s], [0])

/** Lay out one axis: relative weights → pixel track sizes within `extent`, reserving
 *  `padding` on both ends and `gap` between tracks (both in weight-1 units). */
function axis(weights: number[], extent: number, gap: number, padding: number) {
  const denom = sum(weights) + 2 * padding + (weights.length - 1) * gap
  const unit = extent / denom
  const sizes = weights.map((w) => w * unit)
  return { unit, sizes, before: offsets(sizes) }
}

/** Place one level of siblings within `box`, then recurse into their children. */
function layoutLevel(
  nodes: SceneNodeSpec[],
  grid: SceneGrid,
  box: Box,
  out: Record<string, Box>,
): void {
  const { gap = 0.2, padding = 0.4 } = grid
  const col = axis(tracks(grid.cols), box.w, gap, padding)
  const row = axis(tracks(grid.rows), box.h, gap, padding)
  const gapX = col.unit * gap
  const gapY = row.unit * gap
  const padX = col.unit * padding
  const padY = row.unit * padding

  for (const node of nodes) {
    const [c, r, cs = 1, rs = 1] = node.cell
    const nb: Box = {
      x: box.x + padX + col.before[c] + c * gapX,
      y: box.y + padY + row.before[r] + r * gapY,
      w: sum(col.sizes.slice(c, c + cs)) + (cs - 1) * gapX,
      h: sum(row.sizes.slice(r, r + rs)) + (rs - 1) * gapY,
    }
    out[node.id] = nb

    if (node.children?.length && node.layout) {
      const i = node.kind === 'container' ? CONTAINER_INSET : 0
      const inner: Box = { x: nb.x + i, y: nb.y + i, w: nb.w - 2 * i, h: nb.h - 2 * i }
      layoutLevel(node.children, node.layout, inner, out)
    }
  }
}
