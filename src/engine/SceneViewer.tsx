import { useEffect, useMemo, useState } from 'react'
import { ReactFlow, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { SceneSpec } from './types.ts'
import { resolveGrid, type Box } from './grid.ts'
import { expandHighlight } from './highlight.ts'
import { sceneDirection, toFlowNodes, toFlowEdges } from './sceneGraph.ts'
import { SceneNode } from './SceneNode.tsx'
import { FlowEdge } from './FlowEdge.tsx'
import './scene.css'

const nodeTypes = { scene: SceneNode }
const edgeTypes = { flow: FlowEdge }

// The camera lives INSIDE <ReactFlow> so `useReactFlow()` gives a live instance. It
// always frames the union of ALL node boxes — the WHOLE scene stays visible the entire
// section, so the viewer never loses the broader picture. Focus is expressed purely by
// brighten-focused + dim-the-rest (see scene.css), NOT by a camera zoom. Boxes come from
// the grid resolver, so we fitBounds our own rect — no dependence on RF measuring nodes.
function unionBox(bs: Box[]): { x: number; y: number; width: number; height: number } | null {
  if (!bs.length) return null
  const minX = Math.min(...bs.map((b) => b.x))
  const minY = Math.min(...bs.map((b) => b.y))
  const maxX = Math.max(...bs.map((b) => b.x + b.w))
  const maxY = Math.max(...bs.map((b) => b.y + b.h))
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function Camera({ boxes }: { boxes: Record<string, Box> }) {
  const rf = useReactFlow()

  useEffect(() => {
    const rect = unionBox(Object.values(boxes))
    if (!rect) return
    const id = requestAnimationFrame(() => rf.fitBounds(rect, { padding: 0.08, duration: 550 }))
    return () => cancelAnimationFrame(id)
  }, [boxes, rf])

  return null
}

export function SceneViewer({
  scene,
  highlight,
  focus,
}: {
  scene: SceneSpec
  highlight?: string[]
  focus?: string | string[]
}) {
  const direction = sceneDirection(scene)
  const boxes = useMemo(() => resolveGrid(scene.nodes, scene.grid, scene.canvas), [scene])

  const highlightKey = highlight?.join(',') ?? ''
  const focusKey = Array.isArray(focus) ? focus.join(',') : (focus ?? '')

  // Two-phase intro per section: 'overview' shows the WHOLE scene at full strength
  // (while the narration speaks the title), then after a beat we go 'focused' — the
  // camera Ken-Burns into the focus box and the highlight reveals (brighten + dim). A
  // section with no focus/highlight (a hook) stays in overview.
  const [phase, setPhase] = useState<'overview' | 'focused'>('overview')
  useEffect(() => {
    setPhase('overview')
    if (!focusKey && !highlightKey) return
    const t = setTimeout(() => setPhase('focused'), 2000)
    return () => clearTimeout(t)
  }, [scene, focusKey, highlightKey])

  const activeHighlight = phase === 'focused' ? highlight : undefined
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lit = useMemo(() => expandHighlight(scene.nodes, activeHighlight), [scene, phase, highlightKey])

  const nodes = useMemo(() => toFlowNodes(scene, boxes, direction, lit), [scene, boxes, direction, lit])
  const edges = useMemo(() => toFlowEdges(scene, lit), [scene, lit])

  return (
    <div className="scene-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={8}
      >
        <Camera boxes={boxes} />
      </ReactFlow>
    </div>
  )
}
