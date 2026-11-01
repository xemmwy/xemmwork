import { useMemo } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pic } from '@/components/pic'
import { useLightbox } from '@/components/lightbox'
import { Plus, Reveal } from '@/components/marks'
import { content, ratio, type Img, type Shot } from '@/lib/content'
import { toSection } from '@/lib/route'

const { brands } = content

/** Justified rows: wide pictures get a row of their own; the rest share rows at one height. */
function rows(items: { img: Img; k: number }[]) {
  const out: { img: Img; k: number }[][] = []
  let cur: { img: Img; k: number }[] = []
  let sum = 0
  for (const it of items) {
    const r = ratio(it.img)
    if (r >= 1.55) {
      if (cur.length) out.push(cur)
      out.push([it]); cur = []; sum = 0
      continue
    }
    cur.push(it); sum += r
    if (sum >= 2.3 || cur.length === 3) { out.push(cur); cur = []; sum = 0 }
  }
  if (cur.length) {
    const last = out[out.length - 1]
    // a lone leftover joins the row before it when that row has room
    if (cur.length === 1 && last && last.length < 3 && ratio(last[0].img) < 1.55) last.push(cur[0])
    else out.push(cur)
  }
  return out
}

export function BrandPage({ slug }: { slug: string }) {
  const open = useLightbox()
  const i = brands.findIndex((b) => b.slug === slug)
  const b = brands[i]
  const shots = useMemo<Shot[]>(() => (b ? [b.cover, ...b.items].map((img) => ({ img, title: b.title, sub: `${b.kind} · ${b.year}` })) : []), [b])
  const gallery = useMemo(() => (b ? rows(b.items.map((img, k) => ({ img, k: k + 1 }))) : []), [b])

  if (!b) {
    return (
      <main className="page relative z-[1] py-32">
        <h1 className="t-title">Not here</h1>
        <p className="mt-4 text-dim">That project isn't in the portfolio.</p>
        <Button className="mt-8" onClick={() => toSection('brands')}><ArrowLeft /> All brands</Button>
      </main>
    )
  }
  const prev = brands[(i - 1 + brands.length) % brands.length]
  const next = brands[(i + 1) % brands.length]

  return (
    <main className="page relative z-[1]" key={slug}>
      <div className="flex items-center justify-between py-5">
        <Button variant="ghost" onClick={() => toSection('brands')}><ArrowLeft /> All brands</Button>
        <span className="t-label tabular-nums">{String(i + 1).padStart(2, '0')} / {String(brands.length).padStart(2, '0')}</span>
      </div>

      <header className="framed grid items-end gap-x-16 gap-y-6 pt-[clamp(20px,5vw,64px)] pb-10 lg:grid-cols-[1.3fr_1fr] rise-in">
        <div>
          <div className="t-label">{b.kind} · {b.year}</div>
          <h1 className="t-title mt-3">{b.title}</h1>
        </div>
        <div>
          <p className="max-w-[54ch] text-[16.5px] leading-relaxed text-ink-2">{b.blurb}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {b.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            <span className="chip">{shots.length} images</span>
          </div>
        </div>
      </header>

      {/* the cover, matted on the surface so nothing gets cropped */}
      <button onClick={() => open(shots, 0)} className="mt-10 block w-full bg-surface p-[clamp(12px,3.5vw,48px)] rise-in" style={{ animationDelay: '80ms' }} aria-label={`${b.title}, open cover`}>
        <div className="mx-auto" style={{ maxWidth: `min(100%, calc(76vh * ${ratio(b.cover)}))` }}>
          <Pic img={b.cover} full eager alt={`${b.title} cover`} />
        </div>
      </button>

      <div className="mt-[14px] flex flex-col gap-[14px]">
        {gallery.map((row, r) => (
          <Reveal key={r} className="jrow flex gap-[14px] max-md:flex-col">
            {row.map(({ img, k }) => {
              const lone = row.length === 1 && ratio(img) < 1.55
              return (
                <button key={k} onClick={() => open(shots, k)} className="lift block min-w-0 max-md:!w-full max-md:!flex-none"
                  style={lone ? { width: `min(100%, calc(80vh * ${ratio(img)}))`, margin: '0 auto' } : { flex: `${ratio(img)} 1 0%` }}
                  aria-label={`${b.title}, image ${k + 1}`}>
                  <Pic img={img} alt="" />
                </button>
              )
            })}
          </Reveal>
        ))}
      </div>

      <nav className="cells mt-20 mb-10 grid grid-cols-1 md:grid-cols-2" aria-label="More brands">
        {[{ d: 'Previous', p: prev, icon: <ArrowLeft className="size-4" /> }, { d: 'Next', p: next, icon: <ArrowRight className="size-4" /> }].map(({ d, p, icon }) => (
          <a key={d} href={`#/brand/${p.slug}`} className="lift dz-card group flex items-center gap-5 bg-canvas p-4 transition-colors hover:bg-surface">
            <Pic img={p.cover} ratio={1} className="w-[88px] shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="t-label flex items-center gap-2"><Plus className="text-cross" />{d}</div>
              <div className="mt-1 truncate text-[22px] font-semibold tracking-[-.035em] text-ink">{p.title}</div>
              <div className="text-[13px] text-dim">{p.kind} · {p.year}</div>
            </div>
            <span className="text-dim transition-colors group-hover:text-orange">{icon}</span>
          </a>
        ))}
      </nav>
    </main>
  )
}
