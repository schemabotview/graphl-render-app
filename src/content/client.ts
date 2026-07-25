import type { Manifest } from './types.ts'

// Runtime fetch from a concept's contentBaseUrl (raw GitHub serves CORS `*`).

/** Join a content base URL with a repo-relative path. */
export const contentUrl = (base: string, path: string) => `${base}/${path}`

async function getText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`)
  return res.text()
}

export async function fetchManifest(base: string): Promise<Manifest> {
  return JSON.parse(await getText(contentUrl(base, 'manifest.json'))) as Manifest
}

/** Fetch a repo-relative text file (e.g. a `.slide`). */
export const fetchContentText = (base: string, path: string) => getText(contentUrl(base, path))
