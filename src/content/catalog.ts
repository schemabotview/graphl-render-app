// Concept registry (app-owned): concept id → where its content repo lives. The app
// fetches manifest / slides / audio from a concept's contentBaseUrl at runtime; the
// app itself bundles no content. Scenes stay app-owned (src/scenes), referenced by id.

/** Top-level index grouping. The course index renders categories in `CATEGORY_ORDER`. */
export type Category =
  | 'Engineering'
  | 'Systems'
  | 'Cloud'
  | 'Languages'
  | 'Frameworks'
  | 'Data'
  | 'AI/ML'

/** Render order for the course index; empty categories are simply skipped. */
export const CATEGORY_ORDER: Category[] = [
  'AI/ML',
  'Data',
  'Frameworks',
  'Languages',
  'Cloud',
  'Systems',
  'Engineering',
]

export interface Concept {
  id: string
  label: string
  /** Which course-index group this concept lives under. */
  category: Category
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
    category: 'Data',
    contentBaseUrl: `${RAW}/schemabotview/data-warehousing-ct/main`,
    accent: '#5b8cff', // blue
    accentDeep: '#101a2e',
  },
  'apache-spark': {
    id: 'apache-spark',
    label: 'Apache Spark',
    category: 'Frameworks',
    contentBaseUrl: `${RAW}/schemabotview/apache-spark-ct/main`,
    accent: '#ff7a3d', // Spark orange, lifted for dark
    accentDeep: '#2a1408',
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    category: 'Data',
    contentBaseUrl: `${RAW}/schemabotview/sql-ct/main`,
    accent: '#3fd0d6', // teal — query / data flow, distinct from DW blue
    accentDeep: '#08262a',
  },
  python: {
    id: 'python',
    label: 'Python',
    category: 'Languages',
    contentBaseUrl: `${RAW}/schemabotview/python-ct/main`,
    accent: '#ffd54a', // Python gold — distinct from DW blue / SQL teal / Spark orange
    accentDeep: '#2a2208',
  },
  linux: {
    id: 'linux',
    label: 'Linux',
    category: 'Systems',
    contentBaseUrl: `${RAW}/schemabotview/linux-ct/main`,
    accent: '#37d39a', // terminal green
    accentDeep: '#08281d',
  },
  kubernetes: {
    id: 'kubernetes',
    label: 'Kubernetes',
    category: 'Systems',
    contentBaseUrl: `${RAW}/schemabotview/kubernetes-ct/main`,
    accent: '#5a8bff', // Kubernetes helm-blue, lifted for dark
    accentDeep: '#0c1730',
  },
  aws: {
    id: 'aws',
    label: 'AWS Solutions Architect',
    category: 'Cloud',
    contentBaseUrl: `${RAW}/schemabotview/aws-ct/main`,
    accent: '#ff9900', // AWS orange
    accentDeep: '#2a1a02',
  },
  docker: {
    id: 'docker',
    label: 'Docker',
    category: 'Systems',
    contentBaseUrl: `${RAW}/schemabotview/docker-ct/main`,
    accent: '#2aa4f4', // Docker blue, lifted for dark
    accentDeep: '#07202f',
  },
  'databricks-data-engineer': {
    id: 'databricks-data-engineer',
    label: 'Databricks Data Engineer',
    category: 'Data',
    contentBaseUrl: `${RAW}/schemabotview/databricks-data-engineer-ct/main`,
    accent: '#ff3621', // Databricks lava red
    accentDeep: '#2c0a06',
  },
  java: {
    id: 'java',
    label: 'Java',
    category: 'Languages',
    contentBaseUrl: `${RAW}/schemabotview/java-ct/main`,
    accent: '#e76f00', // Java coffee-orange
    accentDeep: '#2a1403',
  },
}

export const getConcept = (id: string): Concept | undefined => catalog[id]
