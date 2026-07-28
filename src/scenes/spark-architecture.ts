import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, wgrid, type NodeSeed, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// The WHOLE Spark system on one 16:9 map — ported from graphl-ux/src/scenes/
// spark-architecture.ts (itself from NodeMap's `spark.ts`). This is the "big picture"
// mental model: Master Node (driver → Catalyst → Tungsten → DAG → schedulers),
// Cluster Mgr, two Worker Nodes (A batch / B streaming), Output Modes, and the
// data plane (sources → lakehouse). Modules 01–02 ride this scene; the camera frames
// one subsystem per section via the manifest `highlight`/`focus`. Same node ids as the
// source so the wiring transfers.
//
// Port transforms vs. graphl-ux (mirror the databricks-platform port):
//   - `wgrid` imported from patterns.ts (graphl-ux inlined it).
//   - graphl-ux `kind: 'label'` leaves (stage partitions, tasks) → `term` chips
//     (this engine's NodeKind has no 'label').
//   - graphl-movie HAS YELLOW, so the storage/format nodes graphl-ux forced to ORANGE
//     are restored to YELLOW (Gold layer, the storage-layer buckets, HDFS/S3 sources,
//     Local Disk) — matching the fixed palette (YELLOW = storage formats + gold).
//   - SceneSpec drops `topic`/`subtitle`; edges drop per-edge `color` (uniform gray).

const G = 0.2
const P = 0.3

/**
 * A COMPONENT leaf — an icon glyph + label (`symbol`). Use for parts of the system
 * that do/hold/flow something (Driver, Executor, Kafka, Bronze, …). The glyph derives
 * initials from the label unless an `icon` is given.
 */
const comp = (id: string, label: string, color: string, icon?: string): NodeSeed => ({
  id,
  label,
  color,
  kind: 'symbol',
  cell: [0, 0],
  ...(icon ? { icon } : {}),
})

/**
 * A CHIP — a filled chip whose text IS the value (`term`). Use for enumerated options
 * (the streaming Output Modes append/update/complete) and, since this engine has no
 * bare-`label` kind, also for the plain leaf enumerations (stage partitions, tasks).
 */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term', cell: [0, 0] })

/** A bare enumeration leaf — was graphl-ux `kind: 'label'`, rendered here as a `term` chip. */
const lbl = (id: string, label: string, color: string): NodeSeed => chip(id, label, color)

const wg = (spec: WeightedSpec, children: WeightedSeed[]) => wgrid(spec, children)

// --- Master Node: the driver-side control plane ------------------------------

const catalyst = container(
  { id: 'catalyst', label: 'Catalyst Optimizer', color: PURPLE },
  wg({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.25 }, [
    { node: comp('logical-plan', 'Logical Plan', BLUE, 'layers'), at: [0, 0] },
    { node: comp('analyzed-plan', 'Analyzed Plan', BLUE, 'layers'), at: [1, 0] },
    { node: comp('optimized-plan', 'Optimized Plan', BLUE, 'funnel'), at: [2, 0] },
    { node: comp('physical-plan', 'Physical Plan', BLUE, 'layers'), at: [3, 0] },
  ]),
)

const stage1 = container(
  { id: 'stage-1', label: 'Stage 1', color: ORANGE },
  wg({ cols: [1], rows: [1, 1, 1], gap: 0.1, padding: 0.18 }, [
    { node: lbl('stage1-p0', 'P0', ORANGE), at: [0, 0] },
    { node: lbl('stage1-p1', 'P1', ORANGE), at: [0, 1] },
    { node: lbl('stage1-p2', 'P2', ORANGE), at: [0, 2] },
  ]),
)

const stage2 = container(
  { id: 'stage-2', label: 'Stage 2', color: RED },
  wg({ cols: [1], rows: [1, 1, 1], gap: 0.1, padding: 0.18 }, [
    { node: lbl('stage2-g0', 'G0', RED), at: [0, 0] },
    { node: lbl('stage2-g1', 'G1', RED), at: [0, 1] },
    { node: lbl('stage2-g2', 'G2', RED), at: [0, 2] },
  ]),
)

const tasks = container(
  { id: 'tasks', label: 'Tasks', color: TEAL },
  wg({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.2 }, [
    { node: lbl('task-p0', 'Task p0', TEAL), at: [0, 0] },
    { node: lbl('task-p1', 'Task p1', TEAL), at: [0, 1] },
    { node: lbl('task-p2', 'Task p2', TEAL), at: [0, 2] },
    { node: lbl('task-p3', 'Task p3', TEAL), at: [0, 3] },
  ]),
)

