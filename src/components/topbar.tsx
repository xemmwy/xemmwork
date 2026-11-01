import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Moon, Search, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmmMark, Wordmark } from '@/components/marks'
import { SECTION_COUNT, SECTION_LABEL, isMac, useCommand } from '@/components/command'
import { SECTIONS, toSection, type Route } from '@/lib/route'
import { flipTheme, useDark } from '@/lib/theme'

/** Which home section is on screen. */
function useSpy(enabled: boolean) {
  const [current, setCurrent] = useState('')
  useEffect(() => {
    if (!enabled) return
    const els = SECTIONS.map((s) => document.getElementById(s)).filter(Boolean) as HTMLElement[]
    const on = () => {
      const y = window.innerHeight * 0.35
      let hit = ''
      for (const el of els) if (el.getBoundingClientRect().top <= y) hit = el.id
      setCurrent(hit)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [enabled])
  return enabled ? current : 'brands'
}

export function Topbar({ route }: { route: Route }) {
  const current = useSpy(route.page === 'home')
  const nav = useRef<HTMLDivElement>(null)
  const [block, setBlock] = useState<{ x: number; w: number } | null>(null)
  const dark = useDark()
  const command = useCommand()

  useLayoutEffect(() => {
    const measure = () => {
      const el = nav.current?.querySelector<HTMLElement>(`[data-id="${current}"]`)
      setBlock(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [current])

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-canvas">
        <div className="page flex h-[60px] items-center gap-4">
          <a href="#/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex shrink-0 items-center gap-2.5" aria-label="xEMMWORK, home">
            <EmmMark className="size-[22px] text-ink" />
            <Wordmark className="text-[17px]" />
          </a>
          <nav ref={nav} className="relative ml-auto hidden items-center lg:flex" aria-label="Sections">
            {block && <span className="navblock" style={{ width: block.w, transform: `translateX(${block.x}px)` }} />}
            {SECTIONS.map((s) => (
              <button key={s} data-id={s} onClick={() => toSection(s)} aria-current={current === s ? 'true' : undefined}
                className="relative flex h-[38px] items-center gap-1.5 px-3.5 text-[14px] font-medium text-dim transition-colors hover:text-ink aria-[current]:text-ink">
                {SECTION_LABEL[s]}
                {SECTION_COUNT[s] != null && <span className="text-[12px] tabular-nums text-dim">{SECTION_COUNT[s]}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" onClick={command} aria-label="Jump to anything" aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'} className="dz-card h-[38px] gap-1.5 px-2.5" />}>
                <Search className="sm:hidden" />
                <span className="hidden items-center gap-1 sm:inline-flex"><kbd className="kbd">{isMac ? '⌘' : 'Ctrl'}</kbd><kbd className="kbd">K</kbd></span>
              </TooltipTrigger>
              <TooltipContent>Jump to anything</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={flipTheme} aria-label={dark ? 'Light theme' : 'Dark theme'} className="dz-card" />}>
                {dark ? <Sun /> : <Moon />}
              </TooltipTrigger>
              <TooltipContent>{dark ? 'Light theme' : 'Dark theme'}</TooltipContent>
            </Tooltip>
            <Button onClick={() => toSection('about')}>Say hi</Button>
          </div>
        </div>
        {/* small screens: the sections as a scrolling row */}
        <nav className="page flex gap-1 overflow-x-auto pb-2 lg:hidden" aria-label="Sections">
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => toSection(s)} aria-current={current === s ? 'true' : undefined}
              className="h-[32px] shrink-0 bg-chip px-3 text-[13px] font-medium text-dim aria-[current]:bg-chip-hover aria-[current]:text-ink">
              {SECTION_LABEL[s]}
            </button>
          ))}
        </nav>
        <div className="h-px bg-guide" />
      </div>
    </header>
  )
}
