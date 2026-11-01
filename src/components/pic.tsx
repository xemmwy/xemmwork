import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { Img } from '@/lib/content'

/** A picture that holds its shape (and the work's own colour) until it has loaded, then fades in. */
export function Pic({
  img, alt = '', ratio, contain, eager, full, className, style,
}: {
  img: Img; alt?: string; ratio?: number; contain?: boolean; eager?: boolean; full?: boolean
  className?: string; style?: CSSProperties
}) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true)
  }, [])
  return (
    <div className={cn('pic', className)} style={{ '--pc': img.color, aspectRatio: ratio ?? img.w / img.h, ...style } as CSSProperties}>
      <img
        ref={ref}
        src={full ? img.src : img.thumb}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={contain ? 'contain' : undefined}
        data-loaded={loaded || undefined}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
