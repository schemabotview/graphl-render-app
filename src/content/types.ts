// The shape of a content repo's manifest.json — what the app fetches to wire a
// concept's modules and sections. The `md` file is the authoring source of truth
// (provenance here); the app renders the `slide` (right pane) + `scene` (left pane,
// by id from the app registry) and plays the `audio` (wav).

export interface SectionSpec {
  heading: string
  /**
   * Authoring source of truth (provenance) — the app doesn't render it. GraphL-native
   * content uses `md`; the existing content repos use a `notebook` (ipynb). Either may
   * be present.
   */
  md?: string
  notebook?: string
  /** Path to the `.slide` file — the right-pane bullets. */
  slide: string
  // Narration is NOT wired here — the app derives it by convention (`audio/<slug>.wav`),
  // so the manifest carries no audio path. See App.tsx.
  /** Scene id, looked up in the app's scene registry (src/scenes). */
  scene?: string
  /** Scene node ids to spotlight (the rest dim). */
  highlight?: string[]
  /** Scene node id(s) the camera frames. */
  focus?: string | string[]
  spine?: boolean
  role?: string
}

export interface ModuleSpec {
  id: string
  title: string
  sections: SectionSpec[]
}

export interface Manifest {
  concept: string
  modules: ModuleSpec[]
}
