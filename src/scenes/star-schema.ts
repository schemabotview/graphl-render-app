import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, wgrid } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, YELLOW } from '../engine/colors.ts'

// The SHARED dimensional master map for the Data Warehousing concept
// (data-warehousing-ct): one Sales STAR SCHEMA on a 3×3 board, sourced from
// ../ITC-bigdata/data-modeling-markdown/jabra-spain-dw-model.dbml (Jabra Spain
// e-commerce DW). Modules 02 (normalization & keys), 03 (facts), 04 (dimensions),
// 05 (star & snowflake), 06 (SCD) and 08 (designing a model) all ride THIS scene and
// spotlight their own region via the manifest `focus`/`highlight` — so the learner
// builds one retained picture. Node ids are STABLE so that wiring transfers.
//
// What the star deliberately shows (so future sections have something to point at):
//   • fact         — FactSales at the center: grain caption, FK block (the star's
//                    rays), degenerate dimensions, and additive measures.
//   • dim-*        — five conformed/denormalized dimensions radiating out; the
//                    fact→dim edges are the FK→PK links (labeled with the key column).
//   • dim-category — a normalized OUTRIGGER off DimProduct (the snowflake beat, Mod 05).
//   • SK / NK      — every dim shows its surrogate PK (YELLOW) beside the retained
//                    natural key (GRAY): the Module-02 keys story.
//   • SCD2         — DimCustomer / DimProduct carry effective/expiry/current (PURPLE):
//                    the Module-06 history story.
//   • degenerate   — order_id / order_status live ON the fact (ORANGE), no dim table.
//   • legend       — a small notation key (SK/NK/DD/SCD2) so the diagram self-explains.
//
// Semantic colors (colors.ts): fact + measures GREEN (data/measures), dimensions BLUE
// (context), keys/PK YELLOW (the gold key), natural keys + legend GRAY (supporting),
// SCD2 control columns PURPLE (versioned history), degenerate dims ORANGE (carried on
// the fact). ≤~5 hues read at once; focus dims the rest to let one region shine.

// ── leaf helpers ──────────────────────────────────────────────────────────────
/** A filled mono chip whose text IS the column/value (`term`). */
const chip = (id: string, label: string, color: string): SceneNodeSpec => ({ id, label, color, kind: 'term', cell: [0, 0] })

