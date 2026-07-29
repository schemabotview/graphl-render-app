import type { SceneSpec } from '../engine/types.ts'
import { container, group, wgrid, type NodeSeed } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// Java's grammar of a program on one wide map — ported from graphl-ux/src/scenes/
// java-anatomy.ts (the code-free predecessor of java-model; the owner does NOT want
// code nodes in scenes). Four stacked rhythm rows on the left (Model ▸ Initialize ▸
// Transform ▸ Return) and a Memory side column on the right. Model is upstream of
// Initialize: you sketch the type hierarchy first, then instantiate. The Initialize
// row follows Java's binding grammar `[Modifier] Type Name = Value`. Same node ids as
// the source so manifest highlight/focus wiring transfers.
//
// graphl-movie engine adaptations (as in spark-architecture.ts): `wgrid` imported from
// patterns.ts; graphl-ux `kind: 'label'` leaves render as `term` chips (movie has no
// 'label' kind); edges drop per-edge `color`; the SceneSpec drops `topic`/`subtitle`.

// Was graphl-ux `kind: 'label'` (bare text) — rendered here as a `term` chip (no
// 'label' kind). The default for the enumerated tokens (keywords, types, ops) and the
// class-hierarchy boxes.
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term', cell: [0, 0] })

// A filled CHIP whose text IS the concept (graphl-ux `term`). Kept for the Return row.
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term', cell: [0, 0] })

// An icon glyph + label (graphl-ux `symbol`). Used for the Memory regions, which are
// concrete places data lives rather than language tokens. `icon` is a lucide glyph name
// (engine/icons.tsx), drawn above the label — these are tall boxes, so icon-above fits.
const sym = (id: string, label: string, color: string, icon?: string): NodeSeed => ({ id, label, color, kind: 'symbol', icon, cell: [0, 0] })

// =============== ROW 0: MODEL — class hierarchy ===============

const modelRow = container(
  { id: 'ja-model', label: 'Model — class hierarchy   |   abstract + interface ▸ class ▸ subclass', color: PURPLE },
  // Wide vertical gap so the three inheritance tiers (parents ▸ class ▸ subclass)
  // spread across the row's height and the extends/implements arrows have room.
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.7, padding: 0.4 }, [
    { node: lbl('ja-oop-animal', 'abstract class  Animal', PURPLE), at: [0, 0] },
    { node: lbl('ja-oop-walker', 'interface  Walker', PURPLE), at: [1, 0] },
    { node: lbl('ja-oop-mammal', 'class  Mammal   extends Animal   implements Walker', PURPLE), at: [0, 1, 2, 1] },
    { node: lbl('ja-oop-dog', 'class  Dog   extends Mammal', PURPLE), at: [0, 2, 2, 1] },
  ]),
)

// =============== ROW 1: INITIALIZE — anatomy of a binding ===============

const kind = container(
  { id: 'ja-kind', label: 'Modifier', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-bind-final', 'final', GRAY), at: [0, 0] },
    { node: lbl('ja-bind-static', 'static', GRAY), at: [0, 1] },
    { node: lbl('ja-bind-private', 'private', GRAY), at: [0, 2] },
  ]),
)

const typePrimitives = container(
  { id: 'ja-primitive', label: 'Primitives', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-prim-int', 'int', GRAY), at: [0, 0] },
    { node: lbl('ja-prim-long', 'long', GRAY), at: [0, 1] },
    { node: lbl('ja-prim-double', 'double', GRAY), at: [0, 2] },
    { node: lbl('ja-prim-float', 'float', GRAY), at: [0, 3] },
    { node: lbl('ja-prim-boolean', 'boolean', GRAY), at: [0, 4] },
    { node: lbl('ja-prim-char', 'char', GRAY), at: [0, 5] },
  ]),
)

const typeCollections = container(
  { id: 'ja-type-coll', label: 'Collections', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-coll-list', 'List', GRAY), at: [0, 0] },
    { node: lbl('ja-coll-deque', 'Deque', GRAY), at: [0, 1] },
    { node: lbl('ja-coll-map', 'Map', GRAY), at: [0, 2] },
    { node: lbl('ja-coll-set', 'Set', GRAY), at: [0, 3] },
  ]),
)

const typeOop = container(
  { id: 'ja-type-oop', label: 'OOP', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-class', 'class', GRAY), at: [0, 0] },
    { node: lbl('ja-interface', 'interface', GRAY), at: [0, 1] },
    { node: lbl('ja-abstract', 'abstract', GRAY), at: [0, 2] },
    { node: lbl('ja-record', 'record', GRAY), at: [0, 3] },
    { node: lbl('ja-enum', 'enum', GRAY), at: [0, 4] },
  ]),
)

