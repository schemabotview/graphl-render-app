import { useEffect, useState } from 'react'
import StageFrame from './frame/StageFrame'
import Home from './frame/Home'
import { catalog } from './content/catalog'
import { fetchManifest, fetchContentText } from './content/client'
import { parseSlide, type Slide } from './content/slide'
import { slugOf } from './content/nav'
import type { Manifest } from './content/types'
import { getScene } from './scenes'
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
  const moduleSpec = activeManifest
    ? (activeManifest.modules.find((m) => m.id === route.module) ?? activeManifest.modules[0])
    : undefined
  const sectionIndex = moduleSpec
    ? Math.max(0, moduleSpec.sections.findIndex((s) => slugOf(s) === route.section))
    : 0
  const section = moduleSpec?.sections[sectionIndex]

  const go = (next: Route) => {
    setRoute(next)
    writeRoute(next)
  }
  const goToIndex = (i: number) => {
    if (!moduleSpec) return
    const clamped = Math.max(0, Math.min(i, moduleSpec.sections.length - 1))
    go({ concept: concept.id, module: moduleSpec.id, section: slugOf(moduleSpec.sections[clamped]) })
  }

  // Keyboard transport: ← → page sections, Esc returns to the index.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToIndex(sectionIndex + 1)
      else if (e.key === 'ArrowLeft') goToIndex(sectionIndex - 1)
      else if (e.key === 'Escape') go({ concept: '' })
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

  if (showHome) return <Home onOpen={go} />
  if (error) return <Centered>Failed to load content — {error}</Centered>
  if (!section || !slide) return <Centered>Loading content…</Centered>

  return (
    <StageFrame
      scene={section.scene ? getScene(section.scene) : undefined}
      slide={slide}
      highlight={section.highlight}
      focus={section.focus}
    />
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid h-full w-full place-items-center bg-scene text-role-gray">{children}</div>
}