const dagScheduler = container(
  { id: 'dag-scheduler', label: 'DAG Scheduler', color: TEAL },
  wg({ cols: [0.7, 1.2, 0.4, 1.2, 1.2], rows: [1], gap: 0.15, padding: 0.25 }, [
    { node: comp('job', 'Job', ORANGE, 'workflow'), at: [0, 0] },
    { node: stage1, at: [1, 0] },
    { node: comp('shuffle', 'Shuffle', RED, 'share'), at: [2, 0] },
    { node: stage2, at: [3, 0] },
    { node: tasks, at: [4, 0] },
  ]),
)

const streamingCoord = container(
  { id: 'streaming-coord', label: 'Streaming Coordinator', color: TEAL },
  wg({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.25 }, [
    { node: comp('trigger', 'Trigger', TEAL, 'clock'), at: [0, 0] },
    { node: comp('offset-log', 'Offset Log', TEAL, 'file'), at: [1, 0] },
    { node: comp('global-watermark', 'Global Watermark', TEAL, 'stream'), at: [2, 0] },
    { node: comp('commit-log', 'Commit Log', TEAL, 'file'), at: [3, 0] },
  ]),
)

const master = container(
  // NOTE on padding: the resolver pads by a fraction of a CELL, so on a 1-column
  // stack a NodeMap-style 0.3 becomes a huge side gutter. Keep it small here so the
  // children use the column's full width.
  { id: 'master', label: 'Master Node', color: ORANGE },
  // Bigger gap so the vertical control-flow edges (driver → session, etc.) have room
  // to draw between the stacked boxes; leaf-chip rows trimmed to 0.8 so the single-line
  // chips aren't taller than they need to be.
  wg({ cols: [1], rows: [0.8, 0.8, 2.5, 0.8, 2.5, 1, 1.5], gap: 0.45, padding: 0.08 }, [
    { node: comp('driver', 'Driver Program', ORANGE, 'gears'), at: [0, 0] },
    { node: comp('session', 'SparkSession', BLUE, 'plug'), at: [0, 1] },
    { node: catalyst, at: [0, 2] },
    { node: comp('tungsten', 'Tungsten Engine', PURPLE, 'engine'), at: [0, 3] },
    { node: dagScheduler, at: [0, 4] },
    { node: comp('task-scheduler', 'TaskScheduler', BLUE, 'workflow'), at: [0, 5] },
    { node: streamingCoord, at: [0, 6] },
  ]),
)

// --- Cluster Manager: the deployment backends --------------------------------

const clusterMgr = container(
  { id: 'cluster-mgr', label: 'Cluster Mgr', color: BLUE },
  // Symbol leaves (icon glyph + label) so the deployment backends read as identities,
  // not bare text. Small padding (1-column stack — see Master note) so labels
  // ("standalone", "Databricks") stay wide enough not to clip.
  wg({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: 0.08 }, [
    { node: comp('mode-local', 'local', GRAY, 'app'), at: [0, 0] },
    { node: comp('mode-standalone', 'standalone', BLUE, 'server'), at: [0, 1] },
    { node: comp('mode-yarn', 'YARN', ORANGE, 'server'), at: [0, 2] },
    { node: comp('mode-k8s', 'k8s', PURPLE, 'server'), at: [0, 3] },
    { node: comp('mode-databricks', 'Databricks', RED, 'cloud'), at: [0, 4] },
  ]),
)

// --- Worker Node: one factory for both A (batch) and B (streaming) -----------

