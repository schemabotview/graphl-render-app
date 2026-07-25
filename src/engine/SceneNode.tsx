import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeKind } from './types.ts'
import { fitLabelPx, fitTitlePx } from './fitFont.ts'
import { getIcon } from './icons.tsx'
import { GRAY } from './colors.ts'

/** "ElastiCache" → "El": first letter capitalized, the rest to `count` lowercased.
 *  The service-tile monogram — first 2 letters by default. */
function deriveInitials(label: string, count = 2): string {
  const clean = label.replace(/[^a-zA-Z0-9]/g, '')
  if (!clean) return ''
  return clean.charAt(0).toUpperCase() + clean.slice(1, count).toLowerCase()
}

export interface SceneNodeData {
  label: string
  sub?: string
  icon?: string
  iconInline?: boolean
  mono?: boolean
  color: string
  kind: NodeKind
  /** Dominant flow direction of the scene, sets handle placement. */
  direction: 'horizontal' | 'vertical'
  width: number
  height: number
  /** This node is the current section's spotlight (brightens in its own color). */
  highlighted?: boolean
  /** A spotlight is active elsewhere; this node recedes. */
  dimmed?: boolean
  [key: string]: unknown
}

// One node in the scene: a calm filled block (symbol), a mono chip (term), or a
// titled box whose title rides the top-left border (container). Styling lives in
// scene.css, driven by the `--node-color` role hue.
export function SceneNode({ data }: NodeProps) {
  const d = data as SceneNodeData

  // A 'group' is an invisible arranger — it occupies its box (children are laid out
  // inside) but draws no chrome.
  if (d.kind === 'group') {
    return <div className="scene-node scene-node--group" style={{ width: d.width, height: d.height }} />
  }

  const horizontal = d.direction === 'horizontal'
  const isContainer = d.kind === 'container'
  const mono = d.kind === 'symbol' && !!d.mono
  const Icon = d.kind === 'symbol' ? getIcon(d.icon) : undefined
  const iconSize = Math.max(18, Math.min(Math.min(d.width, d.height) * 0.4, 48))
  // Inline (icon/badge-left) mode steals horizontal room from the label, so size the
  // font against the narrower label area to keep it inside the box.
  const inlineIcon = !!((Icon || mono) && d.iconInline)
  const labelWidth = inlineIcon ? Math.max(24, d.width - iconSize - 12) : d.width
  const font = isContainer
    ? fitTitlePx(d.label, d.width)
    : fitLabelPx(d.label, labelWidth, d.height, d.kind)

  return (
    <div
      className={`scene-node scene-node--${d.kind}${mono ? ' scene-node--mono' : ''}${inlineIcon ? ' scene-node--iconh' : ''}${d.highlighted ? ' scene-node--lit' : ''}${d.dimmed ? ' scene-node--dimmed' : ''}`}
      style={{ width: d.width, height: d.height, ['--node-color' as string]: d.color }}
    >
      <Handle
        type="target"
        position={horizontal ? Position.Left : Position.Top}
        className="scene-handle"
        isConnectable={false}
      />
      {isContainer ? (
        <span className="scene-node__title" style={{ fontSize: font }}>
          {d.label}
        </span>
      ) : (
        <>
          {mono ? (
            <span className="scene-node__mono" style={{ width: iconSize, height: iconSize, fontSize: iconSize * 0.42 }}>
              {Icon ? <Icon size={iconSize * 0.6} strokeWidth={2} /> : deriveInitials(d.label)}
            </span>
          ) : (
            Icon && <Icon className="scene-node__icon" size={iconSize} strokeWidth={1.75} />
          )}
          <span className="scene-node__label" style={{ fontSize: font }}>
            {d.label}
          </span>
          {d.sub && <span className="scene-node__sub">{d.sub}</span>}
        </>
      )}
      <Handle
        type="source"
        position={horizontal ? Position.Right : Position.Bottom}
        className="scene-handle"
        isConnectable={false}
      />
    </div>
  )
}

SceneNode.defaultColor = GRAY
