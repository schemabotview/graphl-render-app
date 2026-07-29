import type { SceneSpec } from '../engine/types.ts'
import { container, group, wgrid, type NodeSeed } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, TEAL, YELLOW } from '../engine/colors.ts'

// The Java-on-the-JVM runtime on one wide map — ported from graphl-ux/src/scenes/
// java-jvm.ts (itself from NodeMap's `java.ts`). Top band: the source pipeline
// (.java → javac → .class) feeding the Class Loader Sub-System (loading ▸ linking ▸
// initialization). Middle band: the JVM memory areas (method/heap/stacks/PC/native).
// Bottom band: the Execution Engine (interpreter + JIT + GC), JNI, and native libs.
// A CPU layer is the hardware boundary. Same node ids as the source so manifest
// highlight/focus wiring transfers.
//
// graphl-movie engine adaptations (as in spark-architecture.ts): `wgrid` is imported
// from patterns.ts (not a local shim); graphl-ux `kind: 'label'` leaves render as
// `term` chips (movie has no 'label' kind); edges drop per-edge `color` (uniform
// gray); the SceneSpec drops `topic`/`subtitle`.

// A COMPONENT leaf — icon glyph + label (graphl-ux `symbol`, NodeMap's default box).
// `icon` is an optional lucide glyph name from engine/icons.tsx, drawn above the label
// (or to its LEFT when `inline` — for short-but-wide boxes where icon-over-label crowds).
const comp = (id: string, label: string, color: string, icon?: string, inline?: boolean): NodeSeed => ({
  id, label, color, kind: 'symbol', icon, iconInline: inline, cell: [0, 0],
})

// Was graphl-ux `kind: 'label'` (bare text) — rendered here as a `term` chip (no
// 'label' kind). Used for the tiny per-thread stack-frame abbreviations (LVA/OA/FD).
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term', cell: [0, 0] })

// =============== TOP: source pipeline + class loader sub-system ===============

const pipeline = group(
  'j-pipeline',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.35, padding: 0 }, [
    { node: comp('j-source-code', 'Java src (.java)', GRAY, 'file'), at: [0, 0] },
    { node: comp('javac', 'javac', GRAY, 'gears'), at: [0, 1] },
    { node: comp('j-class-file', '.class file', YELLOW, 'box'), at: [0, 2] },
  ]),
)

const loading = container(
  { id: 'j-loading', label: 'Loading', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('j-bootstrap-cl', 'Boot Strap CL', BLUE, 'autoload', true), at: [0, 0] },
    { node: comp('j-extension-cl', 'Extension CL', BLUE, 'autoload', true), at: [0, 1] },
    { node: comp('j-application-cl', 'Application CL', BLUE, 'autoload', true), at: [0, 2] },
  ]),
)

const linking = container(
  { id: 'j-linking', label: 'Linking', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('j-verify', 'Verify', BLUE, 'shield', true), at: [0, 0] },
    { node: comp('j-prepare', 'Prepare', BLUE, 'gears', true), at: [0, 1] },
    { node: comp('j-resolve', 'Resolve', BLUE, 'plug', true), at: [0, 2] },
  ]),
)

const classLoaderSubSystem = container(
  { id: 'j-classloader-subsystem', label: 'Class Loader Sub-System', color: TEAL },
  wgrid({ cols: [1.4, 1.4, 1.6], rows: [1], gap: 0.3, padding: 0.2 }, [
    { node: loading, at: [0, 0] },
    { node: linking, at: [1, 0] },
    { node: comp('j-initialization', 'Initialization', GRAY, 'workflow'), at: [2, 0] },
  ]),
)

const top = group(
  'j-top',
  wgrid({ cols: [3.5, 14], rows: [1], gap: 0.5, padding: 0 }, [
    { node: pipeline, at: [0, 0] },
    { node: classLoaderSubSystem, at: [1, 0] },
  ]),
)

// =============== MIDDLE: Memory Area of JVM ===============

const methodArea = container(
  { id: 'j-method-area', label: 'Method Area', color: PURPLE },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.4 }, [
    { node: comp('j-class-data', 'Class Data', BLUE, 'layers'), at: [0, 0] },
  ]),
)

const heapArea = container(
  { id: 'j-heap-area', label: 'Heap Area', color: PURPLE },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.4 }, [
    { node: comp('j-object-data', 'Object Data', BLUE, 'box'), at: [0, 0] },
  ]),
)

const threadStack = (id: string, label: string, suffix: string) =>
  container(
    { id, label, color: BLUE },
    wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
      { node: lbl(`j-lva-${suffix}`, 'LVA', GRAY), at: [0, 0] },
      { node: lbl(`j-oa-${suffix}`, 'OA', GRAY), at: [0, 1] },
      { node: lbl(`j-fd-${suffix}`, 'FD', GRAY), at: [0, 2] },
    ]),
  )

const jvmStackArea = container(
  { id: 'j-jvm-stack-area', label: 'JVM Stack Area', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: threadStack('j-thread-1-stack', 'Thread 1 (Stack)', '1'), at: [0, 0] },
    { node: threadStack('j-thread-n-stack', 'Thread n (Stack)', 'n'), at: [1, 0] },
  ]),
)

const pcRegisters = container(
  { id: 'j-pc-registers', label: 'PC Registers', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('j-pc-reg-1', 'PC Reg T1', BLUE, 'clock'), at: [0, 0] },
    { node: comp('j-pc-reg-n', 'PC Reg Tn', BLUE, 'clock'), at: [0, 1] },
  ]),
)

const nativeMethodStacks = container(
  { id: 'j-native-method-stacks', label: 'Native Method Stacks', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('j-native-invoke-1', 'Native T1', BLUE, 'plug'), at: [0, 0] },
    { node: comp('j-native-invoke-n', 'Native Tn', BLUE, 'plug'), at: [0, 1] },
  ]),
)

