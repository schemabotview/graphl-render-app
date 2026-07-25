import { useEffect, useState } from 'react'
import Logo from './Logo'

// Duration the opener stays fully visible before it fades (ms).
export const OPENER_HOLD_MS = 3000

// The module title card — the SAME split as the lesson frame: the live scene shows on
// the left (whole-scene, no focus — driven by StageFrame), while this panel occupies the
// right (slide) pane. Concept-color wash, white kicker + number + title, coral GraphL
// mark. It holds, then fades to reveal the slide underneath.
export default function ModuleOpener({
  concept,
  moduleNo,
  title,
  accent,
  accentDeep,
  width,
  onDone,
}: {
  concept: string
  moduleNo: string
  title: string
  /** Concept brand accent — the panel wash; the GraphL mark stays coral. */
  accent: string
  /** Deep tint of the accent — the wash's base. */
  accentDeep: string
  /** Width of the right (slide) pane this panel overlays. */
  width: number
  onDone?: () => void
}) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    const start = () => {
      t1 = setTimeout(() => setGone(true), OPENER_HOLD_MS)
      t2 = setTimeout(() => onDone?.(), OPENER_HOLD_MS + 800) // after the fade
    }
    // Capture mode: the recorder fires `capture-opener-start` the instant it begins rolling,
    // so the card plays from frame 0 in sync with the audio lead. Preview auto-starts.
    const capture = new URLSearchParams(location.search).has('capture')
    if (capture) window.addEventListener('capture-opener-start', start, { once: true })
    else start()
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('capture-opener-start', start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`absolute inset-y-0 right-0 z-20 flex flex-col px-[72px] py-[72px] transition-opacity duration-700 ${
        gone ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        width,
        // Concept-color wash: the accent at graduated opacity over its deep tint.
        // 8c/2e = ~.55/.18 alpha. Inline = per-concept.
        background: `linear-gradient(150deg, ${accent}8c 0%, ${accent}2e 78%), ${accentDeep}`,
      }}
    >
      {/* Kicker — the concept, white (the panel carries the concept color). */}
      <div className="text-[30px] font-bold uppercase tracking-[0.13em] text-white">{concept}</div>
      {/* Number + title, vertically centered. */}
      <div className="my-auto">
        <div className="text-[100px] font-black leading-none tracking-tight text-white">
          {moduleNo}
        </div>
        <div className="mt-1 text-[100px] font-bold leading-[1.04] tracking-tight text-white">
          {title}
        </div>
      </div>
      {/* GraphL mark — coral, the constant channel identity. */}
      <div className="flex items-center gap-3">
        <Logo size={44} />
        <span className="text-[32px] font-bold tracking-tight text-white">GraphL</span>
      </div>
    </div>
  )
}
