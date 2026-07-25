import { useEffect, useState } from 'react'

// A lower-third title banner: a small brand kicker (the concept) above a concept-accent
// pill with the section title, flush to the left edge. It announces the current section
// then fades so it doesn't obscure the scene, re-showing on every section change (keyed
// off `title`). Part of the 1920×1080 frame.
export default function SectionBanner({
  title,
  kicker,
  accent,
}: {
  title: string
  kicker: string
  /** Concept brand accent — the pill fill (matches the opener). */
  accent: string
}) {
  const [shown, setShown] = useState(true)

  useEffect(() => {
    setShown(true)
    const t = setTimeout(() => setShown(false), 3400)
    return () => clearTimeout(t)
  }, [title])

  return (
    <div
      className={`pointer-events-none absolute bottom-28 left-0 transition-all duration-500 ${
        shown ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
      }`}
    >
      <div className="mb-2 pl-11 text-[19px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {kicker}
      </div>
      <div
        className="max-w-[820px] rounded-r-3xl px-11 py-5 text-[40px] font-bold leading-tight text-white shadow-2xl"
        style={{ backgroundColor: accent }}
      >
        {title}
      </div>
    </div>
  )
}