const typeMeta = container(
  { id: 'ja-type-meta', label: 'Meta', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-generic', 'Generic<A>', GRAY), at: [0, 0] },
    { node: lbl('ja-sealed', 'sealed', GRAY), at: [0, 1] },
    { node: lbl('ja-array', 'Array', GRAY), at: [0, 2] },
    { node: lbl('ja-optional', 'Optional', GRAY), at: [0, 3] },
  ]),
)

const typeShapes = container(
  { id: 'ja-type', label: 'Type', color: PURPLE },
  wgrid({ cols: [0.6, 1, 1, 1.1, 1.1], rows: [1], gap: 0.2, padding: 0.2 }, [
    { node: lbl('ja-type-var', 'var', GRAY), at: [0, 0] },
    { node: typePrimitives, at: [1, 0] },
    { node: typeCollections, at: [2, 0] },
    { node: typeOop, at: [3, 0] },
    { node: typeMeta, at: [4, 0] },
  ]),
)

const value = container(
  { id: 'ja-value', label: 'Value', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.18, padding: 0.3 }, [
    { node: lbl('ja-value-primitive', "Primitive    42  true  'a'", GRAY), at: [0, 0] },
    { node: lbl('ja-value-object', 'Object       new Person()', GRAY), at: [0, 1] },
    { node: lbl('ja-value-collection', 'Collection   List.of()  Map.of()', GRAY), at: [0, 2] },
    { node: lbl('ja-value-defbody', 'Method body   n + 1   { ... }', GRAY), at: [0, 3] },
  ]),
)

const initializeRow = container(
  { id: 'ja-init-row', label: 'Initialize — anatomy of a binding   |   [Modifier]  Type  Name  =  Value', color: BLUE },
  wgrid({ cols: [1.1, 4.2, 0.9, 0.4, 1.5], rows: [1], gap: 0.3, padding: 0.2 }, [
    { node: kind, at: [0, 0] },
    { node: typeShapes, at: [1, 0] },
    { node: lbl('ja-name', 'Name  s', BLUE), at: [2, 0] },
    { node: lbl('ja-equals', '=', BLUE), at: [3, 0] },
    { node: value, at: [4, 0] },
  ]),
)

// =============== ROW 2: TRANSFORM — what you do ===============

const control = container(
  { id: 'ja-control', label: 'Control', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-ctrl-if', 'if/else', GRAY), at: [0, 0] },
    { node: lbl('ja-ctrl-tern', 'ternary', GRAY), at: [0, 1] },
    { node: lbl('ja-ctrl-switch', 'switch', GRAY), at: [0, 2] },
    { node: lbl('ja-ctrl-guard', 'guard', GRAY), at: [0, 3] },
  ]),
)

const patternMatch = container(
  { id: 'ja-pattern', label: 'Pattern Match', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-pat-match', 'case', GRAY), at: [0, 0] },
    { node: lbl('ja-pat-record', 'deconstruct', GRAY), at: [0, 1] },
  ]),
)

const loops = container(
  { id: 'ja-loops', label: 'Loops', color: YELLOW },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-loop-for', 'for', GRAY), at: [0, 0] },
    { node: lbl('ja-loop-foreach', 'for-each', GRAY), at: [1, 0] },
    { node: lbl('ja-loop-while', 'while', GRAY), at: [0, 1] },
    { node: lbl('ja-loop-dowhile', 'do-while', GRAY), at: [1, 1] },
    { node: lbl('ja-loop-break', 'break', GRAY), at: [0, 2] },
    { node: lbl('ja-loop-continue', 'continue', GRAY), at: [1, 2] },
  ]),
)

const methods = container(
  { id: 'ja-methods', label: 'Methods', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-method-call', 'x.foo()', GRAY), at: [0, 0] },
    { node: lbl('ja-method-def', 'method in class', GRAY), at: [0, 1] },
  ]),
)

const lambdas = container(
  { id: 'ja-functions', label: 'Lambdas', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-fn-lambda', 'lambda', GRAY), at: [0, 0] },
    { node: lbl('ja-fn-methodref', 'method ref', GRAY), at: [0, 1] },
    { node: lbl('ja-fn-iface', '@FunctionalInterface', GRAY), at: [0, 2] },
  ]),
)

const streamOps = container(
  { id: 'ja-coll-ops', label: 'Stream Ops', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-op-map', 'map', GRAY), at: [0, 0] },
    { node: lbl('ja-op-filter', 'filter', GRAY), at: [1, 0] },
    { node: lbl('ja-op-flatmap', 'flatMap', GRAY), at: [0, 1] },
    { node: lbl('ja-op-reduce', 'reduce', GRAY), at: [1, 1] },
    { node: lbl('ja-op-collect', 'collect', GRAY), at: [0, 2] },
    { node: lbl('ja-op-groupby', 'groupingBy', GRAY), at: [1, 2] },
  ]),
)

