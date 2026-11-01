import raw from '../content.json'

// Written by curate/render.py from curate/picks.py. Edit the picks, not this data.
export type Img = {
  src: string; thumb: string; w: number; h: number; color: string; anim: boolean
  /** the artwork's own size (posters and graphics): pixels for images, millimetres for Illustrator artboards */
  real?: { w: number; h: number; unit: 'px' | 'mm' } | null
}
export type Brand = { slug: string; title: string; kind: string; year: number; blurb: string; tags: string[]; cover: Img; items: Img[] }
export type Logo = { name: string; img: Img; alt: Img; n: number }
export type Mark = { name: string; img: Img }
export type Poster = { title: string; year: number; img: Img }
export type Graphic = { title: string; year: number; client: string; img: Img }
export type WebsiteVersion = { label: string; tag: string; img: string; thumb: string; live?: string }
export type Website = {
  slug: string; title: string; year: number; kind: string; tags: string[]
  original: { img: string; thumb: string; tag: string }; versions: WebsiteVersion[]
}
export type Site = {
  name: string; alias: string; studio: string; intro: string[]; lead?: string; about?: string[]; house?: string[]
  handles: { label: string; url: string }[]; email: string; websites?: Website[]; source?: string
}
export type Content = {
  site: Site; brands: Brand[]; logos: Logo[]; marks: Mark[]; posters: Poster[]; graphics: Graphic[]
  facts: { files?: number; since?: number; tools?: string[] }
}

export const content = raw as unknown as Content

/** One picture as the lightbox shows it. */
export type Shot = { img: Img; title: string; sub?: string; contain?: boolean }

export const ratio = (img: Img) => img.w / img.h

export const years = (() => {
  const ys = [
    ...content.brands.map((b) => b.year),
    ...content.posters.map((p) => p.year),
    ...content.graphics.map((g) => g.year),
  ].filter(Boolean)
  return { from: Math.min(...ys), to: Math.max(...ys) }
})()
