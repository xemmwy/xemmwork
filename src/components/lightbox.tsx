import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Shot } from '@/lib/content'

type Open = (shots: Shot[], index: number) => void
const Ctx = createContext<Open>(() => {})
export const useLightbox = () => useContext(Ctx)

/** Full-screen viewer for any list of pictures: arrows, keys and swipes move through it. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ shots: Shot[]; i: number } | null>(null)
  const open = useCallback<Open>((shots, i) => setState({ shots, i }), [])
  const go = useCallback((d: number) => setState((s) => (s ? { ...s, i: (s.i + d + s.shots.length) % s.shots.length } : s)), [])

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, go])

  // going to another page closes it
  useEffect(() => {
    const close = () => setState(null)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  // warm up the neighbours so arrows feel instant
  useEffect(() => {
    if (!state) return
    for (const d of [1, -1]) {
      const s = state.shots[(state.i + d + state.shots.length) % state.shots.length]
      if (s) new Image().src = s.img.src
    }
  }, [state])

  const shot = state?.shots[state.i]
  const many = (state?.shots.length ?? 0) > 1
  const touch = useRef<number | null>(null)

  return (
    <Ctx.Provider value={open}>
      {children}
      <DialogPrimitive.Root open={!!state} onOpenChange={(o) => { if (!o) setState(null) }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop data-slot="dialog-overlay" className="fixed inset-0 z-50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-50 flex flex-col bg-[rgba(11,11,11,.97)] text-cream outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
            onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              if (touch.current == null) return
              const dx = e.changedTouches[0].clientX - touch.current
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
              touch.current = null
            }}
          >
            {shot && (
              <>
                <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <DialogPrimitive.Title className="truncate text-[15px] font-semibold tracking-[-.02em] text-cream">{shot.title}</DialogPrimitive.Title>
                    {shot.sub && <DialogPrimitive.Description className="truncate text-[13px] text-[#9b948a]">{shot.sub}</DialogPrimitive.Description>}
                  </div>
                  {many && <span className="text-[13px] tabular-nums text-[#9b948a]">{state!.i + 1} / {state!.shots.length}</span>}
                  <DialogPrimitive.Close render={<Button variant="ghost" size="icon" className="text-cream hover:bg-white/10 hover:text-cream" aria-label="Close" />}>
                    <X />
                  </DialogPrimitive.Close>
                </div>
                <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-20 sm:pb-8">
                  <Stage key={shot.img.src} shot={shot} />
                  {many && (
                    <>
                      <Button variant="ghost" size="icon-lg" aria-label="Previous" onClick={() => go(-1)}
                        className="absolute top-1/2 left-3 hidden -translate-y-1/2 bg-white/5 text-cream hover:bg-white/12 hover:text-cream sm:inline-flex">
                        <ArrowLeft />
                      </Button>
                      <Button variant="ghost" size="icon-lg" aria-label="Next" onClick={() => go(1)}
                        className="absolute top-1/2 right-3 hidden -translate-y-1/2 bg-white/5 text-cream hover:bg-white/12 hover:text-cream sm:inline-flex">
                        <ArrowRight />
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </Ctx.Provider>
  )
}

/** The picture itself: the small version straight away, the full one on top once it arrives. */
function Stage({ shot }: { shot: Shot }) {
  const [full, setFull] = useState(false)
  return (
    <div className="relative h-full w-full rise-in">
      <img src={shot.img.thumb} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ opacity: full ? 0 : 1 }} />
      <img src={shot.img.src} alt={shot.title} draggable={false} onLoad={() => setFull(true)}
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300" style={{ opacity: full ? 1 : 0 }} />
    </div>
  )
}
