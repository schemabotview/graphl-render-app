import type { SceneNodeSpec } from './types.ts'

// The spotlight set for a section. Spotlighting a container also lights its children,
// so an author can name the box and not enumerate every chip inside it. Returns null
// when nothing is highlighted (the scene then renders at full strength).
export function expandHighlight(
  nodes: SceneNodeSpec[],
  highlight?: string[],
): Set<string> | null {
  if (!highlight?.length) return null
  const lit = new Set(highlight)

  const addDescendants = (n: SceneNodeSpec) => {
    for (const c of n.children ?? []) {
      lit.add(c.id)
      addDescendants(c)
    }
  }
  const visit = (n: SceneNodeSpec) => {
    if (lit.has(n.id)) addDescendants(n)
    n.children?.forEach(visit)
  }
  nodes.forEach(visit)
  return lit
}
