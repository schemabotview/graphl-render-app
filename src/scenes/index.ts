import type { SceneSpec } from '../engine/types.ts'
import { sampleScene } from './sample.ts'
import { sparkArchitecture } from './spark-architecture.ts'
import { sparkBatchApi } from './spark-batch-api.ts'
import { sparkStreaming } from './spark-streaming.ts'
import { dwArchitecture } from './dw-architecture.ts'
import { starSchema } from './star-schema.ts'
import { datavaultModel } from './datavault-model.ts'
import { sqlMap } from './sql-map.ts'

// App-owned scene registry: the manifest references a scene by id (a string), and the
// app resolves it here. Scenes are TypeScript (not content) — the React Flow diagram
// IS the app's contribution. The Apache Spark concept (apache-spark-ct) rides three
// scenes: `spark-architecture` (the cluster), `spark-batch-api` (the DataFrame API),
// and `spark-streaming`. The Data Warehousing concept (data-warehousing-ct) rides
// `dw-architecture` (the warehouse system map) for modules 01/09/10 and `star-schema`
// (the shared Sales dimensional model) for modules 02–06/08, and `datavault-model`
// (the Jabra Sales vault — hubs/links/satellites) for module 07. The SQL concept
// (sql-ct) rides ONE scene, `sql-map` (the whole SQL landscape) — every module frames
// a region of it. Each is framed per section via the manifest's focus/highlight.
const scenes: Record<string, SceneSpec> = {
  [sampleScene.id]: sampleScene,
  [sparkArchitecture.id]: sparkArchitecture,
  [sparkBatchApi.id]: sparkBatchApi,
  [sparkStreaming.id]: sparkStreaming,
  [dwArchitecture.id]: dwArchitecture,
  [starSchema.id]: starSchema,
  [datavaultModel.id]: datavaultModel,
  [sqlMap.id]: sqlMap,
}

export const getScene = (id: string): SceneSpec | undefined => scenes[id]

export const sceneIds = (): string[] => Object.keys(scenes)