// ── the central fact ────────────────────────────────────────────────────────────
// FactSales — grain: one order line. Holds the three things every fact table holds:
// foreign keys to dimensions (the star's rays), degenerate dimensions (order header
// ids kept on the fact), and the numeric measures (additive here).
const fact = container(
  { id: 'fact', label: 'FactSales', color: GREEN },
  wgrid({ cols: 1, rows: [0.62, 1, 0.72, 1], gap: 0.28, padding: 0.34 }, [
    { node: { id: 'fact-grain', label: 'Grain: one order line', sub: 'one product on one order', color: GRAY, kind: 'symbol', cell: [0, 0] }, at: [0, 0] },
    {
      node: container(
        { id: 'fact-fks', label: 'Foreign keys → dimensions', color: BLUE },
        wgrid({ cols: 5, rows: 1, gap: 0.18, padding: 0.14 }, [
          { node: chip('fk-date', 'date_key', BLUE), at: [0, 0] },
          { node: chip('fk-customer', 'customer_key', BLUE), at: [1, 0] },
          { node: chip('fk-product', 'product_key', BLUE), at: [2, 0] },
          { node: chip('fk-channel', 'channel_key', BLUE), at: [3, 0] },
          { node: chip('fk-promo', 'promotion_key', BLUE), at: [4, 0] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'fact-degen', label: 'Degenerate dimensions', color: ORANGE },
        wgrid({ cols: 2, rows: 1, gap: 0.18, padding: 0.14 }, [
          { node: chip('dd-order', 'order_id', ORANGE), at: [0, 0] },
          { node: chip('dd-status', 'order_status', ORANGE), at: [1, 0] },
        ]),
      ),
      at: [0, 2],
    },
    {
      node: container(
        { id: 'fact-measures', label: 'Measures (additive Σ)', color: GREEN },
        wgrid({ cols: 3, rows: 1, gap: 0.18, padding: 0.14 }, [
          { node: chip('m-qty', 'quantity', GREEN), at: [0, 0] },
          { node: chip('m-tax', 'tax_amount', GREEN), at: [1, 0] },
          { node: chip('m-total', 'line_total', GREEN), at: [2, 0] },
        ]),
      ),
      at: [0, 3],
    },
  ]),
)

// ── the dimensions ───────────────────────────────────────────────────────────────
// DimDate — the universal, conformed, role-playing dimension (order/ship/pay date all
// point here). Its key is a YYYYMMDD surrogate.
const dimDate = container(
  { id: 'dim-date', label: 'DimDate', color: BLUE },
  wgrid({ cols: 1, rows: 3, gap: 0.2, padding: 0.24 }, [
    { node: chip('dimd-pk', 'date_key · PK', YELLOW), at: [0, 0] },
    { node: chip('dimd-attr', 'year · quarter · month · day', BLUE), at: [0, 1] },
    { node: chip('dimd-role', 'role-play: order / ship / pay', GRAY), at: [0, 2] },
  ]),
)

// DimCustomer — SCD Type 2 + the surrogate-vs-natural key showcase.
const dimCustomer = container(
  { id: 'dim-customer', label: 'DimCustomer', color: BLUE },
  wgrid({ cols: 2, rows: 2, gap: 0.2, padding: 0.24 }, [
    { node: chip('dimc-pk', 'customer_key · SK', YELLOW), at: [0, 0] },
    { node: chip('dimc-nk', 'customer_id · NK', GRAY), at: [1, 0] },
    { node: chip('dimc-attr', 'name · segment · city', BLUE), at: [0, 1] },
    { node: chip('dimc-scd', 'SCD2: eff · exp · current', PURPLE), at: [1, 1] },
  ]),
)

// DimProduct — SCD Type 2, and the source of the snowflake outrigger.
const dimProduct = container(
  { id: 'dim-product', label: 'DimProduct', color: BLUE },
  wgrid({ cols: 2, rows: 2, gap: 0.2, padding: 0.24 }, [
    { node: chip('dimpr-pk', 'product_key · SK', YELLOW), at: [0, 0] },
    { node: chip('dimpr-nk', 'product_id · NK', GRAY), at: [1, 0] },
    { node: chip('dimpr-attr', 'line · brand · price', BLUE), at: [0, 1] },
    { node: chip('dimpr-scd', 'SCD2: eff · exp · current', PURPLE), at: [1, 1] },
  ]),
)

// DimCategory — a NORMALIZED outrigger off DimProduct: snowflaking one branch of the
// hierarchy out into its own table (Module 05, star vs snowflake).
const dimCategory = container(
  { id: 'dim-category', label: 'DimCategory · outrigger', color: BLUE },
  wgrid({ cols: 1, rows: 2, gap: 0.2, padding: 0.24 }, [
    { node: chip('dimcat-pk', 'category_key · PK', YELLOW), at: [0, 0] },
    { node: chip('dimcat-attr', 'category · department', BLUE), at: [0, 1] },
  ]),
)

const dimChannel = container(
  { id: 'dim-channel', label: 'DimChannel', color: BLUE },
  wgrid({ cols: 1, rows: 2, gap: 0.2, padding: 0.24 }, [
    { node: chip('dimch-pk', 'channel_key · SK', YELLOW), at: [0, 0] },
    { node: chip('dimch-attr', 'channel · type', BLUE), at: [0, 1] },
  ]),
)

const dimPromotion = container(
  { id: 'dim-promotion', label: 'DimPromotion', color: BLUE },
  wgrid({ cols: 2, rows: 1, gap: 0.2, padding: 0.24 }, [
    { node: chip('dimpm-pk', 'promotion_key · SK', YELLOW), at: [0, 0] },
    { node: chip('dimpm-attr', 'name · discount', BLUE), at: [1, 0] },
  ]),
)

// A small always-on notation key so the schema self-explains.
const legend = container(
  { id: 'legend', label: 'Notation', color: GRAY },
  wgrid({ cols: 2, rows: 2, gap: 0.2, padding: 0.24 }, [
    { node: chip('lg-sk', 'SK = surrogate PK', YELLOW), at: [0, 0] },
    { node: chip('lg-nk', 'NK = natural key', GRAY), at: [1, 0] },
    { node: chip('lg-dd', 'DD = degenerate', ORANGE), at: [0, 1] },
    { node: chip('lg-scd', 'SCD2 = history', PURPLE), at: [1, 1] },
  ]),
)

// ── the board ──────────────────────────────────────────────────────────────────
export const starSchema: SceneSpec = {
  id: 'star-schema',
  title: 'Sales Star Schema',
  // Near-square board (3 cols × 3 rows). Center column/row are widened so the fact
  // has room for its four inner blocks; aspect ≈ the weighted grid so cells stay tidy.
  canvas: { width: 1720, height: 1120 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [
    {
      id: 'star',
      label: 'Sales Star — FactSales · Jabra Spain',
      color: GRAY,
      kind: 'container',
      cell: [0, 0],
      layout: { cols: [1, 1.5, 1], rows: [1, 1.35, 1], gap: 0.4, padding: 0.42 },
      children: [
        // top row
        { ...legend, cell: [0, 0] },
        { ...dimDate, cell: [1, 0] },
        { ...dimCategory, cell: [2, 0] },
        // middle row — the fact at the hub
        { ...dimCustomer, cell: [0, 1] },
        { ...fact, cell: [1, 1] },
        { ...dimProduct, cell: [2, 1] },
        // bottom row
        { ...dimChannel, cell: [0, 2] },
        { ...dimPromotion, cell: [1, 2] },
        // [2,2] left open for breathing room
      ],
    },
  ],
  edges: [
    // The star's rays — each is a FK → dimension PK link, labeled with the key column.
    { from: 'fact', to: 'dim-date', label: 'date_key' },
    { from: 'fact', to: 'dim-customer', label: 'customer_key' },
    { from: 'fact', to: 'dim-product', label: 'product_key' },
    { from: 'fact', to: 'dim-channel', label: 'channel_key' },
    { from: 'fact', to: 'dim-promotion', label: 'promotion_key' },
    // The snowflake outrigger — DimProduct normalized out to DimCategory.
    { from: 'dim-product', to: 'dim-category', label: 'snowflake', animated: false },
  ],
}
