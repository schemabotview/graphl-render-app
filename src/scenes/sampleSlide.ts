// Demo `.slide` fixture, paired with `sampleScene` (the star schema). This is bundled
// only to exercise the parser + SlidePane while there's no live content repo — real
// slides are FETCHED from a concept's contentBaseUrl at runtime (see content/client.ts).
export const sampleSlideText = `# Star schema

## The shape
A central **fact table** ringed by **dimension tables** — the simplest, fastest analytical model.

- **fact_sales** holds the measures (the numbers you aggregate) plus foreign keys.
- Each **dimension** adds context: who, what, where, when.

## Why it's fast
1. **Fewer joins** — every dimension is one hop from the fact.
2. **Denormalized** dimensions trade storage for query speed.
`
