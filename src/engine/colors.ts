// Semantic ROLE palette (see CLAUDE.md → Visual design). A concept always wears the
// same color so color becomes a memory cue. These TS constants mirror the CSS
// variables in index.css; authors reference them from a SceneSpec. Color renders as a
// CALM FILLED block (mixed into a dark base in scene.css), never a neon outline.

export const BLUE = '#5b8cff' // Driver / control plane — the brain, the plan
export const GREEN = '#37d39a' // Executors / compute / data — the muscle
export const ORANGE = '#ff7a59' // Storage / shuffle / I/O — where data lands
export const PURPLE = '#b98bff' // API / abstraction layer
export const TEAL = '#3fd0d6' // Transformations / flow — movement between stages
export const RED = '#ff5d6c' // Wide op / danger / gotcha
export const GRAY = '#9aa3b2' // Inert / context — supporting, non-focal nodes
export const YELLOW = '#d9b84a' // Storage formats + gold — a calm gold

/** Edges are calm and uniform — color semantics live in nodes, not arrows. */
export const EDGE = '#5b6270'
