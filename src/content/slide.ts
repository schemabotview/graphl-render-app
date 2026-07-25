// Parse a `.slide` file into the right-pane model. A `.slide` is a *curated, one-screen*
// subset of Markdown (title + section labels + ordered/unordered lists + paragraphs, and
// — for later slides — tables + fenced code). We split off the leading `# Title` (used for
// the right-pane heading AND the section banner) and hand the rest to `SlidePane`, which
// renders it as Markdown. Everything below the title is the `body`, verbatim.

export interface Slide {
  title: string
  body: string // the Markdown after the `# Title` line (lists, paragraphs, tables, code)
}

export function parseSlide(text: string): Slide {
  const lines = text.split('\n')
  let title = ''
  const rest: string[] = []
  for (const raw of lines) {
    if (!title && raw.trim().startsWith('# ')) {
      title = raw.trim().slice(2).trim()
    } else {
      rest.push(raw)
    }
  }
  return { title, body: rest.join('\n').trim() }
}
