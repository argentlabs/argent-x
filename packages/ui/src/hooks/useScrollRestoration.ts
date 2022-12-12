import { useLayoutEffect } from "react"
import { NavigationType, useNavigationType } from "react-router-dom"

import { ScrollProps, useScroll } from "./useScroll"

export interface IScrollRestorationStorage {
  get: (key: string) => ScrollProps | undefined
  set: (key: string, value: ScrollProps) => void
}

/** Default store scroll position in volatile memory */

const memoryStorage: IScrollRestorationStorage = new Map<string, ScrollProps>()

/**
 * Hook providing same functionality as {@link useScroll} but which also restores scroll position
 *
 * @param storageKey Unique id for persisting scroll position - if provided, scroll position will be restored when navigating 'back' to this component
 * @param storage Storage to use, defaults to volatile memory
 * @returns See {@link useScroll}
 */

export const useScrollRestoration = (
  storageKey: string,
  storage: IScrollRestorationStorage | undefined = memoryStorage,
): ReturnType<typeof useScroll> => {
  const useScrollProps = useScroll()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === NavigationType.Pop) {
      const value = storage.get(storageKey)
      if (value && useScrollProps.useScrollRef.current) {
        const { scrollTop, scrollLeft } = value
        useScrollProps.useScrollRef.current.scroll(scrollLeft, scrollTop)
      }
    }
    return () => {
      if (useScrollProps.useScrollRef.current) {
        const { scrollTop, scrollLeft } = useScrollProps.useScrollRef.current
        storage.set(storageKey, { scrollTop, scrollLeft })
      }
    }
  }, [navigationType, storage, storageKey, useScrollProps.useScrollRef])

  return useScrollProps
}
