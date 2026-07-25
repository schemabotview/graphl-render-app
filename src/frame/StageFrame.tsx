import { useEffect, useState } from 'react'
import ScenePane from './ScenePane'
import SlidePane from './SlidePane'
import { parseSlide, type Slide } from '../content/slide'
import { sampleSlideText } from '../scenes/sampleSlide'
import { getConcept } from '../content/catalog'
import { fetchManifest, fetchContentText } from '../content/client'

/**
 * The fixed video stage: a 16:9 (1920×1080) frame, centered and scaled to fit the
 * viewport, split left (scene) / right (slide). Everything is judged at this frame —
 * later slices record it 1:1 with Puppeteer. The split is ~58/42 (scene gets more).
 *
 * Content-fetch demo: on mount we fetch the live `apache-spark` manifest, take its
 * first section, fetch that section's real `.slide`, and render it — proving the
 * content layer end-to-end against a real repo. The bundled demo slide is the initial
 * state, so if the fetch fails (offline / repo moved) the frame still renders. Picking
 * the section from a route comes in the router slice.
 */
export default function StageFrame() {
  const [slide, setSlide] = useState<Slide>(() => parseSlide(sampleSlideText))

  useEffect(() => {
    let cancelled = false
    const concept = getConcept('apache-spark')
    if (!concept) return
    ;(async () => {
      try {
        const manifest = await fetchManifest(concept.contentBaseUrl)
        const section = manifest.modules[0]?.sections[0]
        if (!section) return
        const text = await fetchContentText(concept.contentBaseUrl, section.slide)
        if (!cancelled) setSlide(parseSlide(text))
      } catch (err) {
        console.warn('[content] fetch failed, showing demo slide:', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="flex bg-scene shadow-2xl"
        style={{ width: 'min(100vw, 177.78vh)', aspectRatio: '16 / 9' }}
      >
        <div className="basis-[58%] min-w-0">
          <ScenePane />
        </div>
        <div className="basis-[42%] min-w-0 border-l border-white/10">
          <SlidePane slide={slide} />
        </div>
      </div>
    </div>
  )
}
