import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LightboxProvider } from '@/components/lightbox'
import { CommandProvider } from '@/components/command'
import { DitherFade, EmmMark, Guides } from '@/components/marks'
import { Topbar } from '@/components/topbar'
import { Home } from '@/views/home'
import { BrandPage } from '@/views/brand'
import { content } from '@/lib/content'
import { useRoute } from '@/lib/route'
import { cn } from '@/lib/utils'

export default function App() {
  const route = useRoute()

  // a case study starts at its top; a home section link scrolls to that section
  useEffect(() => {
    if (route.page === 'brand') {
      window.scrollTo({ top: 0 })
      const b = content.brands.find((x) => x.slug === route.slug)
      document.title = b ? `${b.title} · xEMMWORK` : 'xEMMWORK'
    } else {
      document.title = 'xEMMWORK · EMM, brand and web designer'
      if (route.section) requestAnimationFrame(() => document.getElementById(route.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [route])

  return (
    <TooltipProvider delay={300}>
      <LightboxProvider>
        <CommandProvider>
          <Guides />
          <Topbar route={route} />
          {route.page === 'brand' ? <BrandPage slug={route.slug} /> : <Home />}
          <Footer />
        </CommandProvider>
      </LightboxProvider>
    </TooltipProvider>
  )
}

function Footer() {
  const { site } = content
  return (
    <footer className="relative z-[1] mt-16 overflow-hidden">
      <div className="page">
        <div className="rule" />
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 text-[13.5px] text-dim">
          <span className="flex items-center gap-2"><EmmMark className="size-4 text-ink" /> © {new Date().getFullYear()} {site.name} · {site.studio}</span>
          <span className="flex items-center gap-4">
            {site.handles.map((h) => <a key={h.label} href={h.url} target="_blank" rel="noreferrer" className="hover:text-ink">{h.label}</a>)}
            {site.source && <a href={site.source} target="_blank" rel="noreferrer" className="hover:text-ink">Source ↗</a>}
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1 hover:text-ink">Top <ArrowUp className="size-3.5" /></button>
          </span>
        </div>
        <FitWord className="-mb-[.14em] leading-[.8] font-semibold text-ink select-none *:tracking-[-.07em]">
          <span className="text-orange">x</span>EMMWORK
        </FitWord>
        <DitherFade className="relative -mt-[18px]" />
      </div>
    </footer>
  )
}

/** One line of type sized to fill its container's width exactly. */
function FitWord({ className, children }: { className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [px, setPx] = useState<number>()
  useLayoutEffect(() => {
    const fit = () => {
      const b = box.current, p = probe.current
      const per = p ? p.getBoundingClientRect().width / 100 : 0
      if (b && per) setPx(Math.floor((b.clientWidth / per) * 0.995))
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    if (box.current) ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} aria-hidden className={cn('relative overflow-hidden', className)} style={{ fontSize: px ?? '14vw' }}>
      <span ref={probe} className="invisible absolute top-0 left-0 whitespace-nowrap" style={{ fontSize: 100 }}>{children}</span>
      <span className="block whitespace-nowrap">{children}</span>
    </div>
  )
}
