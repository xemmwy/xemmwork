import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

// Hash routes, so the site also works opened straight from disk:
//   #/                home        #/posters   home, scrolled to a section        #/brand/fleur   a case study
export type Route = { page: 'home'; section: string } | { page: 'brand'; slug: string }

export const SECTIONS = ['brands', 'websites', 'logos', 'posters', 'graphics', 'about'] as const

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/')
  if (parts[0] === 'brand' && parts[1]) return { page: 'brand', slug: decodeURIComponent(parts[1]) }
  return { page: 'home', section: parts[0] || '' }
}

const samePage = (a: Route, b: Route) =>
  a.page === b.page && (a.page === 'home' || (b.page === 'brand' && a.slug === b.slug))

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }

export function useRoute() {
  const [route, setRoute] = useState(() => parse(location.hash))
  const current = useRef(route)
  useEffect(() => {
    const on = () => {
      const next = parse(location.hash)
      const prev = current.current
      current.current = next
      const doc = document as ViewTransitionDoc
      // moving between pages dithers the new one in over the old (sections on the same page just scroll)
      if (!samePage(prev, next) && doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('route-dither')
        doc.startViewTransition(() => {
          flushSync(() => setRoute(next))
          // land in the right place before the new page is captured, so it dithers in where it will stay
          const target = next.page === 'home' && next.section ? document.getElementById(next.section) : null
          if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' })
          else window.scrollTo({ top: 0, behavior: 'instant' })
        }).finished.finally(() => document.documentElement.classList.remove('route-dither'))
      } else {
        setRoute(next)
      }
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (hash: string) => { location.hash = hash }

/** Scroll to a home section, even when the hash already points at it. */
export function toSection(id: string) {
  if (!location.hash.startsWith('#/brand') && location.hash === `#/${id}`) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    location.hash = `#/${id}`
  }
}
