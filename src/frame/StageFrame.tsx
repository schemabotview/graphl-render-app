import ScenePane from './ScenePane'
import SlidePane from './SlidePane'
import type { SceneSpec } from '../engine/types'
import type { Slide } from '../content/slide'

/**
 * The fixed video stage: a 16:9 (1920×1080) frame, centered and scaled to fit the
 * viewport, split left (scene) / right (slide). Everything is judged at this frame —
 * later slices record it 1:1 with Puppeteer. The split is ~58/42 (scene gets more).
 *
 * Presentational: App resolves the section (scene + slide + focus/highlight) and passes
 * it in. The banner, module opener, and narration overlays come in later slices.
 */
export default function StageFrame({
  scene,
  slide,
  highlight,
  focus,
}: {
  scene?: SceneSpec
  slide: Slide
  highlight?: string[]
  focus?: string | string[]
}) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="flex bg-scene shadow-2xl"
        style={{ width: 'min(100vw, 177.78vh)', aspectRatio: '16 / 9' }}
      >
        <div className="basis-[58%] min-w-0">
          <ScenePane scene={scene} highlight={highlight} focus={focus} />
        </div>
        <div className="basis-[42%] min-w-0 border-l border-white/10">
          <SlidePane slide={slide} />
        </div>
      </div>
    </div>
  )
}
