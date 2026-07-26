import type { SceneSpec } from '../engine/types.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, YELLOW } from '../engine/colors.ts'

// The WHOLE data-warehouse system on one wide map — the "big picture" mental model for
// the Data Warehousing concept (data-warehousing-ct). Left-to-right dataflow:
//   Source Systems → ETL/ELT (staging → transform) → Data Warehouse (facts + dims)
//   → Data Marts → BI & Consumers,
// with a Data Lake band (raw / ELT / lakehouse) and a Metadata & Catalog governance
// strip underneath. Modules 01 (foundations), 09 (ETL/ELT) and 10 (cloud & MPP) ride
// this scene; the camera frames one subsystem per section via the manifest
// `highlight`/`focus`. Node ids are stable so the wiring transfers:
//   src-oltp/src-files/src-apps · staging · transform · warehouse (fact/dim) ·
//   marts (mart-sales/finance/mktg) · bi (bi-reports/olap/ml) · lake · metadata.
//
// Semantic colors (colors.ts): sources GRAY (inert upstream), OLTP BLUE (its own role),
// staging/lake ORANGE (raw landing / I/O), transform TEAL-family via GREEN pipeline,
// warehouse YELLOW (curated store) holding GREEN facts + BLUE dims, marts GREEN
// (served data), BI PURPLE (presentation), metadata GRAY (supporting).
export const dwArchitecture: SceneSpec = {
  id: 'dw-architecture',
  title: 'Data Warehouse Architecture',
  // ~2:1 wide map; aspect ≈ the inner grid so cells stay square when fitView scales in.
  canvas: { width: 1600, height: 780 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [
    {
      id: 'dw',
      label: 'Data Warehouse Architecture',
      color: GRAY,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: [3, 2.6, 3, 2.6, 2.8], rows: [5, 1.7], gap: 0.4, padding: 0.4 },
      children: [
        // --- Source systems (upstream, operational) -------------------------
        {
          id: 'sources',
          label: 'Source Systems',
          color: GRAY,
          kind: 'container',
          cell: [0, 0],
          layout: { cols: 1, rows: 3, gap: 0.3, padding: 0.4 },
          children: [
            { id: 'src-oltp', label: 'OLTP Databases', sub: 'operational · row-by-row', icon: 'database', color: BLUE, cell: [0, 0] },
            { id: 'src-files', label: 'Files & APIs', sub: 'CSV · JSON · logs', icon: 'file', color: GRAY, cell: [0, 1] },
            { id: 'src-apps', label: 'SaaS Apps', sub: 'CRM · ERP', icon: 'app', color: GRAY, cell: [0, 2] },
          ],
        },
        // --- ETL / ELT pipeline --------------------------------------------
        {
          id: 'pipeline',
          label: 'ETL / ELT',
          color: GREEN,
          kind: 'container',
          cell: [1, 0],
          layout: { cols: 1, rows: [1, 1], gap: 0.4, padding: 0.4 },
          children: [
            { id: 'staging', label: 'Staging Area', sub: 'raw landing', icon: 'disk', color: ORANGE, cell: [0, 0] },
            { id: 'transform', label: 'Transform', sub: 'clean · conform', icon: 'funnel', color: GREEN, cell: [0, 1] },
          ],
        },
        // --- The warehouse core --------------------------------------------
        {
          id: 'warehouse',
          label: 'Data Warehouse',
          color: YELLOW,
          kind: 'container',
          cell: [2, 0],
          layout: { cols: 1, rows: [1, 1], gap: 0.35, padding: 0.45 },
          children: [
            { id: 'fact', label: 'Fact tables', sub: 'measures', icon: 'table', color: GREEN, cell: [0, 0] },
            { id: 'dim', label: 'Dimensions', sub: 'context', icon: 'layers', color: BLUE, cell: [0, 1] },
          ],
        },
        // --- Data marts (departmental subsets) -----------------------------
        {
          id: 'marts',
          label: 'Data Marts',
          color: GREEN,
          kind: 'container',
          cell: [3, 0],
          layout: { cols: 1, rows: 3, gap: 0.3, padding: 0.4 },
          children: [
            { id: 'mart-sales', label: 'Sales', icon: 'barChart', color: GREEN, cell: [0, 0] },
            { id: 'mart-finance', label: 'Finance', icon: 'barChart', color: GREEN, cell: [0, 1] },
            { id: 'mart-mktg', label: 'Marketing', icon: 'barChart', color: GREEN, cell: [0, 2] },
          ],
        },
        // --- BI & consumers ------------------------------------------------
        {
          id: 'bi',
          label: 'BI & Consumers',
          color: PURPLE,
          kind: 'container',
          cell: [4, 0],
          layout: { cols: 1, rows: 3, gap: 0.3, padding: 0.4 },
          children: [
            { id: 'bi-reports', label: 'Dashboards', sub: 'reports', icon: 'report', color: PURPLE, cell: [0, 0] },
            { id: 'bi-olap', label: 'Ad-hoc / OLAP', sub: 'slice · dice', icon: 'barChart', color: PURPLE, cell: [0, 1] },
            { id: 'bi-ml', label: 'Data Science', sub: 'ML', icon: 'brain', color: PURPLE, cell: [0, 2] },
          ],
        },
        // --- Bottom band: raw lake + governance strip ----------------------
        { id: 'lake', label: 'Data Lake', sub: 'raw · all formats', icon: 'lake', color: ORANGE, kind: 'symbol', cell: [0, 1, 2, 1] },
        { id: 'metadata', label: 'Metadata & Catalog', sub: 'lineage · governance', icon: 'scroll', color: GRAY, kind: 'symbol', cell: [2, 1, 3, 1] },
      ],
    },
  ],
  edges: [
    // Extract: sources → staging
    { from: 'src-oltp', to: 'staging', label: 'extract' },
    { from: 'src-files', to: 'staging', label: 'extract' },
    { from: 'src-apps', to: 'staging', label: 'extract' },
    // Transform → load into the warehouse
    { from: 'staging', to: 'transform', label: 'stage' },
    { from: 'transform', to: 'fact', label: 'load' },
    { from: 'transform', to: 'dim', label: 'load' },
    // Serve: warehouse → marts → BI
    { from: 'warehouse', to: 'marts', label: 'subset' },
    { from: 'marts', to: 'bi', label: 'query' },
    // Data lake: raw land + ELT path
    { from: 'src-files', to: 'lake', label: 'raw' },
    { from: 'lake', to: 'transform', label: 'ELT' },
  ],
}