const memoryArea = container(
  { id: 'j-memory-area', label: 'Memory Area Of JVM', color: TEAL },
  wgrid({ cols: [1.6, 1.6, 3.4, 1.6, 1.8], rows: [1], gap: 0.3, padding: 0.2 }, [
    { node: methodArea, at: [0, 0] },
    { node: heapArea, at: [1, 0] },
    { node: jvmStackArea, at: [2, 0] },
    { node: pcRegisters, at: [3, 0] },
    { node: nativeMethodStacks, at: [4, 0] },
  ]),
)

// =============== BOTTOM: Execution Engine + JNI + Native libs ===============

const jitCompiler = container(
  { id: 'j-jit-compiler', label: 'JIT Compiler', color: ORANGE },
  wgrid({ cols: [1.6, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.2 }, [
    { node: comp('j-intermediate-code-gen', 'Intermediate Code Gen', BLUE, 'gears', true), at: [0, 0] },
    { node: comp('j-code-optimizer', 'Code Optimizer', BLUE, 'gears', true), at: [0, 1] },
    { node: comp('j-target-code-gen', 'Target Code Gen', BLUE, 'gears', true), at: [0, 2] },
    { node: comp('j-profiler', 'Profiler', GRAY, 'barChart'), at: [1, 0, 1, 3] },
  ]),
)

const executionEngine = container(
  { id: 'j-exec-engine', label: 'Execution Engine', color: TEAL },
  wgrid({ cols: [1, 2.5, 1], rows: [1], gap: 0.3, padding: 0.2 }, [
    { node: comp('j-interpreter', 'Interpreter', GRAY, 'terminal'), at: [0, 0] },
    { node: jitCompiler, at: [1, 0] },
    { node: comp('j-gc', 'Garbage Collector', GREEN, 'funnel'), at: [2, 0] },
  ]),
)

const bottom = group(
  'j-bottom',
  wgrid({ cols: [8.5, 2.5, 2.5], rows: [1], gap: 0.45, padding: 0 }, [
    { node: executionEngine, at: [0, 0] },
    { node: comp('j-jni', 'JNI', BLUE, 'plug'), at: [1, 0] },
    { node: comp('j-native-method-libs', 'Native Libs', BLUE, 'layers'), at: [2, 0] },
  ]),
)

// =============== CPU LAYER (hardware boundary) ===============

const cpuLayer = group(
  'j-cpu-layer',
  wgrid({ cols: [1], rows: [1], gap: 0, padding: 0 }, [
    { node: comp('j-cpu', 'CPU (Processor)', PURPLE, 'engine'), at: [0, 0] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'java-root',
  wgrid({ cols: [1], rows: [4.5, 5, 5, 1.5], gap: 0.5, padding: 0.02 }, [
    { node: top, at: [0, 0] },
    { node: memoryArea, at: [0, 1] },
    { node: bottom, at: [0, 2] },
    { node: cpuLayer, at: [0, 3] },
  ]),
)

export const javaJvm: SceneSpec = {
  id: 'java-jvm',
  title: 'Java on the JVM',
  // Taller-than-16:9 canvas (~6:5): fills the scene pane's vertical space; accepts a
  // little left/right pillarbox in the 16:9 frame.
  canvas: { width: 1440, height: 1180 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // pipeline
    { from: 'j-source-code', to: 'javac', label: 'compile' },
    { from: 'javac', to: 'j-class-file', label: 'emit' },
    { from: 'j-class-file', to: 'j-bootstrap-cl', label: 'load' },

    // class loader: loading -> linking -> initialization
    { from: 'j-bootstrap-cl', to: 'j-extension-cl', label: 'delegate' },
    { from: 'j-extension-cl', to: 'j-application-cl', label: 'delegate' },
    { from: 'j-application-cl', to: 'j-verify', label: 'link' },
    { from: 'j-verify', to: 'j-prepare', label: 'next' },
    { from: 'j-prepare', to: 'j-resolve', label: 'next' },
    { from: 'j-resolve', to: 'j-initialization', label: 'init' },

    // class loader -> memory area
    { from: 'j-initialization', to: 'j-class-data', label: 'register' },
    { from: 'j-class-data', to: 'j-object-data', label: 'new()' },

    // memory <-> execution engine
    { from: 'j-class-data', to: 'j-interpreter', label: 'bytecode' },
    { from: 'j-thread-1-stack', to: 'j-object-data', label: 'ref' },
    { from: 'j-pc-reg-1', to: 'j-thread-1-stack', label: 'next instr' },

    // JIT internals
    { from: 'j-interpreter', to: 'j-intermediate-code-gen', label: 'hot path' },
    { from: 'j-intermediate-code-gen', to: 'j-code-optimizer', label: 'IR' },
    { from: 'j-code-optimizer', to: 'j-target-code-gen', label: 'optimize' },
    { from: 'j-profiler', to: 'j-code-optimizer', label: 'hot info' },

    // GC reclaims heap
    { from: 'j-gc', to: 'j-object-data', label: 'sweep' },

    // JNI + native libs
    { from: 'j-exec-engine', to: 'j-jni', label: 'native call' },
    { from: 'j-jni', to: 'j-native-method-libs', label: 'invoke' },
    { from: 'j-native-invoke-1', to: 'j-jni', label: 'native frame' },

    // execution -> CPU
    { from: 'j-target-code-gen', to: 'j-cpu', label: 'native code' },
    { from: 'j-interpreter', to: 'j-cpu', label: 'interpret' },
    { from: 'j-native-method-libs', to: 'j-cpu', label: 'syscall' },
  ],
}
