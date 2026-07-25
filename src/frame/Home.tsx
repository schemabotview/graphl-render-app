import { useEffect, useState } from 'react'
import { catalog, type Concept } from '../content/catalog'
import { fetchManifest } from '../content/client'
import { slugOf } from '../content/nav'
import type { Manifest, ModuleSpec, SectionSpec } from '../content/types'
import type { Route } from '../router'

// The course index (route `#/`). Reads the same manifests the player uses, so the
// module/section list can't drift from what actually plays. Concept → module →
// section, three collapsible levels; every section is a deep link into the player.

/** Per-concept load state: a fetched manifest, still loading, or its repo is unavailable. */
type Loaded = { status: 'loading' } | { status: 'ok'; manifest: Manifest } | { status: 'error' }

interface HomeProps {
  onOpen: (r: Route) => void
}

export default function Home({ onOpen }: HomeProps) {
  const concepts = Object.values(catalog)
  const [loaded, setLoaded] = useState<Record<string, Loaded>>({})

  useEffect(() => {
    let live = true
    setLoaded(Object.fromEntries(concepts.map((c) => [c.id, { status: 'loading' as const }])))
    concepts.forEach((c) => {
      fetchManifest(c.contentBaseUrl)
        .then((manifest) => live && setLoaded((s) => ({ ...s, [c.id]: { status: 'ok', manifest } })))
        .catch(() => live && setLoaded((s) => ({ ...s, [c.id]: { status: 'error' } })))
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full w-full overflow-y-auto bg-scene text-[#f1f2f4]">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">GraphL — Course Index</h1>
        <p className="mt-2 text-role-gray">Pick a section to open it in the player.</p>

        {concepts.map((c) => (
          <ConceptBlock key={c.id} concept={c} loaded={loaded[c.id]} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function ConceptBlock({
  concept,
  loaded,
  onOpen,
}: {
  concept: Concept
  loaded?: Loaded
  onOpen: (r: Route) => void
}) {
  const [open, setOpen] = useState(false)
  const modules = loaded?.status === 'ok' ? loaded.manifest.modules : undefined
  const meta =
    loaded?.status === 'ok'
      ? `${modules!.length} modules`
      : loaded?.status === 'error'
        ? 'unavailable'
        : '…'
  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 border-b border-white/10 py-3 text-left"
      >
        <span className={`text-role-gray transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        <h2 className="text-xl font-medium text-role-teal">{concept.label}</h2>
        <span className="ml-auto text-sm text-role-gray">{meta}</span>
      </button>
      {!open ? null : loaded?.status === 'error' ? (
        <p className="mt-3 text-sm text-role-gray">Content repo not available yet.</p>
      ) : !modules ? (
        <p className="mt-3 text-role-gray">Loading modules…</p>
      ) : (
        <ul className="mt-4 grid gap-2">
          {modules.map((m) => (
            <ModuleRow key={m.id} concept={concept} module={m} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ModuleRow({
  concept,
  module,
  onOpen,
}: {
  concept: Concept
  module: ModuleSpec
  onOpen: (r: Route) => void
}) {
  const [open, setOpen] = useState(false)
  const moduleNo = module.id.match(/^\d+/)?.[0] ?? ''
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 rounded-md border border-white/10 bg-node-base/40 px-4 py-3 text-left transition-colors hover:border-role-blue/60 hover:bg-node-base/70"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-role-blue/25 text-sm font-semibold text-role-blue">
          {moduleNo}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{module.title}</span>
          <span className="block text-sm text-role-gray">{module.sections.length} sections</span>
        </span>
        <span className={`ml-auto text-role-gray transition-transform ${open ? 'rotate-90' : ''}`}>
          ▶
        </span>
      </button>
      {open && (
        <ol className="mb-1 ml-[3.25rem] mt-2 grid gap-1">
          {module.sections.map((s) => (
            <SectionRow
              key={slugOf(s)}
              concept={concept}
              module={module}
              section={s}
              onOpen={onOpen}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

function SectionRow({
  concept,
  module,
  section,
  onOpen,
}: {
  concept: Concept
  module: ModuleSpec
  section: SectionSpec
  onOpen: (r: Route) => void
}) {
  const slug = slugOf(section)
  // `NN-SS-slug` → the two-digit section number for a compact leading marker.
  const sectionNo = slug.match(/^\d+-(\d+)/)?.[1] ?? ''
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen({ concept: concept.id, module: module.id, section: slug })}
        className="flex w-full items-center gap-3 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
      >
        <span className="w-7 shrink-0 tabular-nums text-role-gray">{sectionNo}</span>
        <span className="min-w-0 truncate">{section.heading}</span>
      </button>
    </li>
  )
}
