import { SceneViewer } from '../engine/SceneViewer'
import type { SceneSpec } from '../engine/types'

/**
 * The left pane — renders a scene through the engine, with the section's focus/highlight.
 * When a section names a scene the app doesn't have in its registry yet, we show a calm
 * placeholder instead of an empty canvas (scenes are authored in a later slice).
 */
export default function ScenePane({
  scene,
  highlight,
  focus,
}: {
  scene?: SceneSpec
  highlight?: string[]
  focus?: string | string[]
}) {
  if (!scene) {
    return (
      <div className="grid h-full w-full place-items-center bg-scene text-sm text-role-gray">
        Scene coming soon
      </div>
    )
  }
  return <SceneViewer scene={scene} highlight={highlight} focus={focus} />
}
