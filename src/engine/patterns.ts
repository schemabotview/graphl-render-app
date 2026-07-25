import type { SceneGrid, SceneNodeSpec } from './types.ts'

// Authoring helpers for building a dense scene tree without hand-counting cells.
// A `container`/`group` wraps an inner grid + its children; `wgrid` pairs a weighted
// grid with children that carry their placement in `at` (assigned to `cell`). Ported
// from graphl-ux/engine/patterns.ts (kept minimal — just what the platform scene uses).

export type WeightedSpec = SceneGrid

export interface PatternResult {
  grid: SceneGrid
  nodes: SceneNodeSpec[]
}

/** A child placed in a weighted grid: the node plus its cell (`at` → `cell`). */
export interface WeightedSeed {
  node: SceneNodeSpec
  at: SceneNodeSpec['cell']
}

/** Convenience alias for a leaf/node before it's placed (cell defaults to [0,0]). */
export type NodeSeed = SceneNodeSpec

/** A titled box whose children lay out inside it (title rides the border). */
export const container = (
  meta: { id: string; label: string; color?: string },
  inner: PatternResult,
): SceneNodeSpec => ({ ...meta, kind: 'container', cell: [0, 0], layout: inner.grid, children: inner.nodes })

/** An invisible arranger (no chrome) that only sub-lays out its children. */
export const group = (id: string, inner: PatternResult): SceneNodeSpec => ({
  id,
  label: '',
  kind: 'group',
  cell: [0, 0],
  layout: inner.grid,
  children: inner.nodes,
})

/** Pair a weighted grid with children carrying their placement in `at`. */
export const wgrid = (grid: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})
