import { SceneViewer } from '../engine/SceneViewer'
import { getScene } from '../scenes'

/**
 * The left pane — renders a scene through the engine. For the scaffold it shows the
 * `sample` star-schema scene with the fact table focused, exercising the grid resolver,
 * styled nodes, floating edges, and the camera/highlight choreography. Later slices
 * pick the scene + focus/highlight per section from the manifest.
 */
export default function ScenePane() {
  const scene = getScene('sample')!
  return <SceneViewer scene={scene} focus="fact-sales" highlight={['fact-sales']} />
}
