import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, wgrid } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, TEAL, YELLOW } from '../engine/colors.ts'

// The SHARED Data Vault master map for the Data Warehousing concept
// (data-warehousing-ct), module 07 (Data Vault Modeling). It draws the Jabra Sales
// vault as an ERD — the hub / link / satellite skeleton the md sketches in miniature
// (07-02) — so all ten sections ride THIS scene and spotlight their own tables/rows via
// the manifest `focus`/`highlight`, exactly like `star-schema` serves modules 02–06/08.
// Node ids are STABLE so wiring transfers. The vault collapses back into that very
// star: hub+sat → dimension, link+measure-sat → fact (07-09).
//
// Data Vault models everything with THREE table types, one concern each:
//   HUB       identity      — the unique business keys of an entity (keys only)
//   LINK      relationship  — a connection/transaction between hubs (keys only, N:M)
//   SATELLITE context+time  — the descriptive attributes/measures, full history
// Container COLOR encodes the table type; ROW color encodes the column's role, and a
// legend spells the notation out:
//   BLUE container  HUB          ORANGE container  LINK        PURPLE container  SATELLITE
//   YELLOW  hash key (·HK)   — the deterministic surrogate PK on every hub & link
//   BLUE    foreign hash (·FK) — a link's rays into the hubs it ties together
//   GRAY    business key (·BK) / descriptive attribute
//   TEAL    load metadata     — load_date / hash_diff / record_source (audit + history)
//   GREEN   additive measure (Σ) — the relationship's numbers, in the link's satellite
// ≤~5 hues read at once; focus dims the rest so one table/row shines.

// ── a table ROW: a term chip = column NAME (left) + its data TYPE / role (right). ──
const row = (id: string, label: string, color: string, type?: string): SceneNodeSpec => ({ id, label, color, type, kind: 'term', cell: [0, 0] })

/** Build an ERD table: a titled container whose children are stacked column rows. */
const table = (id: string, title: string, color: string, rows: SceneNodeSpec[]): SceneNodeSpec =>
  container(
    { id, label: title, color },
    wgrid(
      { cols: 1, rows: rows.length, gap: 0.14, padding: 0.16 },
      rows.map((r, i) => ({ node: r, at: [0, i] as SceneNodeSpec['cell'] })),
    ),
  )

// ── HUBS — identity only: a bare list of unique business keys + load metadata. ─────
const hubCustomer = table('hub-customer', 'HubCustomer', BLUE, [
  row('hubc-hk', 'customer_hk', YELLOW, 'hash HK'),
  row('hubc-bk', 'customer_id', GRAY, 'varchar BK'),
  row('hubc-load', 'load_date', TEAL, 'ts'),
  row('hubc-src', 'record_source', TEAL, 'varchar'),
])

const hubOrder = table('hub-order', 'HubOrder', BLUE, [
  row('hubo-hk', 'order_hk', YELLOW, 'hash HK'),
  row('hubo-bk', 'order_id', GRAY, 'varchar BK'),
  row('hubo-load', 'load_date', TEAL, 'ts'),
  row('hubo-src', 'record_source', TEAL, 'varchar'),
])

const hubProduct = table('hub-product', 'HubProduct', BLUE, [
  row('hubp-hk', 'product_hk', YELLOW, 'hash HK'),
  row('hubp-bk', 'product_id', GRAY, 'varchar BK'),
  row('hubp-load', 'load_date', TEAL, 'ts'),
  row('hubp-src', 'record_source', TEAL, 'varchar'),
])

// ── LINKS — relationships between hubs, keys only, always modelled many-to-many. ───
const linkOrderCustomer = table('link-order-customer', 'LinkOrderCustomer', ORANGE, [
  row('loc-hk', 'order_customer_hk', YELLOW, 'hash HK'),
  row('loc-order', 'order_hk', BLUE, 'hash FK'),
  row('loc-cust', 'customer_hk', BLUE, 'hash FK'),
  row('loc-load', 'load_date', TEAL, 'ts'),
  row('loc-src', 'record_source', TEAL, 'varchar'),
])

const linkOrderLine = table('link-order-line', 'LinkOrderLine  ·  grain: order line', ORANGE, [
  row('lol-hk', 'order_line_hk', YELLOW, 'hash HK'),
  row('lol-order', 'order_hk', BLUE, 'hash FK'),
  row('lol-product', 'product_hk', BLUE, 'hash FK'),
  row('lol-load', 'load_date', TEAL, 'ts'),
  row('lol-src', 'record_source', TEAL, 'varchar'),
])

// ── SATELLITES — all descriptive data & measures, keyed by (parent_hk, load_date):
// many rows per parent, one per point in time → native SCD-2, no bolt-on. ──────────
const satCustomer = table('sat-customer', 'SatCustomer', PURPLE, [
  row('satc-hk', 'customer_hk', BLUE, 'hash FK·PK'),
  row('satc-load', 'load_date', TEAL, 'ts PK'),
  row('satc-diff', 'hash_diff', TEAL, 'hash'),
  row('satc-src', 'record_source', TEAL, 'varchar'),
  row('satc-name', 'name', GRAY, 'varchar'),
  row('satc-email', 'email', GRAY, 'varchar'),
  row('satc-seg', 'segment', GRAY, 'varchar'),
  row('satc-city', 'city', GRAY, 'varchar'),
])

