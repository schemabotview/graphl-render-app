/**
 * Placeholder slide — the right pane. Later slices parse a section's `.slide` file
 * (title + bold-marked bullets/code) and render it here. For now: a static example
 * showing the intended shape (title + concise bullets).
 */
export default function SlidePane() {
  return (
    <div className="flex h-full flex-col justify-center gap-6 px-[6%] py-[7%]">
      <h1 className="text-[2.6vw] font-bold leading-tight text-white">
        GraphL render-app
      </h1>
      <ul className="flex flex-col gap-4 text-[1.4vw] leading-snug text-white/70">
        <li>
          <span className="font-semibold text-white">Left:</span> React Flow scene
          (the mental model).
        </li>
        <li>
          <span className="font-semibold text-white">Right:</span> the authored slide
          (title + bullets).
        </li>
        <li>Narration ties the two together, section by section.</li>
      </ul>
    </div>
  )
}