const worker = (s: 'a' | 'b', label: 'A' | 'B', mode: 'batch' | 'streaming'): SceneNodeSpec => {
  const streaming = mode === 'streaming'

  const heap = container(
    { id: `heap-${s}`, label: 'Heap (Block Mgr)', color: BLUE },
    wg({ cols: [2.8, 1.4], rows: [1], gap: G, padding: P }, [
      {
        node: container(
          { id: `unified-${s}`, label: 'Unified Memory', color: BLUE },
          wg({ cols: [1, 1], rows: [1], gap: G, padding: P }, [
            { node: comp(`execution-${s}`, 'Execution', PURPLE, 'memory'), at: [0, 0] },
            { node: comp(`storage-${s}`, 'Storage', GREEN, 'memory'), at: [1, 0] },
          ]),
        ),
        at: [0, 0],
      },
      { node: comp(`user-code-${s}`, 'User Code', ORANGE, 'file'), at: [1, 0] },
    ]),
  )

  const children: WeightedSeed[] = [
    // Executor is the big box (spans 3 rows); the cores are short chips on the bottom
    // row, aligned with Local Disk in the right column.
    { node: comp(`exec-${s}`, 'Executor', PURPLE, 'server'), at: [0, 0, 2, 3] },
    { node: comp(`core1-${s}`, 'Core 1', RED, 'engine'), at: [0, 3, 1, 1] },
    { node: comp(`core2-${s}`, 'Core 2', RED, 'engine'), at: [1, 3, 1, 1] },
    { node: heap, at: [2, 0, 1, 3] },
    { node: comp(`local-disk-${s}`, 'Local Disk', YELLOW, 'disk'), at: [2, 3] },
  ]

  if (streaming) {
    children.push({
      node: container(
        { id: `stateful-ops-${s}`, label: 'Stateful Ops', color: TEAL },
        wg({ cols: [1, 1, 1, 1], rows: [1], gap: G, padding: P }, [
          { node: comp(`local-watermark-${s}`, 'Local Watermark', TEAL, 'stream'), at: [0, 0] },
          { node: comp(`window-state-${s}`, 'Window State', TEAL, 'streaming'), at: [1, 0] },
          { node: comp(`rocksdb-${s}`, 'RocksDB', TEAL, 'database'), at: [2, 0] },
          { node: comp(`state-snapshot-${s}`, 'State Snapshot', TEAL, 'copy'), at: [3, 0] },
        ]),
      ),
      at: [0, 4, 3, 1],
    })
  }

  return container(
    { id: `worker-${s}`, label: `Worker Node ${label} (${streaming ? 'Streaming' : 'Batch'})`, color: GREEN },
    wg(
      { cols: [1.2, 1.2, 4.8], rows: streaming ? [1, 1, 1, 1, 1.5] : [1, 1, 1, 1], gap: G, padding: P },
      children,
    ),
  )
}

// --- Output Modes & the data plane (sources → lakehouse) ---------------------

const outputModes = container(
  { id: 'output-modes', label: 'Output Modes', color: GREEN },
  wg({ cols: [1, 1, 1], rows: [1], gap: 0.3, padding: 0.25 }, [
    { node: chip('mode-append', 'append', GREEN), at: [0, 0] },
    { node: chip('mode-update', 'update', GREEN), at: [1, 0] },
    { node: chip('mode-complete', 'complete', GREEN), at: [2, 0] },
  ]),
)

const dataSources = container(
  { id: 'data-sources', label: 'Data Sources', color: TEAL },
  wg({ cols: [1, 1, 1], rows: [1, 1], gap: 0.25, padding: 0.3 }, [
    { node: comp('hdfs', 'HDFS', YELLOW, 'lake'), at: [0, 0] },
    { node: comp('s3', 'S3', YELLOW, 'cloud'), at: [1, 0] },
    { node: comp('jdbc', 'JDBC', BLUE, 'database'), at: [2, 0] },
    { node: comp('kafka-src', 'Kafka', TEAL, 'stream'), at: [0, 1] },
    { node: comp('delta-src', 'Delta', TEAL, 'database'), at: [1, 1] },
    { node: comp('file-src', 'Files', TEAL, 'file'), at: [2, 1] },
  ]),
)

const storageLayer = container(
  { id: 'storage-layer', label: 'Storage Layer', color: GRAY },
  wg({ cols: [1, 1, 1], rows: [1], gap: 0.25, padding: 0.25 }, [
    { node: comp('storage-hdfs', 'HDFS', YELLOW, 'lake'), at: [0, 0] },
    { node: comp('storage-adls', 'ADLS', YELLOW, 'cloud'), at: [1, 0] },
    { node: comp('storage-s3', 'S3', YELLOW, 'cloud'), at: [2, 0] },
  ]),
)

const lakehouse = container(
  { id: 'lakehouse', label: 'Lakehouse (Delta Lake)', color: BLUE },
  wg({ cols: [1, 1, 1], rows: [0.8, 1.3, 0.7, 1.2], gap: 0.25, padding: 0.3 }, [
    { node: comp('unity-catalog', 'Unity Catalog', PURPLE, 'federation'), at: [0, 0, 3, 1] },
    { node: comp('bronze', 'Bronze', ORANGE, 'layers'), at: [0, 1] },
    { node: comp('silver', 'Silver', GRAY, 'layers'), at: [1, 1] },
    { node: comp('gold', 'Gold', YELLOW, 'layers'), at: [2, 1] },
    { node: comp('delta-log', 'Delta Log', BLUE, 'file'), at: [0, 2, 3, 1] },
    { node: storageLayer, at: [0, 3, 3, 1] },
  ]),
)

