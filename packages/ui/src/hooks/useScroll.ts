import { useCallback, useRef, useState } from "react"

export interface ScrollProps {
  scrollTop: number
  scrollLeft: number
}

export interface UseScrollProps {
  onScroll?: (scroll: ScrollProps) => void
}

/**
 * Hook to monitor and return the scroll position of a div.
 *
 * @example
 * ```ts
 * // pass the scroll position of `ContentContainer` into `NavigationBar`
 *
 * const { scrollRef, scroll } = useScroll()
 *
 * <ContentContainer ref={scrollRef}>
 *   ...
 * </ContentContainer>
 * <NavigationBar scroll={scroll} />
 * ```
 */

export const useScroll = ({ onScroll: onScrollProp }: UseScrollProps = {}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [scroll, setScroll] = useState<ScrollProps>({
    scrollTop: 0,
    scrollLeft: 0,
  })

  const onScroll = useCallback(
    (e: Event) => {
      if (!e.currentTarget) {
        return
      }
      const { scrollTop, scrollLeft } = e.currentTarget as HTMLDivElement
      setScroll({ scrollTop, scrollLeft })
      onScrollProp && onScrollProp({ scrollTop, scrollLeft })
    },
    [onScrollProp],
  )

  const setRef = useCallback(
    (nextRef: HTMLDivElement | null) => {
      if (ref?.current) {
        ref.current.removeEventListener("scroll", onScroll)
      }
      ref.current = nextRef
      if (ref?.current) {
        const { scrollTop, scrollLeft } = ref.current
        setScroll({ scrollTop, scrollLeft })
        ref.current.addEventListener("scroll", onScroll, {
          passive: true,
        })
      }
    },
    [onScroll],
  )

  return {
    scrollRef: setRef,
    useScrollRef: ref,
    scroll,
  }
}
