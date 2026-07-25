import type { SceneSpec } from '../engine/types.ts'
import { sampleScene } from './sample.ts'

// App-owned scene registry: the manifest references a scene by id (a string), and the
// app resolves it here. Scenes are TypeScript (not content) — the React Flow diagram
// IS the app's contribution. Register a new scene by adding it to this map.
const scenes: Record<string, SceneSpec> = {
  sample: sampleScene,
}

export const getScene = (id: string): SceneSpec | undefined => scenes[id]

export const sceneIds = (): string[] => Object.keys(scenes)
