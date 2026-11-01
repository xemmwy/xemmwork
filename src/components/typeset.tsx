import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

// The first visit of a session: the hero headline sets itself. Orange baseline guides draw across, each line
// develops through the dither levels onto its baseline with the type spec beside it, then the guides dissolve.
// About a second; any key, click, scroll or touch skips it. Not shown with reduced motion, or when the visit
// starts on a section or a case study.
const KEY = 'xemm:typeset'

function canPlay() {
  if (location.hash.replace(/^#\/?/, '')) return false
  if (window.scrollY > 40) return false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { return !sessionStorage.getItem(KEY) } catch { return true }
}

export type Typeset = { lines: number[]; spec: string }

const WEIGHT: Record<string, string> = { '400': 'Regular', '500': 'Medium', '600': 'Semibold', '700': 'Bold' }

/** Baselines of every visual line in `head`, measured from the top of `frame`, plus the type spec. */
function measure(frame: HTMLElement, head: HTMLElement): Typeset {
  const top = frame.getBoundingClientRect().top
  const cs = getComputedStyle(head)
  const size = parseFloat(cs.fontSize)
  const lead = parseFloat(cs.lineHeight) || size
  const lines: number[] = []
  head.querySelectorAll<HTMLElement>('[data-line]').forEach((line) => {
    const probe = line.querySelector('.probe') // a zero-size inline block: its bottom sits on the baseline
    if (!probe) return
    const base = probe.getBoundingClientRect().bottom - top
    const rows = Math.max(1, Math.round(line.getBoundingClientRect().height / lead))
    for (let k = 0; k < rows; k++) lines.push(Math.round(base + k * lead))
  })
  const family = cs.fontFamily.split(',')[0].replace(/['"]/g, '').replace(/ Variable$/, '')
  const weight = WEIGHT[cs.fontWeight] ?? cs.fontWeight
  const track = Math.round((parseFloat(cs.letterSpacing) / size) * 1000) || 0
  return { lines, spec: `${family} ${weight} · ${Math.round(size)}/${Math.round(lead)} · ${track < 0 ? `−${-track}` : track}` }
}

export function useTypeset(frame: RefObject<HTMLElement | null>, head: RefObject<HTMLElement | null>) {
  const [playing, setPlaying] = useState(canPlay)
  // whether this hero began with the intro; fixed for its lifetime so other entrance delays never jump
  const late = useRef(playing).current
  const [layout, setLayout] = useState<Typeset | null>(null)

  useLayoutEffect(() => {
    if (!playing) return
    try { sessionStorage.setItem(KEY, '1') } catch { /* storage blocked: it plays once per page load */ }
    let alive = true
    let timer = 0
    const stop = () => setPlaying(false)
    const skips = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const
    skips.forEach((e) => window.addEventListener(e, stop, { passive: true }))
    // measure with the real font, or the baselines are wrong; if it is slow, skip the intro altogether
    const giveUp = window.setTimeout(stop, 700)
    const cs = head.current ? getComputedStyle(head.current) : null
    const font = cs && document.fonts ? document.fonts.load(`${cs.fontWeight} 1em ${cs.fontFamily}`) : Promise.resolve()
    font.catch(() => null).then(() => {
      if (!alive || !frame.current || !head.current) return
      window.clearTimeout(giveUp)
      setLayout(measure(frame.current, head.current))
      timer = window.setTimeout(stop, 1150)
    })
    return () => {
      alive = false
      window.clearTimeout(giveUp)
      window.clearTimeout(timer)
      skips.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [playing, frame, head])

  return { playing, late, layout }
}

/** The guides and the type spec, drawn over the hero while it sets. */
export function TypesetGuides({ layout }: { layout: Typeset }) {
  if (!layout.lines.length) return null
  return (
    <div className="typeset" aria-hidden>
      {layout.lines.map((y, i) => (
        <i key={i} style={{ top: y, animationDelay: `${i * 70}ms, 800ms` }} />
      ))}
      <span style={{ top: layout.lines[0] }}>{layout.spec}</span>
    </div>
  )
}
