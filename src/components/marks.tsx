import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Emmency's mark: a cross with a long diagonal through it. */
export function EmmMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden className={className}>
      <path d="M12 5v14M5 12h14M3.5 20.5 20.5 3.5" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline font-semibold tracking-[-.04em] text-ink', className)}>
      <span className="text-orange">x</span>EMM<span className="text-dim">WORK</span>
    </span>
  )
}

/** The two page-height guides at the content edges. */
export function Guides() {
  return (
    <div className="guides" aria-hidden>
      <div className="page"><i /></div>
    </div>
  )
}

export function Plus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 11 11" aria-hidden className={cn('size-[11px]', className)}>
      <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/** A section's heading row: number, name, count, and a short note. */
export function SectionHead({ n, title, count, note, children }: { n: string; title: string; count?: number; note?: string; children?: ReactNode }) {
  return (
    <div className="framed flex flex-wrap items-end justify-between gap-x-10 gap-y-4 py-7">
      <div className="flex items-baseline gap-4">
        <span className="t-label w-7 tabular-nums">{n}</span>
        <h2 className="t-section">{title}</h2>
        {count != null && <span className="t-label tabular-nums">{count}</span>}
      </div>
      <div className="flex items-center gap-4">
        {note && <p className="max-w-[46ch] text-[14px] text-dim">{note}</p>}
        {children}
      </div>
    </div>
  )
}

/** Fades a block in the first time it scrolls into view. */
export function Reveal({ children, className, as: Tag = 'div', delay = 0 }: { children: ReactNode; className?: string; as?: 'div' | 'section'; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect() }
    }, { rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={cn('reveal', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</Tag>
}

/** Three dithered steps from transparent to a colour; a fade without a gradient. */
export function DitherFade({ className, color, flip }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <div className={cn('dfade', flip && 'flex-col-reverse', className)} style={color ? ({ '--fc': color } as CSSProperties) : undefined} aria-hidden>
      <i /><i /><i />
    </div>
  )
}
