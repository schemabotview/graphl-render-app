import { SceneViewer } from '../engine/SceneViewer'
import type { SceneSpec } from '../engine/types'

// Left pane — the visual scene (React Flow node-graph). The scene comes from the app
// registry (by the section's manifest `scene` id); highlight/focus drive spotlight +
// camera per section. A section whose scene isn't registered yet shows a placeholder.
interface ScenePaneProps {
  width: number
  scene?: SceneSpec
  highlight?: string[]
  focus?: string | string[]
}

export default function ScenePane({ width, scene, highlight, focus }: ScenePaneProps) {
  return (
    <section className="relative h-full shrink-0 bg-scene" style={{ width }}>
      {scene ? (
        <SceneViewer scene={scene} highlight={highlight} focus={focus} />
      ) : (
        <div className="grid h-full place-items-center text-role-gray/50">Scene coming soon</div>
      )}
    </section>
  )
}
