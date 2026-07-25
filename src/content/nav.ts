import type { SectionSpec } from './types.ts'

// A section's URL slug is its file stem — the `.slide` basename without extension
// (e.g. `slides/01-01-star-schema.slide` → `01-01-star-schema`). Stable across
// refresh and matches the md/tts/wav stems.
export const slugOf = (s: SectionSpec): string =>
  s.slide.replace(/^.*\//, '').replace(/\.slide$/, '')
