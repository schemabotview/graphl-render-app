import { useLayoutEffect, useState } from 'react'
import ScenePane from './ScenePane'
import SlidePane from './SlidePane'
import SectionBanner from './SectionBanner'
import ModuleOpener from './ModuleOpener'
import type { SceneSpec } from '../engine/types'
import type { Slide } from '../content/slide'

export interface Opener {
  concept: string
  moduleNo: string
  title: string
  /** Concept brand accent + its deep gradient tint (from the catalog). */
  accent: string
  accentDeep: string
}

// The canonical frame: Full HD, landscape 16:9 (YouTube / Udemy). A later Puppeteer
// capture records at a 1920×1080 viewport, so at capture time scale === 1.
export const STAGE_W = 1920
export const STAGE_H = 1080

// The two-pane split (must sum to STAGE_W): left = visual scene, right = slide.
export const SCENE_W = 1120
export const SLIDE_W = STAGE_W - SCENE_W // 800

// Scale the fixed 1920×1080 stage down to fit the current window (preview only).
function useFitScale() {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

interface StageFrameProps {
  scene?: SceneSpec
  slide: Slide
  bannerTitle: string
  bannerKicker: string
  /** Concept brand accent — the section banner pill fill. */
  accent: string
  opener?: Opener | null
  onOpenerDone?: () => void
  highlight?: string[]
  focus?: string | string[]
  zoom?: boolean
}

export default function StageFrame({
  scene,
  slide,
  bannerTitle,
  bannerKicker,
  accent,
  opener,
  onOpenerDone,
  highlight,
  focus,
  zoom,
}: StageFrameProps) {
  const scale = useFitScale()
  return (
    <div className="grid h-full w-full place-items-center">
      {/* Sizer occupies the SCALED footprint so the stage centers cleanly; the stage
          itself scales from its top-left corner to fill it. */}
      <div style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
        <div
          className="relative flex overflow-hidden bg-scene shadow-2xl"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* While the opener holds, the scene shows its whole-scene overview (no
              focus/highlight); the camera only pans once the opener fades away. */}
          <ScenePane
            width={SCENE_W}
            scene={scene}
            highlight={opener ? undefined : highlight}
            focus={opener ? undefined : focus}
            zoom={opener ? false : zoom}
          />
          <SlidePane width={SLIDE_W} slide={slide} accent={accent} />
          {!opener && <SectionBanner title={bannerTitle} kicker={bannerKicker} accent={accent} />}
          {opener && (
            <ModuleOpener
              concept={opener.concept}
              moduleNo={opener.moduleNo}
              title={opener.title}
              accent={opener.accent}
              accentDeep={opener.accentDeep}
              width={SLIDE_W}
              onDone={onOpenerDone}
            />
          )}
        </div>
      </div>
    </div>
  )
}
