import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { ArrowUpRight, Monitor, Smartphone } from 'lucide-react'
import { Reveal, SectionHead } from '@/components/marks'
import { content, type Website, type WebsiteVersion } from '@/lib/content'
import { cn } from '@/lib/utils'

/** Event other parts of the site (⌘K) use to open a site card straight into its live view. */
export const LIVE_EVENT = 'xemm:live'

export function Websites({ n }: { n: string }) {
  const list = content.site.websites ?? []
  if (!list.length) return null
  return (
    <section id="websites" className="pt-28">
      <SectionHead n={n} title="Websites" count={list.length} note="Landing pages and web apps I design and build, start to finish." />
      <div className="mt-8 flex flex-col gap-px">
        {list.map((w) => <SiteCard key={w.slug} w={w} />)}
      </div>
    </section>
  )
}

type View = 'compare' | 'live'
type Device = 'desktop' | 'phone'

function SiteCard({ w }: { w: Website }) {
  const [v, setV] = useState(0)
  const [view, setView] = useState<View>('compare')
  const [device, setDevice] = useState<Device>('desktop')
  const ver = w.versions[v]

  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent<string>).detail === w.slug) setView('live') }
    window.addEventListener(LIVE_EVENT, on)
    return () => window.removeEventListener(LIVE_EVENT, on)
  }, [w.slug])

  return (
    <Reveal>
      <article className="cells grid" aria-label={w.title}>
        <div className="bg-canvas">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <Seg label="Version" accent value={String(v)} onChange={(id) => setV(Number(id))}
              items={w.versions.map((x, i) => ({ id: String(i), label: x.label }))} />
            <div className="flex flex-wrap items-center gap-2">
              {view === 'live' && (
                <Seg label="Screen size" value={device} onChange={(d) => setDevice(d as Device)}
                  items={[{ id: 'desktop', label: 'Desktop', icon: <Monitor /> }, { id: 'phone', label: 'Phone', icon: <Smartphone /> }]} />
              )}
              {ver.live && (
                <Seg label="View" value={view} onChange={(x) => setView(x as View)}
                  items={[{ id: 'compare', label: 'Compare' }, { id: 'live', label: 'Live' }]} />
              )}
              {ver.live && (
                <a href={ver.live} target="_blank" rel="noreferrer" className="dz-card inline-flex h-[34px] items-center gap-1.5 bg-chip px-3 text-[13.5px] font-medium text-ink-2 hover:text-ink">
                  Open <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </div>
          </div>
          <div className={cn('relative overflow-hidden bg-tile', view === 'live' ? 'aspect-[4/5] sm:aspect-[16/10]' : 'aspect-[16/10]')}>
            {view === 'compare' || !ver.live
              ? <Compare w={w} ver={ver} />
              : <Live key={`${ver.live}-${device}`} url={ver.live} device={device} title={`${w.title}, ${ver.label}, live`} />}
          </div>
          <div className="px-4 pt-3.5 pb-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-[22px] font-semibold tracking-[-.03em] text-ink">{w.title}</span>
              <span className="shrink-0 text-[13px] tabular-nums text-ink-2">{w.year}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 text-[13.5px] text-dim">
              <span className="min-w-0 max-w-full truncate">{w.kind} · {w.tags.join(', ')}</span>
              <span className="shrink-0">{view === 'live' ? 'Live: scroll and click around' : 'Drag to compare with the original'}</span>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

/** A row of square toggle buttons; the chosen one is filled. */
function Seg({ label, items, value, onChange, accent }: {
  label: string; items: { id: string; label: string; icon?: ReactNode }[]; value: string; onChange: (id: string) => void; accent?: boolean
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-px">
      {items.map((it) => {
        const on = it.id === value
        return (
          <button key={it.id} type="button" aria-pressed={on} onClick={() => onChange(it.id)}
            className={cn('inline-flex h-[34px] items-center gap-1.5 px-3.5 text-[13.5px] font-medium [&_svg]:size-3.5',
              on ? (accent ? 'sb-accent' : 'dz-card bg-chip-hover text-ink') : 'dz-card bg-chip text-dim hover:text-ink')}>
            {it.icon}{it.label}
          </button>
        )
      })}
    </div>
  )
}

/** The version on top, the client's original underneath; the bar reveals the original. */
function Compare({ w, ver }: { w: Website; ver: WebsiteVersion }) {
  const [pos, setPos] = useState(12)
  const stage = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const moveTo = useCallback((x: number) => {
    const r = stage.current?.getBoundingClientRect()
    if (r && r.width) setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)))
  }, [])

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragging.current = true
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not capturable */ }
    // a mouse jumps straight to the click; touch waits for a sideways move so the page still scrolls
    if (e.pointerType === 'mouse') moveTo(e.clientX)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => { if (dragging.current) moveTo(e.clientX) }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2
    const next = { ArrowLeft: pos - step, ArrowDown: pos - step, ArrowRight: pos + step, ArrowUp: pos + step, Home: 0, End: 100 }[e.key]
    if (next == null) return
    e.preventDefault()
    setPos(Math.min(100, Math.max(0, next)))
  }

  return (
    <div ref={stage} className="absolute inset-0 cursor-ew-resize touch-pan-y select-none"
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <img src={w.original.img} alt={w.original.tag} draggable={false} className="absolute inset-0 h-full w-full object-cover object-top" />
      <span className="site-tag top-3 left-3"><i className="bg-dim" />{w.original.tag}</span>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {w.versions.map((x) => (
          <img key={x.img} src={x.img} alt={x === ver ? x.tag : ''} aria-hidden={x === ver ? undefined : true} draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-top" style={{ opacity: x === ver ? 1 : 0 }} />
        ))}
        <span className="site-tag right-3 bottom-3"><i className="bg-orange" />{ver.tag}</span>
      </div>
      <div role="slider" tabIndex={0} aria-label="Reveal the client's original site" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={Math.round(pos)} aria-valuetext={`${Math.round(pos)}% of the original shown`} onKeyDown={key}
        className="compare-bar absolute inset-y-0 -ml-5 flex w-10 justify-center outline-none" style={{ left: `${pos}%` }}>
        <span className="w-[2px] bg-orange" />
        <span className="sb-accent absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center">
          <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden><path d="M6 1 1 6l5 5M14 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
        </span>
      </div>
    </div>
  )
}