const satOrder = table('sat-order', 'SatOrder', PURPLE, [
  row('sato-hk', 'order_hk', BLUE, 'hash FK·PK'),
  row('sato-load', 'load_date', TEAL, 'ts PK'),
  row('sato-diff', 'hash_diff', TEAL, 'hash'),
  row('sato-src', 'record_source', TEAL, 'varchar'),
  row('sato-date', 'order_date', GRAY, 'date'),
  row('sato-status', 'order_status', GRAY, 'varchar'),
  row('sato-channel', 'channel', GRAY, 'varchar'),
])

const satProduct = table('sat-product', 'SatProduct', PURPLE, [
  row('satp-hk', 'product_hk', BLUE, 'hash FK·PK'),
  row('satp-load', 'load_date', TEAL, 'ts PK'),
  row('satp-diff', 'hash_diff', TEAL, 'hash'),
  row('satp-src', 'record_source', TEAL, 'varchar'),
  row('satp-name', 'name', GRAY, 'varchar'),
  row('satp-cat', 'category', GRAY, 'varchar'),
  row('satp-price', 'list_price', GRAY, 'decimal'),
])

// ── SatSalesMeasures — a satellite on the LINK: the relationship's measures live
// here (a link carries no numbers itself). This is the fact-in-waiting (07-09). ────
const satMeasures = table('sat-measures', 'SatSalesMeasures', PURPLE, [
  row('satm-hk', 'order_line_hk', BLUE, 'hash FK·PK'),
  row('satm-load', 'load_date', TEAL, 'ts PK'),
  row('satm-diff', 'hash_diff', TEAL, 'hash'),
  row('satm-src', 'record_source', TEAL, 'varchar'),
  row('satm-qty', 'quantity', GREEN, 'int Σ'),
  row('satm-price', 'unit_price', GREEN, 'decimal'),
  row('satm-total', 'line_total', GREEN, 'decimal Σ'),
])

// ── Legend — the notation the diagram uses, spelled out as a single bottom row. ─────
const legend = container(
  { id: 'legend', label: 'Legend', color: GRAY },
  wgrid({ cols: 6, rows: 1, gap: 0.1, padding: 0.1 }, [
    { node: row('lg-hk', 'HK · hash key (PK)', YELLOW), at: [0, 0] },
    { node: row('lg-bk', 'BK · business key / attr', GRAY), at: [1, 0] },
    { node: row('lg-fk', 'FK · hash → hub', BLUE), at: [2, 0] },
    { node: row('lg-meta', 'load meta · history + audit', TEAL), at: [3, 0] },
    { node: row('lg-m', 'Σ · additive measure', GREEN), at: [4, 0] },
    { node: row('lg-type', 'HUB · LINK · SAT = box color', GRAY), at: [5, 0] },
  ]),
)

// ── the board — the hub spine, links between, satellites hanging off. ─────────────
export const datavaultModel: SceneSpec = {
  id: 'datavault-model',
  title: 'Jabra Sales Data Vault',
  // Wide vault board (5 cols × 4 rows). The middle row is the hub/link SPINE; the top
  // row carries the hubs' satellites; SatSalesMeasures hangs below the order-line link;
  // a short bottom row carries the legend as one full-width strip.
  canvas: { width: 2200, height: 1520 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [
    {
      id: 'vault',
      label: 'Jabra Sales Vault — hubs · links · satellites',
      color: GRAY,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: [1, 1, 1, 1, 1], rows: [1.2, 1, 1, 0.28], gap: 0.34, padding: 0.34 },
      children: [
        // top row — the hubs' descriptive satellites, above their hubs
        { ...satCustomer, cell: [0, 0] },
        { ...satOrder, cell: [2, 0] },
        { ...satProduct, cell: [4, 0] },
        // middle row — the SPINE: hubs anchored, links tying them together
        { ...hubCustomer, cell: [0, 1] },
        { ...linkOrderCustomer, cell: [1, 1] },
        { ...hubOrder, cell: [2, 1] },
        { ...linkOrderLine, cell: [3, 1] },
        { ...hubProduct, cell: [4, 1] },
        // third row — the measure satellite hanging off the order-line link
        { ...satMeasures, cell: [3, 2] },
        // bottom row — legend as a single full-width strip
        { ...legend, cell: [0, 3, 5, 1] },
      ],
    },
  ],
  edges: [
    // Links → the hubs they tie together (each is a hash FK → hub hash PK).
    { from: 'link-order-customer', to: 'hub-customer', label: 'customer_hk' },
    { from: 'link-order-customer', to: 'hub-order', label: 'order_hk' },
    { from: 'link-order-line', to: 'hub-order', label: 'order_hk' },
    { from: 'link-order-line', to: 'hub-product', label: 'product_hk' },
    // Satellites → their parent (hub or link), attached by the parent's hash key.
    { from: 'sat-customer', to: 'hub-customer', label: 'customer_hk' },
    { from: 'sat-order', to: 'hub-order', label: 'order_hk' },
    { from: 'sat-product', to: 'hub-product', label: 'product_hk' },
    { from: 'sat-measures', to: 'link-order-line', label: 'order_line_hk' },
  ],
}
