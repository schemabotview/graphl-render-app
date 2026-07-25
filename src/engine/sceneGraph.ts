import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { SceneNodeSpec, SceneSpec } from './types.ts'
import { tracks, type Box } from './grid.ts'
import { GRAY, EDGE } from './colors.ts'
import type { SceneNodeData } from './SceneNode.tsx'

// Pure mapping: a resolved SceneSpec → the React Flow nodes[]/edges[] arrays.
// No React, no state — SceneViewer just memoizes the output of these two functions.

/** Wider-than-tall grids flow left→right (handles on L/R); else top→bottom. */
export const sceneDirection = (scene: SceneSpec): 'horizontal' | 'vertical' =>
  tracks(scene.grid.cols).length > tracks(scene.grid.rows).length ? 'horizontal' : 'vertical'

/** Flatten the scene tree, parent before each of its children (depth-first). */
function flatten(nodes: SceneNodeSpec[]): SceneNodeSpec[] {
  const out: SceneNodeSpec[] = []
  for (const n of nodes) {
    out.push(n)
    if (n.children?.length) out.push(...flatten(n.children))
  }
  return out
}

// `lit` = the spotlight set (null = nothing highlighted → full strength). A lit node
// shines; the rest dim. An edge is active when it touches a lit node, dimmed when a
// spotlight is on but it touches neither.
export function toFlowNodes(
  scene: SceneSpec,
  boxes: Record<string, Box>,
  direction: 'horizontal' | 'vertical',
  lit: Set<string> | null,
): Node<SceneNodeData>[] {
  return flatten(scene.nodes).map((n) => {
    const box = boxes[n.id]
    return {
      id: n.id,
      type: 'scene',
      position: { x: box.x, y: box.y },
      draggable: false,
      selectable: false,
      data: {
        label: n.label,
        sub: n.sub,
        icon: n.icon,
        iconInline: n.iconInline,
        mono: n.mono,
        color: n.color ?? GRAY,
        kind: n.kind ?? 'symbol',
        direction,
        width: box.w,
        height: box.h,
        highlighted: lit?.has(n.id) ?? false,
        dimmed: lit ? !lit.has(n.id) : false,
      },
    }
  })
}

// The ids of every container that ENCLOSES a lit node. `expandHighlight` propagates a
// spotlight downward (container → children) but never upward, so a lit child leaves its
// ancestor containers unlit. Edges attach to those ancestor containers, so without the
// upward closure a spotlight on a chip inside a lane never lights the lane's edges.
function ancestorsOfLit(nodes: SceneNodeSpec[], lit: Set<string>): Set<string> {
  const ancestors = new Set<string>()
  const visit = (n: SceneNodeSpec): boolean => {
    let hasLitDescendant = false
    for (const c of n.children ?? []) {
      if (visit(c)) hasLitDescendant = true
    }
    if (hasLitDescendant) ancestors.add(n.id)
    return hasLitDescendant || lit.has(n.id)
  }
  nodes.forEach(visit)
  return ancestors
}

export function toFlowEdges(scene: SceneSpec, lit: Set<string> | null): Edge[] {
  const ancestors = lit ? ancestorsOfLit(scene.nodes, lit) : null
  const touched = (id: string) => (lit?.has(id) ?? false) || (ancestors?.has(id) ?? false)
  return scene.edges.map((e, i) => {
    const active = lit ? touched(e.from) || touched(e.to) : false
    const dimmed = lit ? !active : false
    return {
      id: `${e.from}-${e.to}-${i}`,
      source: e.from,
      target: e.to,
      type: 'flow',
      data: { color: EDGE, animated: e.animated, label: e.label, active, dimmed },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE },
    }
  })
}
