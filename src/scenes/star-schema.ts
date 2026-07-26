import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, wgrid } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, YELLOW } from '../engine/colors.ts'

// The SHARED dimensional master map for the Data Warehousing concept
// (data-warehousing-ct): the Sales STAR SCHEMA drawn as an ERD — every table is a
// titled box whose COLUMNS are listed as rows, exactly like the dbdiagram render of
// ../ITC-bigdata/data-modeling-markdown/jabra-spain-dw-model.dbml (Jabra Spain
// e-commerce DW). Modules 02 (normalization & keys), 03 (facts), 04 (dimensions),
// 05 (star & snowflake), 06 (SCD) and 08 (designing a model) all ride THIS scene and
// spotlight their own region/rows via the manifest `focus`/`highlight`. Node ids are
// STABLE so that wiring transfers.
//
// FactSales sits at the hub; its five dimensions radiate out, and each fact→dim edge
// is a foreign-key → surrogate-key link (labeled with the FK column). Row COLOR encodes
// the column's role, and a legend spells the code out:
//   YELLOW  surrogate key (·PK)   — the warehouse key every table is built on
//   BLUE    foreign key (·FK)     — the fact's rays into the dimensions
//   GRAY    natural key (·NK) / plain attribute
//   PURPLE  SCD Type 2 control column (effective / expiry / current)
//   ORANGE  degenerate dimension (·DD) — an id carried on the fact, no dim table
//   GREEN   additive measure (Σ)
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

// ── FactSales — grain: one order line (one product on one order). ─────────────────
// PK + five FKs (the star's rays) + degenerate dims (order header ids) + measures.
const fact = table('fact', 'FactSales  ·  grain: one order line', GREEN, [
  row('f-sales-key', 'sales_key', YELLOW, 'int PK'),
  row('f-date', 'order_date_key', BLUE, 'int FK'),
  row('f-customer', 'customer_key', BLUE, 'int FK'),
  row('f-product', 'product_key', BLUE, 'int FK'),
  row('f-channel', 'channel_key', BLUE, 'int FK'),
  row('f-promo', 'promotion_key', BLUE, 'int FK'),
  row('f-order-id', 'order_id', ORANGE, 'int DD'),
  row('f-status', 'order_status', ORANGE, 'varchar DD'),
  row('f-qty', 'quantity', GREEN, 'int Σ'),
  row('f-total', 'line_total', GREEN, 'decimal Σ'),
])

// ── DimDate — the conformed, role-playing date dimension (YYYYMMDD surrogate). ─────
const dimDate = table('dim-date', 'DimDate', BLUE, [
  row('dimd-key', 'date_key', YELLOW, 'int PK'),
  row('dimd-full', 'full_date', GRAY, 'date'),
  row('dimd-year', 'year', GRAY, 'int'),
  row('dimd-quarter', 'quarter', GRAY, 'int'),
  row('dimd-month', 'month_name', GRAY, 'varchar'),
  row('dimd-weekend', 'is_weekend', GRAY, 'bool'),
])

// ── DimCustomer — SCD Type 2; surrogate PK beside the retained natural key. ────────
const dimCustomer = table('dim-customer', 'DimCustomer', BLUE, [
  row('dimc-key', 'customer_key', YELLOW, 'int PK'),
  row('dimc-id', 'customer_id', GRAY, 'int NK'),
  row('dimc-name', 'name', GRAY, 'varchar'),
  row('dimc-seg', 'segment', GRAY, 'varchar'),
  row('dimc-city', 'city', GRAY, 'varchar'),
  row('dimc-eff', 'effective_date', PURPLE, 'date'),
  row('dimc-exp', 'expiry_date', PURPLE, 'date'),
  row('dimc-cur', 'is_current', PURPLE, 'bool'),
])

