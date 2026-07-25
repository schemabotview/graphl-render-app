import ScenePane from './ScenePane'
import SlidePane from './SlidePane'

/**
 * The fixed video stage: a 16:9 (1920×1080) frame, centered and scaled to fit the
 * viewport, split left (scene) / right (slide). Everything is judged at this frame —
 * later slices record it 1:1 with Puppeteer. The split is ~58/42 (scene gets more).
 */
export default function StageFrame() {
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
          <SlidePane />
        </div>
      </div>
    </div>
  )
}
