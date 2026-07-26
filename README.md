# graphl-render-app

The GraphL **render app** — a web player that turns a concept into a video-first,
node-graph lesson: a **React Flow scene on the left, an authored slide on the right**,
narrated by generated audio. It ships no content; it fetches a concept's content at
runtime from that concept's content repo (raw GitHub) and pages through it section by
section.

This is one repo in the wider [GraphL](../) workspace (`schemabotview`). It pairs with
`graphl-capture-app` (the Puppeteer 4K recorder that drives this app in capture mode).

## Stack

React 19 · TypeScript · Vite 6 · React Flow (`@xyflow/react` 12) · Tailwind CSS v4
(`@tailwindcss/vite`) · Inter (`@fontsource-variable/inter`, self-hosted) · lucide-react ·
`react-markdown` + `remark-gfm` + `rehype-highlight` (slide/markdown rendering).

## Run it

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build  → dist/
npm run preview  # serve the production build
```

Open the dev server and deep-link a lesson with the hash route:

```
#/<concept>/<module>/<section>      e.g. #/apache-spark/01/01-01-the-problem-spark-solves
```

`←` / `→` page between sections.

### Reviewing unpushed content

The app fetches content from raw GitHub by default. To preview a locally-served content
repo (CORS-enabled) without pushing, set `VITE_CONTENT_BASE_URL` when starting Vite:

```bash
VITE_CONTENT_BASE_URL=http://localhost:8080 npm run dev
```

## How content is wired

- **Concepts** live in `src/content/catalog.ts` — each maps a concept id to its content
  repo's `contentBaseUrl` (raw GitHub) plus its brand accent. The app bundles no content.
- At runtime the app fetches the concept's `manifest.json` (modules → sections, each
  section wiring a `scene` id + `slide` path + `focus`/`highlight`) and each section's
  `.slide`.
- **Narration is not in the manifest** — it's derived by convention: `audio/<slug>.wav`,
  where the slug is the slide stem.
- **Scenes are app-owned** (`src/scenes/`), referenced from the manifest by id. The React
  Flow diagram is the app's contribution, not content.

Live scenes today: `spark-architecture`, `spark-batch-api`, `spark-streaming`
(Apache Spark) and `dw-architecture` (Data Warehousing). The `-ct` content repos those
concepts fetch from may not exist yet — until they do (or a local override is set),
manifest/slide fetches 404, which is expected for the current build phase.

## Capture mode

`?capture=1` puts the app under the `graphl-capture-app` recorder: a dark pre-roll, a
`window.__captureReady` handshake (blank slide per section), and a `capture-opener-start`
event. The fixed 1920×1080 stage scales to fill a SCALE× viewport, so a 2× viewport
records a crisp 4K frame.

## Layout

```
src/
  engine/   # SceneSpec types · grid/layout resolver · SceneNode / FlowEdge / SceneViewer · colors · scene.css
  content/  # catalog (concept→contentBaseUrl) · client (manifest/slide fetch) · slide parser · nav · types
  scenes/   # app-owned scenes + registry
  frame/    # fixed two-pane stage: StageFrame → ScenePane | SlidePane + banners/openers · Home
  hooks/    # useNarration (one <audio>, auto-advance on clip-end)
  router.ts # hash route #/<concept>/<module>/<section>
  App.tsx   # route-driven shell, ← → paging
public/     # icon.svg (GraphL mark / favicon)
```
