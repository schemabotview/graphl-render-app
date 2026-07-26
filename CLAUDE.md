# CLAUDE.md — graphl-render-app

The GraphL **render app**: a fixed two-pane player — **React Flow scene on the left,
authored slide on the right**, narrated by generated audio. It fetches a concept's
content at runtime and pages through it section by section. This file is the working
context for future sessions on *this repo*; `README.md` is the one-page how-to.

This is one repo (`schemabotview/graphl-render-app`) in the wider GraphL workspace. The
workspace-level `../CLAUDE.md` holds the full product context (domain model, other repos,
capture pipeline). Read it when a task crosses repo boundaries.

---

## Working agreement (HARD RULE — do not skip)

The owner drives; we build **one reviewed slice at a time** so they never lose control of
what's being implemented.

1. **Step by step, with a review gate at each step.** Propose → get approval → implement
   one small slice → stop for review → only then continue. Never batch multiple
   features/files without a gate.
2. **Explain before writing.** Before each slice, say in plain prose what it does, why,
   and which files it touches — small enough to hold in your head.
3. **No silent scaffolding.** List the files and get a "yes" before generating many at
   once. Do NOT scaffold ahead of the reviewed slice.
4. **One concept per slice.** Keep diffs small and named.

---

## The domain model (recap)

- A **concept** = one content repo, divided into **modules**, each divided into
  **sections**. A section is the unit the player steps through; its slug
  (`concept-module-section`) owns a 4-file content bundle (`md`/`slide`/`tts`/`wav`).
- This app renders the **`slide`** (right pane) and plays the **`wav`** (narration). The
  `md` is the authoring source of truth (provenance only — the app never renders it);
  `tts` produces the `wav` upstream.
- **Scenes are app-owned** (TypeScript in `src/scenes`), referenced by id from the
  manifest — they are NOT part of the content bundle. The React Flow scene *is* the
  diagram.

---

## Content wiring is GitHub-only (owner's decision)

The app fetches content from raw GitHub (`raw.githubusercontent.com/schemabotview/…`) —
the default `contentBaseUrl` per concept in `src/content/catalog.ts`. To publish a content
edit, push the content repo to GitHub. Do NOT wire the app to a local content server as a
default. The `VITE_CONTENT_BASE_URL` override exists only for locally previewing unpushed
content (set it when starting Vite).

**Fetch contract:** the app ships no content. It fetches `manifest.json` (wires each
section to its `scene` id, `slide` path, `focus`, `highlight`) + each section's `.slide`.
Narration is NOT in the manifest — it's derived by convention: `audio/<slug>.wav` (the
slug is the slide stem). The `-ct` content repos may not exist yet; until they do (or an
override is set), fetches 404 — expected for the current build phase.

---

## Structure (as built)

```
src/
  engine/   # SceneSpec types · grid/layout resolver (grid.ts, gridValidate.ts) ·
            #   SceneNode / FlowEdge / SceneViewer · colors · icons · highlight · patterns · scene.css
  content/  # catalog (concept→contentBaseUrl, accents) · client (manifest/slide fetch) ·
            #   slide parser · nav · types (Manifest / ModuleSpec / SectionSpec)
  scenes/   # app-owned scenes + registry (index.ts: id → SceneSpec)
  frame/    # StageFrame → ScenePane | SlidePane, ModuleOpener, SectionBanner, Home, Logo
  hooks/    # useNarration (one <audio>, auto-advance on clip-end)
  router.ts # hash route #/<concept>/<module>/<section>, replaceState paging (no history spam)
  App.tsx   # route-driven shell, ← → paging
public/     # icon.svg (GraphL mark / favicon)
```

- Add a scene: create `src/scenes/<id>.ts` exporting a `SceneSpec`, register it in
  `src/scenes/index.ts`. The manifest then references it by that id.
- Add a concept: add an entry to `catalog` in `src/content/catalog.ts` (id, label,
  `contentBaseUrl`, `accent`, `accentDeep`).

**Stack:** React 19 · TypeScript · Vite 6 · React Flow (`@xyflow/react` 12) · Tailwind v4
(`@tailwindcss/vite`, no PostCSS/config) · Inter (self-hosted) · lucide-react ·
`react-markdown` + `remark-gfm` + `rehype-highlight`.

**Commands:** `npm run dev` · `npm run build` (`tsc -b && vite build`) · `npm run preview`.

---

## Capture mode

`?capture=1` puts the app under the `graphl-capture-app` recorder — a dark pre-roll, a
`window.__captureReady` handshake (blank slide per section), and a `capture-opener-start`
event. The fixed 1920×1080 stage scales to fill a SCALE× viewport, so a 2× viewport
records a crisp 4K frame. Keep this handshake intact when touching `App.tsx` / the frame.

---

## Visual design

Calm filled blocks over `#1f1f1f` (not neon). **Fixed semantic colors** — a hue always
means one role: BLUE `#5b8cff`, GREEN `#37d39a`, ORANGE `#ff7a59`, PURPLE `#b98bff`,
TEAL `#3fd0d6`, RED `#ff5d6c`, GRAY `#9aa3b2`, YELLOW `#d9b84a`; keep ≤4–5 live at once.
Focus keeps each node's own color (brighten focused + dim the rest to ~0.28, camera pans
to `focus`) — no amber. Edges always visible (calm gray, lifted above fills). Font: Inter,
sized to stay legible after video re-encoding. See `src/engine/colors.ts` and `scene.css`.

---

## Reference project

`~/Products/graphl-movie` — a mature, working implementation of this exact idea. Use it as
the pattern for the engine, content-fetch, and frame. We are re-deriving a clean render app
for GraphL, not copying it wholesale.
