// Hash router: the URL addresses one section as `#/<concept>/<module>/<section>`.
// This is how a viewer deep-links a lesson. Section is the file-stem slug (e.g.
// `01-01-the-problem-spark-solves`) — stable across refresh. Paging rewrites the hash
// via replaceState (no history spam, no reload).

export interface Route {
  concept: string
  module?: string
  section?: string
}

export function parseRoute(): Route {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  return { concept: parts[0] ?? '', module: parts[1], section: parts[2] }
}

export const formatRoute = (r: Route): string =>
  '#/' + [r.concept, r.module, r.section].filter(Boolean).join('/')

/** Update the URL without adding a history entry or firing a reload. */
export function writeRoute(r: Route): void {
  history.replaceState(null, '', formatRoute(r))
}
