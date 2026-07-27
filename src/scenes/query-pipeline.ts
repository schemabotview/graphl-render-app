import type { SceneSpec } from '../engine/types.ts'
import { GREEN, TEAL, YELLOW } from '../engine/colors.ts'

// The logical execution order of a SELECT — the mental model for the SQL concept
// (sql-ct). You WRITE `SELECT` first, but the engine RUNS the clauses in this order,
// left to right:
//   FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT,
// with two feed-ins from above: CTE / subquery (WITH) into FROM, and window functions
// (OVER) into SELECT. This is why WHERE can't see a SELECT alias but ORDER BY can, and
// why WHERE filters rows while HAVING filters groups.
//
// Modules 01 (foundations), 04 (aggregation) and 09 (DML — UPDATE/DELETE share WHERE)
// ride this scene; the camera frames one stage per section via the manifest
// `highlight`/`focus`. Node ids are stable so that wiring transfers:
//   from-clause · join · where-clause · group-by · having · select-clause ·
//   distinct · order-by · limit · cte · window.
//
// Semantic colors (colors.ts): the pipeline chain is GREEN (compute/flow of rows),
// JOIN is TEAL (combining/movement between tables), and the two modifiers are a calm
// YELLOW (they feed the chain rather than sit in it).
export const queryPipeline: SceneSpec = {
  id: 'query-pipeline',
  title: 'The Query Pipeline — logical execution order',
  // Wide filmstrip; aspect ≈ the inner grid (9 cols × ~3.4 row-weights) so cells stay
  // roughly square when fitView scales it into the pane.
  canvas: { width: 1840, height: 640 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [
    {
      id: 'pipeline',
      label: 'Query Pipeline — logical execution order',
      color: GREEN,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: [1, 1, 1, 1, 1, 1, 1, 1, 1], rows: [1, 2.4], gap: 0.3, padding: 0.4 },
      children: [
        // --- Feed-ins (row 0): modifiers that inject into the chain ----------
        { id: 'cte', label: 'CTE / Subquery', sub: 'WITH …', kind: 'symbol', color: YELLOW, cell: [0, 0, 2, 1] },
        { id: 'window', label: 'Window Functions', sub: 'OVER( )', kind: 'symbol', color: YELLOW, cell: [5, 0, 2, 1] },

        // --- The chain (row 1): logical run order, left → right --------------
        { id: 'from-clause', label: 'FROM', sub: 'pick tables', kind: 'symbol', color: GREEN, cell: [0, 1] },
        { id: 'join', label: 'JOIN', sub: 'combine tables', kind: 'symbol', color: TEAL, cell: [1, 1] },
        { id: 'where-clause', label: 'WHERE', sub: 'filter rows', kind: 'symbol', color: GREEN, cell: [2, 1] },
        { id: 'group-by', label: 'GROUP BY', sub: 'make groups', kind: 'symbol', color: GREEN, cell: [3, 1] },
        { id: 'having', label: 'HAVING', sub: 'filter groups', kind: 'symbol', color: GREEN, cell: [4, 1] },
        { id: 'select-clause', label: 'SELECT', sub: 'project columns', kind: 'symbol', color: GREEN, cell: [5, 1] },
        { id: 'distinct', label: 'DISTINCT', sub: 'drop duplicates', kind: 'symbol', color: GREEN, cell: [6, 1] },
        { id: 'order-by', label: 'ORDER BY', sub: 'sort', kind: 'symbol', color: GREEN, cell: [7, 1] },
        { id: 'limit', label: 'LIMIT', sub: 'trim to N', kind: 'symbol', color: GREEN, cell: [8, 1] },
      ],
    },
  ],
  edges: [
    // The logical chain — NOT the written order. Each label is what leaves the stage.
    { from: 'from-clause', to: 'join', label: 'rows' },
    { from: 'join', to: 'where-clause', label: 'joined rows' },
    { from: 'where-clause', to: 'group-by', label: 'kept rows' },
    { from: 'group-by', to: 'having', label: 'groups' },
    { from: 'having', to: 'select-clause', label: 'kept groups' },
    { from: 'select-clause', to: 'distinct', label: 'projected' },
    { from: 'distinct', to: 'order-by', label: 'unique rows' },
    { from: 'order-by', to: 'limit', label: 'sorted' },
    // Feed-ins from above
    { from: 'cte', to: 'from-clause', label: 'WITH' },
    { from: 'window', to: 'select-clause', label: 'OVER()' },
  ],
}