// ── DimProduct — SCD Type 2; surrogate PK + natural key + attributes. ──────────────
const dimProduct = table('dim-product', 'DimProduct', BLUE, [
  row('dimpr-key', 'product_key', YELLOW, 'int PK'),
  row('dimpr-id', 'product_id', GRAY, 'int NK'),
  row('dimpr-sku', 'sku', GRAY, 'varchar'),
  row('dimpr-line', 'product_line', GRAY, 'varchar'),
  row('dimpr-price', 'list_price', GRAY, 'decimal'),
  row('dimpr-eff', 'effective_date', PURPLE, 'date'),
  row('dimpr-exp', 'expiry_date', PURPLE, 'date'),
  row('dimpr-cur', 'is_current', PURPLE, 'bool'),
])

// ── DimChannel — a small conformed dimension. ─────────────────────────────────────
const dimChannel = table('dim-channel', 'DimChannel', BLUE, [
  row('dimch-key', 'channel_key', YELLOW, 'int PK'),
  row('dimch-name', 'channel_name', GRAY, 'varchar'),
  row('dimch-type', 'channel_type', GRAY, 'varchar'),
])

// ── DimPromotion — campaigns / discount codes. ────────────────────────────────────
const dimPromotion = table('dim-promotion', 'DimPromotion', BLUE, [
  row('dimpm-key', 'promotion_key', YELLOW, 'int PK'),
  row('dimpm-name', 'promotion_name', GRAY, 'varchar'),
  row('dimpm-dtype', 'discount_type', GRAY, 'varchar'),
  row('dimpm-dval', 'discount_value', GRAY, 'decimal'),
])

// ── Legend — the notation the diagram uses, spelled out as a single bottom row. ─────
const legend = container(
  { id: 'legend', label: 'Legend', color: GRAY },
  wgrid({ cols: 6, rows: 1, gap: 0.1, padding: 0.1 }, [
    { node: row('lg-sk', 'PK / SK · surrogate key', YELLOW), at: [0, 0] },
    { node: row('lg-nk', 'NK · natural key', GRAY), at: [1, 0] },
    { node: row('lg-fk', 'FK · foreign key', BLUE), at: [2, 0] },
    { node: row('lg-dd', 'DD · degenerate dim', ORANGE), at: [3, 0] },
    { node: row('lg-scd', 'SCD2 · history columns', PURPLE), at: [4, 0] },
    { node: row('lg-m', 'Σ · additive measure', GREEN), at: [5, 0] },
  ]),
)

// ── the board — FactSales at the hub, five dimensions radiating out. ──────────────
export const starSchema: SceneSpec = {
  id: 'star-schema',
  title: 'Sales Star Schema',
  // Tall-ish ERD board (3 cols × 4 rows). Center column is widened and the fact row
  // heightened so the fact + the two SCD2 dimensions have room for their column lists;
  // a short 4th row carries the legend as a single full-width strip.
  canvas: { width: 1600, height: 1780 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [
    {
      id: 'star',
      label: 'Sales Star — FactSales · Jabra Spain DW',
      color: GRAY,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: [1, 1.5, 1], rows: [1, 1.3, 0.8, 0.3], gap: 0.34, padding: 0.34 },
      children: [
        // top row — the date dimension centered above the hub
        { ...dimDate, cell: [1, 0] },
        // middle row — the fact at the hub, SCD2 dims left & right
        { ...dimCustomer, cell: [0, 1] },
        { ...fact, cell: [1, 1] },
        { ...dimProduct, cell: [2, 1] },
        // third row — the two smaller dimensions
        { ...dimChannel, cell: [0, 2] },
        { ...dimPromotion, cell: [1, 2] },
        // bottom row — legend as a single full-width strip
        { ...legend, cell: [0, 3, 3, 1] },
      ],
    },
  ],
  edges: [
    // The star's rays — each is a FK → dimension surrogate-PK link.
    { from: 'fact', to: 'dim-date', label: 'order_date_key' },
    { from: 'fact', to: 'dim-customer', label: 'customer_key' },
    { from: 'fact', to: 'dim-product', label: 'product_key' },
    { from: 'fact', to: 'dim-channel', label: 'channel_key' },
    { from: 'fact', to: 'dim-promotion', label: 'promotion_key' },
  ],
}
