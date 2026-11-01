import { useEffect, useState } from 'react'

// The theme lives on <html class="dark">; index.html applies the saved choice before first paint.
const EVENT = 'xemm:theme'

export const isDark = () => document.documentElement.classList.contains('dark')

/** Switch light/dark with one quick crossfade, and tell anyone listening. */
export function flipTheme() {
  const next = !isDark()
  const apply = () => {
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('xemmwork-theme', next ? 'dark' : 'light') } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished?: Promise<void> } }
  if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('theme-fade')
    doc.startViewTransition(apply).finished?.finally(() => document.documentElement.classList.remove('theme-fade'))
  } else apply()
}

export function useDark() {
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const on = (e: Event) => setDark(Boolean((e as CustomEvent<boolean>).detail))
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])
  return dark
}
