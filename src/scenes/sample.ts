import type { SceneSpec } from '../engine/types.ts'
import { BLUE, GREEN } from '../engine/colors.ts'

// A small hard-coded scene to exercise the engine: a classic STAR SCHEMA — a central
// fact table (GREEN = the measured data) ringed by dimension tables (BLUE = context),
// wrapped in a container. Canvas aspect ≈ the left scene pane (near-square) so cells
// stay square when fitView scales it in. Focus §: the fact table.
export const sampleScene: SceneSpec = {
  id: 'sample',
  title: 'Star schema',
  canvas: { width: 1080, height: 1000 },
  grid: { cols: 1, rows: 1, gap: 0.2, padding: 0.4 },
  nodes: [
    {
      id: 'star',
      label: 'Star Schema',
      color: BLUE,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: 3, rows: 3, gap: 0.45, padding: 0.6 },
      children: [
        { id: 'dim-date', label: 'dim_date', sub: 'day · month · year', icon: 'clock', color: BLUE, cell: [1, 0] },
        { id: 'dim-product', label: 'dim_product', sub: 'sku · category', icon: 'box', color: BLUE, cell: [0, 1] },
        { id: 'fact-sales', label: 'sales_fact', sub: 'measures + FKs', icon: 'table', color: GREEN, cell: [1, 1] },
        { id: 'dim-customer', label: 'dim_customer', sub: 'name · segment', icon: 'users', color: BLUE, cell: [2, 1] },
        { id: 'dim-store', label: 'dim_store', sub: 'region · type', icon: 'server', color: BLUE, cell: [1, 2] },
      ],
    },
  ],
  edges: [
    { from: 'dim-date', to: 'fact-sales' },
    { from: 'dim-product', to: 'fact-sales' },
    { from: 'dim-customer', to: 'fact-sales' },
    { from: 'dim-store', to: 'fact-sales' },
  ],
}
