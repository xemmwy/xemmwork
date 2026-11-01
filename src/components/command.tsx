import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Command } from 'cmdk'
import { useLightbox } from '@/components/lightbox'
import { LIVE_EVENT } from '@/components/websites'
import { content, type Shot } from '@/lib/content'
import { SECTIONS, go, toSection } from '@/lib/route'
import { flipTheme, useDark } from '@/lib/theme'

const Ctx = createContext<() => void>(() => {})
/** Opens (or closes) the quick-jump palette. */
export const useCommand = () => useContext(Ctx)

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

const websites = content.site.websites ?? []
export const SECTION_LABEL: Record<string, string> = { brands: 'Brands', websites: 'Websites', logos: 'Logos', posters: 'Posters', graphics: 'Graphics', about: 'About' }
export const SECTION_COUNT: Record<string, number | undefined> = {
  brands: content.brands.length, websites: websites.length || undefined,
  logos: content.logos.length + content.marks.length, posters: content.posters.length, graphics: content.graphics.length,
}

/** ⌘K / Ctrl+K (or /) anywhere: jump to any section, brand, website, poster or graphic. */
export function CommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const lightbox = useLightbox()
  const dark = useDark()
  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); return }
      const t = e.target as HTMLElement | null
      const typing = !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const posterShots = useMemo<Shot[]>(() => content.posters.map((p) => ({ img: p.img, title: p.title, sub: String(p.year) })), [])
  const graphicShots = useMemo<Shot[]>(() => content.graphics.map((g) => ({ img: g.img, title: g.title, sub: [g.client, g.year].filter(Boolean).join(' · ') })), [])

  // act after the palette has closed, so focus and scrolling land on the page
  const run = (fn: () => void) => { setOpen(false); window.setTimeout(fn, 40) }

  return (
    <Ctx.Provider value={toggle}>
      {children}
      <Command.Dialog open={open} onOpenChange={setOpen} label="Jump to anything" loop filter={matchWords}
        overlayClassName="cmdk-overlay" contentClassName="cmdk-content">
        <Command.Input placeholder="Jump to a section, brand, poster or graphic" />
        <Command.List>
          <Command.Empty>Nothing by that name.</Command.Empty>
          <Command.Group heading="Sections">
            {SECTIONS.map((s) => (
              <Item key={s} value={`section ${SECTION_LABEL[s]}`} label={SECTION_LABEL[s]} meta={SECTION_COUNT[s]} onSelect={() => run(() => toSection(s))} />
            ))}
          </Command.Group>
          <Command.Group heading="Brand identities">
            {content.brands.map((b) => (
              <Item key={b.slug} value={`brand ${b.title} ${b.kind} ${b.year}`} label={b.title} meta={`${b.kind} · ${b.year}`} onSelect={() => run(() => go(`#/brand/${b.slug}`))} />
            ))}
          </Command.Group>
          {websites.length > 0 && (
            <Command.Group heading="Websites">
              {websites.map((w) => (
                <Item key={w.slug} value={`website ${w.title} ${w.tags.join(' ')}`} label={w.title} meta={String(w.year)} onSelect={() => run(() => toSection('websites'))} />
              ))}
              {websites.filter((w) => w.versions.some((x) => x.live)).map((w) => (
                <Item key={`${w.slug}-live`} value={`website ${w.title} live running site`} label={`${w.title}, live`} meta="Runs in the page"
                  onSelect={() => run(() => { toSection('websites'); window.dispatchEvent(new CustomEvent(LIVE_EVENT, { detail: w.slug })) })} />
              ))}
            </Command.Group>
          )}
          <Command.Group heading="Posters">
            {content.posters.map((p, i) => (
              <Item key={i} value={`poster ${p.title} ${p.year} ${i}`} label={p.title} meta={p.year} onSelect={() => run(() => lightbox(posterShots, i))} />
            ))}
          </Command.Group>
          <Command.Group heading="Graphic design">
            {content.graphics.map((g, i) => (
              <Item key={i} value={`graphic ${g.title} ${g.client} ${g.year} ${i}`} label={g.title} meta={[g.client, g.year].filter(Boolean).join(' · ')} onSelect={() => run(() => lightbox(graphicShots, i))} />
            ))}
          </Command.Group>
          <Command.Group heading="Elsewhere">
            <Item value="theme switch light dark" label={dark ? 'Switch to the light theme' : 'Switch to the dark theme'} onSelect={() => run(flipTheme)} />
            {content.site.handles.map((h) => (
              <Item key={h.label} value={`instagram ${h.label}`} label={h.label} meta="Instagram ↗" onSelect={() => run(() => window.open(h.url, '_blank', 'noopener'))} />
            ))}
            {content.site.source && (
              <Item value="source code github repository" label="Source code" meta="GitHub ↗" onSelect={() => run(() => window.open(content.site.source, '_blank', 'noopener'))} />
            )}
          </Command.Group>
        </Command.List>
        <div className="cmdk-foot" aria-hidden>
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </Command.Dialog>
    </Ctx.Provider>
  )
}

/** Every typed word has to appear in the item (no loose letter-by-letter matches). */
function matchWords(value: string, search: string) {
  const v = value.toLowerCase()
  return search.toLowerCase().split(/\s+/).filter(Boolean).every((w) => v.includes(w)) ? 1 : 0
}

function Item({ value, label, meta, onSelect }: { value: string; label: string; meta?: string | number; onSelect: () => void }) {
  return (
    <Command.Item value={value} onSelect={onSelect}>
      <span className="truncate">{label}</span>
      {meta != null && <span className="shrink-0 text-[12.5px] tabular-nums text-dim">{meta}</span>}
    </Command.Item>
  )
}
