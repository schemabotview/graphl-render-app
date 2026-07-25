import StageFrame from './frame/StageFrame'

/**
 * Route-driven shell (planned). For the scaffold it just mounts the fixed
 * two-pane stage so `npm run dev` shows the frame. Routing, content-fetch,
 * and narration come in later reviewed slices.
 */
export default function App() {
  return <StageFrame />
}
