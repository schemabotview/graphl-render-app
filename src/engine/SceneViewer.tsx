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

// The camera lives INSIDE <ReactFlow> so `useReactFlow()` gives a live instance. By
// default it frames the union of ALL node boxes — the WHOLE scene stays visible the
// entire section, so the viewer never loses the broader picture, and focus is expressed
// purely by brighten-focused + dim-the-rest (see scene.css). A section may OPT IN to a
// camera push-in via `zoom`: once the intro flips to 'focused', the camera frames just
// the `focus` box(es) so dense scenes' inner labels become readable. Boxes come from the
// grid resolver, so we fitBounds our own rect — no dependence on RF measuring nodes.
type Rect = { x: number; y: number; width: number; height: number }

function unionBox(bs: Box[]): Rect | null {
  if (!bs.length) return null
  const minX = Math.min(...bs.map((b) => b.x))
  const minY = Math.min(...bs.map((b) => b.y))
  const maxX = Math.max(...bs.map((b) => b.x + b.w))
  const maxY = Math.max(...bs.map((b) => b.y + b.h))
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

// The context floor: a zoom-in never frames LESS than this fraction of the whole scene,
// so a small focus box doesn't fill the pane and wipe out the surrounding map. A tiny
// focus rect is grown (centered on the focus, clamped inside the scene) up to the floor;
// a focus rect already larger than the floor is left as-is. Lower = tighter zoom / less
// context; higher = gentler zoom / more of the bigger picture stays visible.
const MIN_FRAME_FRAC = 0.3

function withContextFloor(focus: Rect, full: Rect): Rect {
  const w = Math.min(Math.max(focus.width, full.width * MIN_FRAME_FRAC), full.width)
  const h = Math.min(Math.max(focus.height, full.height * MIN_FRAME_FRAC), full.height)
  const cx = focus.x + focus.width / 2
  const cy = focus.y + focus.height / 2
  // Center on the focus, then clamp so the grown frame stays within the scene bounds.
  const x = Math.max(full.x, Math.min(cx - w / 2, full.x + full.width - w))
  const y = Math.max(full.y, Math.min(cy - h / 2, full.y + full.height - h))
  return { x, y, width: w, height: h }
}

function Camera({
  boxes,
  focusKey,
  zoom,
  phase,
}: {
  boxes: Record<string, Box>
  focusKey: string
  zoom: boolean
  phase: 'overview' | 'focused'
}) {
  const rf = useReactFlow()

  useEffect(() => {
    const full = unionBox(Object.values(boxes))
    let rect = full
    let padding = 0.08
    // Push in to the focus box(es) only once focused — the overview beat still shows the
    // whole scene, then the camera Ken-Burns in. Missing focus ids fall back to overview.
    // The context floor caps the push-in so the surrounding map never fully leaves frame.
    if (zoom && phase === 'focused' && focusKey && full) {
      const framed = unionBox(focusKey.split(',').map((id) => boxes[id]).filter(Boolean) as Box[])
      if (framed) {
        rect = withContextFloor(framed, full)
        padding = 0.16
      }
    }
    if (!rect) return
    const id = requestAnimationFrame(() => rf.fitBounds(rect!, { padding, duration: 550 }))
    return () => cancelAnimationFrame(id)
  }, [boxes, focusKey, zoom, phase, rf])

  return null
}

export function SceneViewer({
  scene,
  highlight,
  focus,
  zoom = false,
}: {
  scene: SceneSpec
  highlight?: string[]
  focus?: string | string[]
  zoom?: boolean
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
        <Camera boxes={boxes} focusKey={focusKey} zoom={zoom} phase={phase} />
      </ReactFlow>
    </div>
  )
}
