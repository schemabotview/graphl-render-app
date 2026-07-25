import { useEffect, useRef, useState } from 'react'
import StageFrame, { type Opener } from './frame/StageFrame'
import Home from './frame/Home'
import { catalog } from './content/catalog'
import { fetchManifest, fetchContentText, contentUrl } from './content/client'
import { parseSlide, type Slide } from './content/slide'
import { slugOf } from './content/nav'
import type { Manifest } from './content/types'
import { getScene } from './scenes'
import { useNarration } from './hooks/useNarration'
import { parseRoute, writeRoute, type Route } from './router'

// Route-driven shell. The hash `#/<concept>/<module>/<section>` selects what plays;
// paging (← →) rewrites it. The bare root `#/` shows the course index (Home).
const DEFAULT_CONCEPT = 'apache-spark'

export default function App() {
  const initial = parseRoute()
  const [route, setRoute] = useState<Route>(initial)
  const concept = catalog[route.concept] ?? catalog[DEFAULT_CONCEPT]

  // Tag the loaded manifest with the concept it belongs to, so a section never resolves
  // against the wrong concept's manifest during a switch (a cross-concept 404).
  const [manifest, setManifest] = useState<{ id: string; data: Manifest } | null>(null)
  const [slide, setSlide] = useState<Slide | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Follow external hash changes (back/forward, a pasted deep link). Our own paging uses
  // replaceState, which does NOT fire hashchange — so this never loops on self-navigation.
  useEffect(() => {
    const onHash = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const showHome = !route.module

  // Fetch the concept's manifest when a section route needs it.
  useEffect(() => {
    if (showHome) return
    let alive = true
    setError(null)
    fetchManifest(concept.contentBaseUrl)
      .then((data) => alive && setManifest({ id: concept.id, data }))
      .catch((e) => alive && setError(String(e)))
    return () => {
      alive = false
    }
  }, [showHome, concept.contentBaseUrl, concept.id])

  // Only trust the manifest once it matches the concept the route currently names.
  const activeManifest = manifest && manifest.id === concept.id ? manifest.data : null
  const modules = activeManifest?.modules ?? []
  const moduleIndex = Math.max(0, modules.findIndex((m) => m.id === route.module))
  // Only resolve a section when a module route names one. On Home (no module) we leave
  // this undefined so nothing falls back to module 01 §01 — which would make its clip the
  // "default" audio and let it play on the index.
  const moduleSpec = !showHome && activeManifest ? (modules[moduleIndex] ?? modules[0]) : undefined
  const sectionIndex = moduleSpec
    ? Math.max(0, moduleSpec.sections.findIndex((s) => slugOf(s) === route.section))
    : 0
  const section = moduleSpec?.sections[sectionIndex]
  // Narration path is convention, not manifest data: every clip is `audio/<slug>.wav`
  // (the slug is the slide stem). One rule for every module; a truly absent wav 404s and
  // useNarration stays silent.
  const audioUrl = section
    ? contentUrl(concept.contentBaseUrl, `audio/${slugOf(section)}.wav`)
    : undefined

  const go = (next: Route) => {
    setRoute(next)
    writeRoute(next)
  }

  // Step ±1 across the concept as one continuous lesson: past a module's last section
  // roll into the next module's first section (and symmetrically for ←). Stops at the
  // very first/last section of the concept.
  const step = (delta: number) => {
    if (!moduleSpec) return
    const si = sectionIndex + delta
    if (si >= 0 && si < moduleSpec.sections.length) {
      go({ concept: concept.id, module: moduleSpec.id, section: slugOf(moduleSpec.sections[si]) })
    } else if (si < 0 && moduleIndex > 0) {
      const prev = modules[moduleIndex - 1]
      go({ concept: concept.id, module: prev.id, section: slugOf(prev.sections[prev.sections.length - 1]) })
    } else if (si >= moduleSpec.sections.length && moduleIndex < modules.length - 1) {
      const nextMod = modules[moduleIndex + 1]
      go({ concept: concept.id, module: nextMod.id, section: slugOf(nextMod.sections[0]) })
    }
  }

  // Play the current section's narration; SPACE toggles it. On clip-end auto-advance one
  // step — which carries across module boundaries into the next module.
  const { toggle, stop } = useNarration(audioUrl, () => step(1))

  // Keyboard transport: ← → page sections (across modules), SPACE plays/pauses narration,
  // Esc returns to the index.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Escape') {
        stop() // leaving the player — silence the narration
        go({ concept: '' })
      } else if (e.key === ' ') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Canonicalize the URL once the section resolves (fills a partial hash, e.g. a module
  // with no section, or a section slug that didn't match).
  useEffect(() => {
    if (!moduleSpec || !section) return
    const canon: Route = { concept: concept.id, module: moduleSpec.id, section: slugOf(section) }
    if (route.module !== canon.module || route.section !== canon.section || route.concept !== canon.concept) {
      go(canon)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleSpec, section])

  // Fetch the current section's slide. We don't blank the old slide first — that would
  // flash a "Loading" between sections; the new slide swaps in when it arrives.
  useEffect(() => {
    if (!section) return
    fetchContentText(concept.contentBaseUrl, section.slide)
      .then((t) => setSlide(parseSlide(t)))
      .catch((e) => setError(String(e)))
  }, [section, concept.contentBaseUrl])

  // Play the module opener once PER MODULE, when landing on that module's first section.
  // Keyed by concept+module (not a once-ever flag) so re-entering a module replays with
  // the current module's title. Paging within a module never re-triggers it.
  const openedModuleRef = useRef<string | null>(null)
  const [opener, setOpener] = useState<Opener | null>(null)
  useEffect(() => {
    if (!moduleSpec || !section || sectionIndex !== 0) return
    const key = `${concept.id}/${moduleSpec.id}`
    if (openedModuleRef.current === key) return
    openedModuleRef.current = key
    setOpener({
      concept: concept.label,
      moduleNo: moduleSpec.id.match(/^\d+/)?.[0] ?? '',
      title: moduleSpec.title,
      accent: concept.accent,
      accentDeep: concept.accentDeep,
    })
  }, [moduleSpec, section, sectionIndex, concept.label, concept.id, concept.accent, concept.accentDeep])

  if (showHome) return <Home onOpen={go} />
  if (error) return <Centered>Failed to load content — {error}</Centered>
  if (!section || !slide) return <Centered>Loading content…</Centered>

  return (
    <StageFrame
      scene={section.scene ? getScene(section.scene) : undefined}
      slide={slide}
      bannerTitle={slide.title}
      bannerKicker={concept.label}
      accent={concept.accent}
      opener={opener}
      onOpenerDone={() => setOpener(null)}
      highlight={section.highlight}
      focus={section.focus}
    />
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid h-full w-full place-items-center bg-scene text-role-gray">{children}</div>
}
