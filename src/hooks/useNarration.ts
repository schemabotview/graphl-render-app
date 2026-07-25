import { useEffect, useRef, useState } from 'react'

// The narration channel: one <audio> for the app's lifetime. Loading a section's clip
// keeps the play state (if narration is on, the next clip auto-plays), and a clip that
// finishes calls `onEnded` so playback can auto-advance to the next section. A missing
// `.wav` (not yet generated) fails silently — paging still works, just no audio.
export function useNarration(src: string | undefined, onEnded: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const endedRef = useRef(onEnded)
  endedRef.current = onEnded
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(playing)
  playingRef.current = playing

  useEffect(() => {
    const a = new Audio()
    a.addEventListener('ended', () => endedRef.current())
    audioRef.current = a
    return () => a.pause()
  }, [])

  // Load the current section's clip; resume playing if narration was on.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    if (src) {
      a.src = src
      if (playingRef.current) a.play().catch(() => {})
    } else {
      // Fully unload the current clip — removing the attribute alone leaves the buffered
      // resource, which a later play() would resume. `load()` after clearing resets it.
      a.removeAttribute('src')
      a.load()
    }
  }, [src])

  const toggle = () => {
    const a = audioRef.current
    if (!a || !a.getAttribute('src')) return // nothing loaded (a section with no wav)
    if (playingRef.current) {
      a.pause()
      setPlaying(false)
    } else {
      a.play().catch(() => {})
      setPlaying(true)
    }
  }

  /** Hard stop — pause and clear the play state (used when leaving the player). */
  const stop = () => {
    audioRef.current?.pause()
    setPlaying(false)
  }

  return { playing, toggle, stop }
}