const transformRow = container(
  { id: 'ja-verbs', label: 'Transform — what you do   |   branch ▸ match ▸ loop ▸ call ▸ lambda ▸ stream', color: ORANGE },
  wgrid({ cols: [1.0, 0.9, 1.2, 0.9, 0.9, 1.4], rows: [1], gap: 0.25, padding: 0.2 }, [
    { node: control, at: [0, 0] },
    { node: patternMatch, at: [1, 0] },
    { node: loops, at: [2, 0] },
    { node: methods, at: [3, 0] },
    { node: lambdas, at: [4, 0] },
    { node: streamOps, at: [5, 0] },
  ]),
)

// =============== ROW 3: RETURN — what comes back ===============

const returnRow = container(
  { id: 'ja-results', label: 'Return — what comes back', color: GREEN },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.35, padding: 0.4 }, [
    { node: chip('ja-new-coll', 'Collected result', GREEN), at: [0, 0] },
    { node: chip('ja-typed-failure', 'Optional / checked throws', BLUE), at: [1, 0] },
    { node: chip('ja-effects', 'Effects (println, IO)', GRAY), at: [2, 0] },
  ]),
)

// =============== LEFT CONTENT BLOCK: four rhythm rows stacked ===============
// Row weights give the two dense rows (Initialize ⊃ the 6-item Primitives list,
// Transform ⊃ the op grids) extra height so their leaf labels aren't squeezed.

const content = group(
  'ja-content',
  wgrid({ cols: [1], rows: [4.5, 5.5, 5.5, 2], gap: 0.5, padding: 0 }, [
    { node: modelRow, at: [0, 0] },
    { node: initializeRow, at: [0, 1] },
    { node: transformRow, at: [0, 2] },
    { node: returnRow, at: [0, 3] },
  ]),
)

// =============== RIGHT COLUMN: Memory footprint ===============

const memory = container(
  { id: 'ja-memory', label: 'Memory', color: RED },
  wgrid({ cols: [1], rows: [1, 1.4, 1, 1], gap: 0.4, padding: 0.4 }, [
    { node: sym('ja-stack', 'Stack frame  (refs)', TEAL, 'layers'), at: [0, 0] },
    { node: sym('ja-heap', 'Heap  (objects)', TEAL, 'box'), at: [0, 1] },
    { node: sym('ja-immutable', 'Immutable view  (List.of)', TEAL, 'shield'), at: [0, 2] },
    { node: sym('ja-method-area', 'Method Area  (bytecode)', TEAL, 'scroll'), at: [0, 3] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'ja-root',
  wgrid({ cols: [4.5, 1], rows: [1], gap: 0.5, padding: 0.02 }, [
    { node: content, at: [0, 0] },
    { node: memory, at: [1, 0] },
  ]),
)

export const javaAnatomy: SceneSpec = {
  id: 'java-anatomy',
  title: 'Java — Anatomy',
  // Taller canvas so the stacked rhythm rows get vertical room and the dense leaf
  // lists (Primitives, Stream Ops) stop reading squeezed.
  canvas: { width: 1380, height: 1240 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // Model: inheritance arrows point UP from child to parent (UML)
    { from: 'ja-oop-mammal', to: 'ja-oop-animal', label: 'extends' },
    { from: 'ja-oop-mammal', to: 'ja-oop-walker', label: 'implements' },
    { from: 'ja-oop-dog', to: 'ja-oop-mammal', label: 'extends' },

    // Rhythm: Model -> Initialize -> Transform -> Return
    { from: 'ja-model', to: 'ja-init-row', label: 'instantiate' },
    { from: 'ja-init-row', to: 'ja-verbs', label: 'next' },
    { from: 'ja-verbs', to: 'ja-results', label: 'next' },

    // Value -> Memory region
    { from: 'ja-value-primitive', to: 'ja-stack', label: 'lives on' },
    { from: 'ja-value-object', to: 'ja-heap', label: 'lives on' },
    { from: 'ja-value-collection', to: 'ja-immutable', label: 'immutable in' },
    { from: 'ja-value-defbody', to: 'ja-method-area', label: 'lives in' },

    // Transform <-> Memory <-> Return
    { from: 'ja-verbs', to: 'ja-memory', label: 'operates on' },
    { from: 'ja-memory', to: 'ja-results', label: 'yields' },
  ],
}
