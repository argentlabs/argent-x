import { Box } from "@chakra-ui/react"
import { ComponentProps, FC, useEffect, useRef } from "react"

interface LoadMoreProps extends ComponentProps<typeof Box> {
  onLoadMore: () => void
  oneShot?: boolean
}

const options: IntersectionObserverInit = {
  root: null,
  rootMargin: "0px",
  threshold: 1.0,
}

/** invokes onLoadMore callback when visible in the viewport */

export const LoadMoreTrigger: FC<LoadMoreProps> = ({
  onLoadMore,
  oneShot = true,
  ...rest
}) => {
  const ref = useRef(null)
  const intersectionObserver = useRef<IntersectionObserver | null>(null)
  const didInvokeOnLoadMore = useRef(false)

  useEffect(() => {
    const callback = (
      entries: IntersectionObserverEntry[],
      _observer: IntersectionObserver,
    ) => {
      const currentRefEntry = entries.find(
        ({ target }) => target === ref.current,
      )
      if (currentRefEntry) {
        if (currentRefEntry.isIntersecting) {
          if (oneShot && didInvokeOnLoadMore.current) {
            // don't fire
          } else {
            onLoadMore && onLoadMore()
            didInvokeOnLoadMore.current = true
          }
        }
      }
    }

    intersectionObserver.current = new IntersectionObserver(callback, options)
    if (ref.current) {
      intersectionObserver.current.observe(ref.current)
    }
    return () => {
      intersectionObserver.current?.disconnect()
      intersectionObserver.current = null
    }
  }, [onLoadMore, oneShot])

  return <Box ref={ref} {...rest} />
}
