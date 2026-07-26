import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import type { Components } from 'react-markdown'
import type { Slide } from '../content/slide.ts'

// Walk a rendered React subtree back to its raw text (highlight.js/react-markdown nest the
// fence body in <code> + token spans, so there's no single string to read).
function rawText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(rawText).join('')
  if (typeof node === 'object' && 'props' in node)
    return rawText((node as { props: { children?: React.ReactNode } }).props.children)
  return ''
}

// A fence is a *code* block only when it carries a real syntax language (```python, ```sql).
// Untagged fences — and explicit ```text / ```plain / ```ascii / ```diagram — are hand-drawn
// ASCII *diagrams*: render them calm, not as a code snippet.
function isCodeFence(children: React.ReactNode): boolean {
  const child = Array.isArray(children) ? children[0] : children
  const cls =
    child && typeof child === 'object' && 'props' in child
      ? ((child as { props: { className?: string } }).props.className ?? '')
      : ''
  return /language-(?!text\b|plain\b|ascii\b|diagram\b)\w+/.test(cls)
}

// An authored ASCII diagram: legible monospace with alignment/rules preserved, a single
// muted ink, and `←` side-annotations dimmed a step so the labels lead. Not syntax-
// highlighted — it's a picture, not code.
function DiagramBlock({ children }: { children: React.ReactNode }) {
  const lines = rawText(children).replace(/\n+$/, '').split('\n')
  return (
    <div className="mt-7 overflow-x-auto rounded-md border border-white/10 bg-white/[0.03] px-5 py-4">
      <pre className="whitespace-pre font-mono text-[18px] leading-relaxed text-white/75">
        {lines.map((line, i) => {
          const arrow = line.indexOf('←')
          return (
            <div key={i}>
              {arrow === -1 ? (
                line || ' '
              ) : (
                <>
                  {line.slice(0, arrow)}
                  <span className="text-white/35">{line.slice(arrow)}</span>
                </>
              )}
            </div>
          )
        })}
      </pre>
    </div>
  )
}

// Right pane — the slide, rendered from a *curated subset* of Markdown (see `slide.ts`).
// The `# Title` is split off upstream and drawn as the heading; `slide.body` is the rest:
// `##` section labels, ordered/unordered lists, paragraphs, and GFM tables + fenced code.
// Each element is mapped to video typography sized for 1080p (large, bold key term white,
// softer body gray, teal list markers).
const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-6 text-[28px] font-bold leading-snug text-role-teal first:mt-0">
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="mt-6 text-[26px] leading-snug text-white/70 first:mt-0">{children}</p>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-4 pl-11 marker:font-semibold marker:tabular-nums marker:text-role-teal">
      {children}
    </ol>
  ),
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-4 pl-9 marker:text-role-teal">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="pl-2 text-[26px] leading-snug text-white/60">{children}</li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-white/80">{children}</em>,
  table: ({ children }) => (
    <div className="mt-7 overflow-hidden rounded-md border border-white/10">
      <table className="w-full border-collapse text-[21px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/10 bg-white/5 px-5 py-2.5 text-left font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/5 px-5 py-2.5 text-white/70">{children}</td>
  ),
  pre: ({ children }) =>
    isCodeFence(children) ? (
      <pre className="mt-7 overflow-x-auto rounded-md border border-white/10 bg-white/[0.03] px-5 py-4 text-[15px] leading-relaxed">
        {children}
      </pre>
    ) : (
      <DiagramBlock>{children}</DiagramBlock>
    ),
  code: ({ className, children }) =>
    className ? (
      // fenced block (inside <pre>) — keep hljs token colors, but drop the stylesheet's
      // own background + padding so the <pre> panel is the single container.
      <code className={`${className} !bg-transparent !p-0`}>{children}</code>
    ) : (
      // inline code
      <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-[0.85em] text-role-teal">
        {children}
      </code>
    ),
}

export default function SlidePane({
  width,
  slide,
  accent,
}: {
  width: number
  slide: Slide
  /** Concept brand accent (from the catalog) — colors the slide title. */
  accent: string
}) {
  return (
    <section
      className="flex h-full shrink-0 flex-col justify-center border-l border-white/10 bg-scene px-16 py-14"
      style={{ width }}
    >
      <h1 className="text-[40px] font-bold leading-tight" style={{ color: accent }}>
        {slide.title}
      </h1>
      <div className="mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
          {slide.body}
        </ReactMarkdown>
      </div>
    </section>
  )
}
