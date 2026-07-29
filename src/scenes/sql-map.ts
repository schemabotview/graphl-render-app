import type { SceneSpec } from '../engine/types.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// The WHOLE SQL landscape on one canvas — the single scene the SQL concept (sql-ct)
// rides. Every section frames one REGION of this map via the manifest `focus`/
// `highlight`, so the viewer keeps the big picture the whole course through. Six
// regions plus two teaching additions (DCL, Programmable) so one scene covers all ten
// modules:
//   DDL — Metadata (ORANGE): the statements that define structure
//   Catalog — Metadata (BLUE): database → schema → table (columns, indexes, constraints)
//   Storage — Data (GRAY): where rows physically live (tablespace, pages, rows, WAL)
//   Transactions (PURPLE): BEGIN · Write DML (RED) · COMMIT/ROLLBACK · isolation · DCL
//   Query Pipeline (GREEN): logical run order FROM→…→LIMIT, JOIN (TEAL) + CTE/Window (YELLOW)
//   Set Operations (TEAL): UNION · UNION ALL · INTERSECT · EXCEPT
//   Programmable (PURPLE): Views · Stored Procedures · Functions · Triggers
//
// Adapted from the NodeMap `sql.ts` reference into the app's SceneSpec. Node ids are
// stable so per-section highlight/focus wiring transfers. Module → region map (see
// sql-ct/README): 01 whole map · 02 WHERE/DISTINCT/ORDER BY/LIMIT · 03 JOIN · 04
// GROUP BY/HAVING · 05 Set Operations · 06 CTE/subquery · 07 Window · 08 Constraints/
// DDL · 09 Transactions+DCL · 10 Programmable.
export const sqlMap: SceneSpec = {
  id: 'sql-map',
  title: 'The SQL Landscape',
  // Aspect ≈ inner grid (cols 7+9+7=23 × rows 5+2+6+2=15 ≈ 1.53) so cells stay ~square.
  canvas: { width: 1840, height: 1200 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [
    {
      id: 'sql',
      label: 'SQL',
      color: BLUE,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: [7, 9, 7], rows: [5, 2, 6, 2], gap: 0.4, padding: 0.4 },
      children: [
        // ===== DDL — statements that define structure =======================
        {
          id: 'ddl',
          label: 'DDL — Metadata',
          icon: 'terminal',
          color: ORANGE,
          kind: 'container',
          cell: [0, 0, 1, 2],
          layout: { cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.2, padding: 0.35 },
          children: [
            { id: 'create-table', label: 'CREATE TABLE', color: ORANGE, kind: 'symbol', cell: [0, 0] },
            { id: 'alter-table', label: 'ALTER TABLE', color: ORANGE, kind: 'symbol', cell: [1, 0] },
            { id: 'drop-table', label: 'DROP TABLE', color: ORANGE, kind: 'symbol', cell: [0, 1] },
            { id: 'truncate', label: 'TRUNCATE', color: ORANGE, kind: 'symbol', cell: [1, 1] },
            { id: 'create-index', label: 'CREATE INDEX', color: ORANGE, kind: 'symbol', cell: [0, 2] },
            { id: 'create-view', label: 'CREATE VIEW', color: ORANGE, kind: 'symbol', cell: [1, 2] },
            { id: 'rename', label: 'RENAME', color: ORANGE, kind: 'symbol', cell: [0, 3, 2, 1] },
          ],
        },
        // ===== Catalog — the metadata tree ==================================
        {
          id: 'catalog',
          label: 'Catalog — Metadata',
          icon: 'database',
          color: BLUE,
          kind: 'container',
          cell: [1, 0],
          layout: { cols: [1], rows: [1, 1, 5], gap: 0.2, padding: 0.35 },
          children: [
            { id: 'database', label: 'Database', color: BLUE, kind: 'symbol', cell: [0, 0] },
            { id: 'schema', label: 'Schema', color: BLUE, kind: 'symbol', cell: [0, 1] },
            {
              id: 'table',
              label: 'Table',
              icon: 'table',
              color: BLUE,
              kind: 'container',
              cell: [0, 2],
              layout: { cols: [1, 1], rows: [1, 2], gap: 0.2, padding: 0.3 },
              children: [
                { id: 'columns', label: 'Columns', color: BLUE, kind: 'symbol', cell: [0, 0] },
                { id: 'indexes', label: 'Indexes', color: BLUE, kind: 'symbol', cell: [1, 0] },
                {
                  id: 'constraints',
                  label: 'Constraints',
                  icon: 'shield',
                  color: BLUE,
                  kind: 'container',
                  cell: [0, 1, 2, 1],
                  layout: { cols: [1, 1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.25 },
                  children: [
                    { id: 'pk', label: 'PK', color: BLUE, kind: 'symbol', cell: [0, 0] },
                    { id: 'fk', label: 'FK', color: BLUE, kind: 'symbol', cell: [1, 0] },
                    { id: 'not-null', label: 'NOT NULL', color: BLUE, kind: 'symbol', cell: [2, 0] },
                    { id: 'unique', label: 'UNIQUE', color: BLUE, kind: 'symbol', cell: [3, 0] },
                    { id: 'check', label: 'CHECK', color: BLUE, kind: 'symbol', cell: [4, 0] },
                  ],
                },
              ],
            },
          ],
        },
        // ===== Storage — where rows physically live =========================
        {
          id: 'storage',
          label: 'Storage — Data',
          icon: 'disk',
          color: GRAY,
          kind: 'container',
          cell: [1, 1],
          layout: { cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.35 },
          children: [
            { id: 'tablespace', label: 'Tablespace', color: GRAY, kind: 'symbol', cell: [0, 0] },
            { id: 'pages', label: 'Pages', color: GRAY, kind: 'symbol', cell: [1, 0] },
            { id: 'rows', label: 'Rows', color: GRAY, kind: 'symbol', cell: [2, 0] },
            { id: 'wal', label: 'WAL', color: GRAY, kind: 'symbol', cell: [3, 0] },
          ],
        },
        // ===== Transactions — DML, commit/rollback, isolation, DCL ==========
        {
          id: 'transactions',
          label: 'Transactions',
          icon: 'workflow',
          color: PURPLE,
          kind: 'container',
          cell: [2, 0, 1, 2],
          layout: { cols: [1, 1], rows: [1, 4, 1, 2, 1.4], gap: 0.25, padding: 0.35 },
          children: [
            { id: 'begin', label: 'BEGIN', color: PURPLE, kind: 'symbol', cell: [0, 0, 2, 1] },
            {
              id: 'write-dml',
              label: 'Write DML',
              color: RED,
              kind: 'container',
              cell: [0, 1, 2, 1],
              layout: { cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.3 },
              children: [
                { id: 'insert', label: 'INSERT', color: RED, kind: 'symbol', cell: [0, 0] },
                { id: 'update', label: 'UPDATE', color: RED, kind: 'symbol', cell: [1, 0] },
                { id: 'delete', label: 'DELETE', color: RED, kind: 'symbol', cell: [0, 1] },
                { id: 'merge', label: 'MERGE', color: RED, kind: 'symbol', cell: [1, 1] },
              ],
            },
            { id: 'commit', label: 'COMMIT', color: PURPLE, kind: 'symbol', cell: [0, 2] },
            { id: 'rollback', label: 'ROLLBACK', color: PURPLE, kind: 'symbol', cell: [1, 2] },
            {
              id: 'isolation',
              label: 'Isolation Levels',
              color: PURPLE,
              kind: 'container',
              cell: [0, 3, 2, 1],
              layout: { cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.3 },
              children: [
                { id: 'read-uncommitted', label: 'READ UNCOMMITTED', color: PURPLE, kind: 'symbol', cell: [0, 0] },
                { id: 'read-committed', label: 'READ COMMITTED', color: PURPLE, kind: 'symbol', cell: [1, 0] },
                { id: 'repeatable-read', label: 'REPEATABLE READ', color: PURPLE, kind: 'symbol', cell: [0, 1] },
                { id: 'serializable', label: 'SERIALIZABLE', color: PURPLE, kind: 'symbol', cell: [1, 1] },
              ],
            },
            {
              id: 'dcl',
              label: 'Access Control — DCL',
              icon: 'key',
              color: PURPLE,
              kind: 'container',
              cell: [0, 4, 2, 1],
              layout: { cols: [1, 1], rows: [1], gap: 0.2, padding: 0.3 },
              children: [
                { id: 'grant', label: 'GRANT', color: PURPLE, kind: 'symbol', cell: [0, 0] },
                { id: 'revoke', label: 'REVOKE', color: PURPLE, kind: 'symbol', cell: [1, 0] },
              ],
            },
          ],
        },
        // ===== Query Pipeline — logical execution order =====================
        {
          id: 'pipeline',
          label: 'Query Pipeline — logical execution order',
          icon: 'funnel',
          color: GREEN,
          kind: 'container',
          cell: [0, 2, 3, 1],
          layout: { cols: [1, 3, 1, 1, 1, 1, 1, 1, 1], rows: [1.2, 2.2], gap: 0.3, padding: 0.4 },
          children: [
            { id: 'cte', label: 'CTE / Subquery', sub: 'WITH …', color: YELLOW, kind: 'symbol', cell: [0, 0] },
            { id: 'window', label: 'Window Functions', sub: 'OVER( )', color: YELLOW, kind: 'symbol', cell: [5, 0] },
            { id: 'from-clause', label: 'FROM', sub: 'pick tables', color: GREEN, kind: 'symbol', cell: [0, 1] },
            {
              id: 'join',
              label: 'JOIN',
              icon: 'share',
              color: TEAL,
              kind: 'container',
              cell: [1, 1],
              layout: { cols: [1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.28 },
              children: [
                { id: 'inner-join', label: 'INNER', color: TEAL, kind: 'symbol', cell: [0, 0] },
                { id: 'left-join', label: 'LEFT', color: TEAL, kind: 'symbol', cell: [1, 0] },
                { id: 'right-join', label: 'RIGHT', color: TEAL, kind: 'symbol', cell: [2, 0] },
                { id: 'full-outer-join', label: 'FULL OUTER', color: TEAL, kind: 'symbol', cell: [0, 1] },
                { id: 'cross-join', label: 'CROSS', color: TEAL, kind: 'symbol', cell: [1, 1] },
                { id: 'self-join', label: 'SELF', color: TEAL, kind: 'symbol', cell: [2, 1] },
              ],
            },
            { id: 'where-clause', label: 'WHERE', sub: 'filter rows', color: GREEN, kind: 'symbol', cell: [2, 1] },
            { id: 'group-by', label: 'GROUP BY', sub: 'make groups', color: GREEN, kind: 'symbol', cell: [3, 1] },
            { id: 'having', label: 'HAVING', sub: 'filter groups', color: GREEN, kind: 'symbol', cell: [4, 1] },
            { id: 'select-clause', label: 'SELECT', sub: 'project', color: GREEN, kind: 'symbol', cell: [5, 1] },
            { id: 'distinct', label: 'DISTINCT', sub: 'dedupe', color: GREEN, kind: 'symbol', cell: [6, 1] },
            { id: 'order-by', label: 'ORDER BY', sub: 'sort', color: GREEN, kind: 'symbol', cell: [7, 1] },
            { id: 'limit', label: 'LIMIT', sub: 'trim to N', color: GREEN, kind: 'symbol', cell: [8, 1] },
          ],
        },
        // ===== Set Operations ===============================================
        {
          id: 'set-ops',
          label: 'Set Operations',
          icon: 'layers',
          color: TEAL,
          kind: 'container',
          cell: [0, 3, 2, 1],
          layout: { cols: [1, 1, 1, 1], rows: [1], gap: 0.3, padding: 0.4 },
          children: [
            { id: 'union', label: 'UNION', color: TEAL, kind: 'symbol', cell: [0, 0] },
            { id: 'union-all', label: 'UNION ALL', color: TEAL, kind: 'symbol', cell: [1, 0] },
            { id: 'intersect', label: 'INTERSECT', color: TEAL, kind: 'symbol', cell: [2, 0] },
            { id: 'except', label: 'EXCEPT', color: TEAL, kind: 'symbol', cell: [3, 0] },
          ],
        },
        // ===== Programmable — saved logic ===================================
        {
          id: 'programmable',
          label: 'Programmable',
          icon: 'braces',
          color: PURPLE,
          kind: 'container',
          cell: [2, 3],
          layout: { cols: [1, 1], rows: [1, 1], gap: 0.25, padding: 0.4 },
          children: [
            { id: 'prog-views', label: 'Views', color: PURPLE, kind: 'symbol', cell: [0, 0] },
            { id: 'stored-procedures', label: 'Stored Procedures', color: PURPLE, kind: 'symbol', cell: [1, 0] },
            { id: 'functions', label: 'Functions', color: PURPLE, kind: 'symbol', cell: [0, 1] },
            { id: 'triggers', label: 'Triggers', color: PURPLE, kind: 'symbol', cell: [1, 1] },
          ],
        },
      ],
    },
  ],
  // Edges tell the READ story only — the spine that connects the regions. The other
  // regions (DDL, Transactions, Set Ops, Programmable) are self-labeled and stay
  // arrow-free to avoid clutter: catalog → storage → the pipeline chain → set ops.
  edges: [
    // Catalog describes the physical layout; FROM scans those rows into the pipeline
    { from: 'table', to: 'storage', label: 'schema for' },
    { from: 'rows', to: 'from-clause', label: 'scan' },
    // The pipeline chain — logical run order (NOT written order)
    { from: 'from-clause', to: 'join', label: 'rows' },
    { from: 'join', to: 'where-clause', label: 'joined rows' },
    { from: 'where-clause', to: 'group-by', label: 'kept rows' },
    { from: 'group-by', to: 'having', label: 'groups' },
    { from: 'having', to: 'select-clause', label: 'kept groups' },
    { from: 'select-clause', to: 'distinct', label: 'projected' },
    { from: 'distinct', to: 'order-by', label: 'unique rows' },
    { from: 'order-by', to: 'limit', label: 'sorted' },
    // Modifiers feed the chain
    { from: 'cte', to: 'from-clause', label: 'WITH' },
    { from: 'window', to: 'select-clause', label: 'OVER()' },
    // Set ops compose pipeline outputs
    { from: 'select-clause', to: 'union', label: 'compose' },
  ],
}
