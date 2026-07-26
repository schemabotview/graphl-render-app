// Concept registry (app-owned): concept id → where its content repo lives. The app
// fetches manifest / slides / audio from a concept's contentBaseUrl at runtime; the
// app itself bundles no content. Scenes stay app-owned (src/scenes), referenced by id.

export interface Concept {
  id: string
  label: string
  /** Base URL of the concept's content repo (raw GitHub), no trailing slash. */
  contentBaseUrl: string
  /** Topical brand accent (tuned for the dark frame) — the opener wash + banner pill. */
  accent: string
  /** A deep, low-luma tint of `accent` — the opener gradient's base. */
  accentDeep: string
}

const RAW = 'https://raw.githubusercontent.com'

// Content is always fetched from GitHub (owner's decision) — one repo per concept. To
// publish a content edit, push the concept's `-ct` repo. Some `-ct` repos may not exist
// yet; until they do, fetches 404 — expected for the current build phase.
export const catalog: Record<string, Concept> = {
  'data-warehousing': {
    id: 'data-warehousing',
    label: 'Data Warehousing',
    contentBaseUrl: `${RAW}/schemabotview/data-warehousing-ct/main`,
    accent: '#5b8cff', // blue
    accentDeep: '#101a2e',
  },
  'apache-spark': {
    id: 'apache-spark',
    label: 'Apache Spark',
    contentBaseUrl: `${RAW}/schemabotview/apache-spark-ct/main`,
    accent: '#ff7a3d', // Spark orange, lifted for dark
    accentDeep: '#2a1408',
  },
}

export const getConcept = (id: string): Concept | undefined => catalog[id]