// Invisible wrapper — just sub-arranges its three regions left→right with a wide
// center weight on the lakehouse.
const dataPlane = group(
  'data-plane',
  wg({ cols: [3, 1.5, 7], rows: [1], gap: 0.4, padding: 0 }, [
    { node: dataSources, at: [0, 0] },
    { node: comp('shared-checkpoint', 'Shared Checkpoint', GRAY, 'file'), at: [1, 0] },
    { node: lakehouse, at: [2, 0] },
  ]),
)

// --- The outer frame: all six regions on the 16:9 architecture grid ----------

const architecture = container(
  { id: 'spark', label: 'Spark Architecture', color: ORANGE },
  wg({ cols: [7, 2, 9, 9], rows: [8, 2, 5], gap: 0.4, padding: 0.4 }, [
    { node: master, at: [0, 0, 1, 3] },
    { node: clusterMgr, at: [1, 0] },
    { node: worker('a', 'A', 'batch'), at: [2, 0] },
    { node: worker('b', 'B', 'streaming'), at: [3, 0] },
    { node: outputModes, at: [3, 1] },
    { node: dataPlane, at: [2, 2, 2, 1] },
  ]),
)

export const sparkArchitecture: SceneSpec = {
  id: 'spark-architecture',
  title: 'Spark Architecture',
  // 16:9 canvas so the wide architecture grid (~27×15) renders with square cells.
  canvas: { width: 1424, height: 960 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [architecture],
  edges: [
    // Driver-side plan → schedule (shared by batch & streaming)
    { from: 'driver', to: 'session', label: 'init' },
    { from: 'session', to: 'logical-plan', label: 'DataFrame' },
    { from: 'session', to: 'job', label: 'RDD' },
    // Catalyst's four plans sit in a strict left→right row inside the box, so the
    // resolve/optimize/cost edges between adjacent chips were self-explanatory and
    // their labels overprinted the plan names — dropped. Keep physical→tungsten (codegen),
    // which crosses out of the box.
    { from: 'physical-plan', to: 'tungsten', label: 'codegen' },
    { from: 'tungsten', to: 'job', label: 'execute' },
    // DAG scheduler's job→stage-1→shuffle→stage-2→tasks is likewise a left→right row;
    // the split/wide/regroup/taskset edges were redundant with the layout and clipped
    // the chips. Keep tasks→task-scheduler (submit), which crosses out of the box.
    { from: 'tasks', to: 'task-scheduler', label: 'submit' },
    { from: 'task-scheduler', to: 'cluster-mgr', label: 'request' },
    { from: 'cluster-mgr', to: 'exec-a', label: 'launch' },
    { from: 'cluster-mgr', to: 'exec-b', label: 'launch' },
    // exec→core1 "run" dropped: the cores sit inside the executor's own worker box, so
    // the arrow only overprinted Core 1 with a self-evident label.

    // Worker A — batch ingestion into Bronze
    { from: 'hdfs', to: 'core1-a', label: 'read partition' },
    { from: 's3', to: 'core2-a', label: 'read partition' },
    { from: 'exec-a', to: 'bronze', label: 'batch write' },

    // Worker B — streaming ingestion into Bronze
    { from: 'kafka-src', to: 'exec-b', label: 'micro-batch' },
    { from: 'delta-src', to: 'exec-b', label: 'CDC' },
    { from: 'exec-b', to: 'output-modes', label: 'streaming write' },
    { from: 'output-modes', to: 'bronze', label: 'stream write' },

    // Medallion ETL: Bronze → Silver → Gold
    { from: 'bronze', to: 'silver', label: 'cleanse' },
    { from: 'silver', to: 'gold', label: 'aggregate' },

    // Driver-side streaming coordination (touches Worker B only)
    { from: 'trigger', to: 'session', label: 'fire batch' },
    { from: 'offset-log', to: 'shared-checkpoint', label: 'plan offsets' },
    { from: 'commit-log', to: 'shared-checkpoint', label: 'mark done' },
    { from: 'local-watermark-b', to: 'global-watermark', label: 'report max' },

    // State path on Worker B: the Stateful Ops chips (window → rocksdb → snapshot) sit in
    // a left→right row, so the store/snapshot edges between them were redundant with the
    // layout and overprinted the chips — dropped. Keep the edge that leaves the box:
    { from: 'state-snapshot-b', to: 'shared-checkpoint', label: 'write state' },
  ],
}