const SCREEN = { desktop: { w: 1280, h: 0 }, phone: { w: 390, h: 844 } }

/** The real site, running: rendered at a true desktop or phone width and scaled to fit the card. */
function Live({ url, device, title }: { url: string; device: Device; title: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const s = SCREEN[device]
  const scale = !size.w ? 1 : device === 'desktop' ? size.w / s.w : Math.min(1, (size.h - 24) / s.h, (size.w - 24) / s.w)
  const vw = s.w
  const vh = device === 'desktop' ? (size.h / scale || 800) : s.h

  return (
    <div ref={box} className="absolute inset-0 grid place-items-center overflow-hidden bg-tile">
      {!ready && (
        <div className="live-wait absolute inset-0 grid place-items-center" aria-hidden>
          <span className="chip">Loading the live site</span>
        </div>
      )}
      {size.w > 0 && (
        <div className={cn('relative overflow-hidden', device === 'phone' && 'outline outline-1 outline-[var(--x-sep)]')}
          style={{ width: vw * scale, height: vh * scale, opacity: ready ? 1 : 0 }}>
          <iframe src={url} title={title} onLoad={() => setReady(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
            style={{ width: vw, height: vh, transform: `scale(${scale})`, transformOrigin: '0 0', border: 0, display: 'block', background: '#0B0B0B' }} />
        </div>
      )}
    </div>
  )
}
