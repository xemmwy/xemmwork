import { Fragment, useMemo, useRef } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Pic } from '@/components/pic'
import { useLightbox } from '@/components/lightbox'
import { DitherFade, Plus, Reveal, SectionHead } from '@/components/marks'
import { TypesetGuides, useTypeset } from '@/components/typeset'
import { Websites } from '@/components/websites'
import { content, years, type Brand, type Shot } from '@/lib/content'
import { toSection } from '@/lib/route'
import { cn } from '@/lib/utils'

const { site, brands, logos, marks, posters, graphics, facts } = content
const websites = site.websites ?? []

export function Home() {
  return (
    <main className="page relative z-[1]">
      <Hero />
      <LogoRibbon />
      <Brands />
      <Websites n="02" />
      <Logos />
      <Posters />
      <Graphics />
      <About />
    </main>
  )
}

/* ------------------------------------------------------------------ hero */
function underline(text: string, words: string[]) {
  if (!words.length) return text
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`)
  return text.split(re).map((part, i) => (words.includes(part) ? <span key={i} className="u-orange">{part}</span> : <Fragment key={i}>{part}</Fragment>))
}

function Hero() {
  const frame = useRef<HTMLElement>(null)
  const head = useRef<HTMLHeadingElement>(null)
  const { playing, late, layout } = useTypeset(frame, head)
  const stats = [
    { id: 'brands', n: brands.length, label: 'Brand identities' },
    { id: 'logos', n: logos.length + marks.length, label: 'Logos and marks' },
    { id: 'posters', n: posters.length, label: 'Posters' },
    { id: 'graphics', n: graphics.length, label: 'Graphic designs' },
  ]
  return (
    <section ref={frame} className="framed pt-[clamp(44px,8vw,120px)]">
      {playing && layout && <TypesetGuides layout={layout} />}
      <div className="t-label rise-in">{site.studio} · Portfolio of {site.name} · {years.from}–{years.to}</div>
      <h1 ref={head} className={cn('t-display relative z-[1] mt-6 max-w-[19ch]', !late && 'rise-in')} style={late ? undefined : { animationDelay: '60ms' }}>
        {site.intro.map((line, i) => (
          <span
            key={i}
            data-line
            className={cn('block', i === 0 && 'text-dim', playing && (layout ? 'typeset-line' : 'typeset-wait'))}
            style={playing && layout ? { animationDelay: `${150 + i * 140}ms` } : undefined}
          >
            {playing && <i className="probe" />}
            {underline(line, ['brands', 'websites'])}
          </span>
        ))}
      </h1>
      <div className="cells mt-[clamp(36px,6vw,80px)] grid grid-cols-2 lg:grid-cols-4 rise-in" style={{ animationDelay: late ? '720ms' : '140ms' }}>
        {stats.map((s) => (
          <button key={s.id} onClick={() => toSection(s.id)} className="dz-card group flex items-end justify-between gap-3 bg-canvas p-5 text-left transition-colors hover:bg-surface">
            <span>
              <span className="block text-[clamp(30px,3.4vw,46px)] leading-none font-semibold tracking-[-.05em] text-ink tabular-nums">{s.n}</span>
              <span className="mt-2 block text-[14px] text-dim">{s.label}</span>
            </span>
            <ArrowDownRight className="size-5 text-dim transition-colors group-hover:text-orange" />
          </button>
        ))}
      </div>
    </section>
  )
}

/** Every logo, drifting past in a strip under the hero. */
function LogoRibbon() {
  const open = useLightbox()
  const shots: Shot[] = logos.map((l) => ({ img: l.alt, title: l.name || 'Logo', sub: 'All Logos Here, Vol. 1' }))
  if (!logos.length) return null
  return (
    <div className="framed mt-12 overflow-hidden" aria-label="Logos">
      <div className="marquee">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex" aria-hidden={rep === 1 || undefined}>
            {logos.map((l, i) => (
              <button key={i} tabIndex={rep ? -1 : 0} onClick={() => open(shots, i)} className="logo-tile w-[clamp(96px,10vw,148px)] border-r border-[var(--x-bg)]" aria-label={l.name || 'Logo'}>
                <img src={l.img.thumb} alt="" loading="lazy" decoding="async" />
                <img src={l.alt.thumb} alt="" loading="lazy" decoding="async" className="alt" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ brands */
/** Rows of two big cards, then three smaller ones; the last row shares whatever space is left. */
function brandRows(list: Brand[]) {
  const rows: Brand[][] = []
  let k = 0, big = true
  while (k < list.length) {
    const size = big ? 2 : 3
    rows.push(list.slice(k, k + size))
    k += size
    big = !big
  }
  return rows
}

function Brands() {
  const rows = useMemo(() => brandRows(brands), [])
  return (
    <section id="brands" className="pt-24">
      <SectionHead n="01" title="Brand identities" count={brands.length} note="Identity systems for clients, design briefs and my own brands. Open one to see the whole system." />
      <div className="mt-8 flex flex-col gap-px">
        {rows.map((row, r) => (
          <div key={r} className={cn('cells grid grid-cols-1 sm:grid-cols-2', row.length === 3 && 'lg:grid-cols-3', row.length === 1 && 'sm:grid-cols-1')}>
            {row.map((b) => <BrandCard key={b.slug} b={b} big={row.length <= 2} />)}
          </div>
        ))}
      </div>
    </section>
  )
}

function BrandCard({ b, big }: { b: Brand; big: boolean }) {
  return (
    <Reveal>
      <a href={`#/brand/${b.slug}`} className="lift dz-card group flex h-full flex-col bg-canvas outline-none">
        <div className="relative">
          <Pic img={b.cover} ratio={big ? 16 / 11 : 1} alt={`${b.title} cover`} />
          <span className="chip chip--orange absolute top-3 right-3 gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            View <ArrowUpRight className="size-3.5" />
          </span>
        </div>
        <div className="px-4 pt-3.5 pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className={cn('truncate font-semibold tracking-[-.03em] text-ink', big ? 'text-[22px]' : 'text-[18px]')}>{b.title}</span>
            <span className="shrink-0 text-[13px] tabular-nums text-ink-2">{b.year}</span>
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-4 text-[13.5px] text-dim">
            <span className="truncate">{b.kind}{big && ` · ${b.tags.join(', ')}`}</span>
            <span className="shrink-0 tabular-nums">{b.items.length + 1} images</span>
          </div>
        </div>
      </a>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ logos */
function Logos() {
  const open = useLightbox()
  const logoShots: Shot[] = logos.map((l) => ({ img: l.alt, title: l.name || 'Logo', sub: 'All Logos Here, Vol. 1' }))
  const markShots: Shot[] = marks.map((m) => ({ img: m.img, title: m.name, sub: 'Mark' }))
  return (
    <section id="logos" className="pt-28">
      <SectionHead n="03" title="Logos" count={logos.length + marks.length} note="All Logos Here, Vol. 1, then marks for clients and the House of EMM. Hover a tile for its original colours." />
      <div className="cells mt-8 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
        {logos.map((l, i) => (
          <button key={i} onClick={() => open(logoShots, i)} className="logo-tile group" aria-label={l.name || 'Logo'}>
            <img src={l.img.thumb} alt="" loading="lazy" decoding="async" />
            <img src={l.alt.thumb} alt="" loading="lazy" decoding="async" className="alt" />
            {l.name && <span className="absolute top-3 left-3 text-[12px] font-medium text-cream/0 transition-colors group-hover:text-cream">{l.name}</span>}
          </button>
        ))}
      </div>
      <div className="mt-14 mb-5 flex items-baseline gap-3">
        <h3 className="t-heading">Client and house marks</h3>
        <span className="t-label tabular-nums">{marks.length}</span>
      </div>
      <div className="cells grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8">
        {marks.map((m, i) => (
          <button key={i} onClick={() => open(markShots, i)} className="lift group relative bg-tile text-left" aria-label={m.name}>
            <Pic img={m.img} ratio={1} alt="" contain={m.img.w / m.img.h > 1.25} />
            <span className="absolute inset-x-0 bottom-0 bg-[#0b0b0b] px-2.5 py-1.5 text-[12px] font-medium text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{m.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ posters and graphics */
function Wall({ items, cols }: { items: Shot[]; cols?: number }) {
  const open = useLightbox()
  return (
    <div className="masonry mt-8" style={cols ? ({ ['--cols' as string]: cols }) : undefined}>
      {items.map((s, i) => (
        <div key={i} className="spec">
          <button onClick={() => open(items, i)} className="lift group relative block w-full overflow-hidden text-left" aria-label={`${s.title}, ${s.sub}`}>
            <Pic img={s.img} alt="" />
            <div className="cap">
              <DitherFade />
              <div className="bg-canvas px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[14px] font-medium tracking-[-.01em] text-ink">{s.title}</span>
                  <span className="shrink-0 text-[12.5px] tabular-nums text-dim">{s.sub}</span>
                </div>
                {s.img.real && (
                  <div className="spec-line mt-1 flex items-center justify-between gap-3 text-[12px] tabular-nums text-dim">
                    <span className="truncate">{s.img.real.w} × {s.img.real.h} {s.img.real.unit}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <i className="swatch" style={{ background: s.img.color }} />
                      {s.img.color.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
          {/* print-proof crop marks at the trim, shown while the piece is hovered or focused */}
          <span className="crop" aria-hidden />
        </div>
      ))}
    </div>
  )
}

function Posters() {
  const shots = useMemo<Shot[]>(() => posters.map((p) => ({ img: p.img, title: p.title, sub: String(p.year) })), [])
  return (
    <section id="posters" className="pt-28">
      <SectionHead n="04" title="Posters" count={posters.length} note="Film tributes, type and texture studies, and posters made for no one but the wall." />
      <Wall items={shots} />
    </section>
  )
}

function Graphics() {
  const shots = useMemo<Shot[]>(() => graphics.map((g) => ({ img: g.img, title: g.title, sub: [g.client, g.year].filter(Boolean).join(' · ') })), [])
  return (
    <section id="graphics" className="pt-28">
      <SectionHead n="05" title="Graphic design" count={graphics.length} note="Campaign posts, menus, channel art, typography and studies." />
      <Wall items={shots} cols={3} />
    </section>
  )
}

/* ------------------------------------------------------------------ about */
function About() {
  const house = site.house ?? []
  return (
    <section id="about" className="pt-28 pb-8">
      <SectionHead n="06" title="About" />
      <div className="grid gap-x-16 gap-y-10 pt-10 pb-16 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <p className="text-[clamp(24px,2.6vw,36px)] leading-[1.12] font-medium tracking-[-.035em] text-ink">
            {underline(site.lead ?? site.intro.join(' '), ['Design Generalist', 'Brand Design'])}
          </p>
          <div className="mt-7 max-w-[56ch] space-y-3 text-[16px] leading-relaxed text-ink-2">
            {(site.about ?? []).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {site.handles.map((h) => (
              <a key={h.label} href={h.url} target="_blank" rel="noreferrer" className="sb-accent inline-flex h-[42px] items-center gap-2 px-5 text-[14.5px]">
                {h.label} <ArrowUpRight className="size-4" />
              </a>
            ))}
            {site.email && (
              <a href={`mailto:${site.email}`} className="inline-flex h-[42px] items-center gap-2 bg-chip px-5 text-[14.5px] font-medium text-ink hover:bg-chip-hover">{site.email}</a>
            )}
          </div>
        </Reveal>
        <Reveal className="cells grid h-max grid-cols-2" delay={80}>
          <Fact label="Studio" value={site.studio} />
          <Fact label="Called" value={site.alias} />
          {house.length > 0 && <Fact label="House of EMM" value={house.join(', ')} wide />}
          {facts.tools && facts.tools.length > 0 && <Fact label="Works in" value={facts.tools.join(', ')} wide />}
          <Fact label="On this site" value={[
            `${brands.length} brands`,
            websites.length ? `${websites.length} website${websites.length > 1 ? 's' : ''}` : '',
            `${logos.length + marks.length} logos`, `${posters.length} posters`, `${graphics.length} graphics`,
          ].filter(Boolean).join(', ')} wide />
        </Reveal>
      </div>
    </section>
  )
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn('bg-canvas p-5', wide && 'col-span-2')}>
      <div className="t-label flex items-center gap-2"><Plus className="text-cross" />{label}</div>
      <div className="mt-2 text-[16px] font-medium tracking-[-.015em] text-ink">{value}</div>
    </div>
  )
}
