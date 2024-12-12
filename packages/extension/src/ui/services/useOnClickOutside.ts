import type { RefObject } from "react"
import { useEffect, useRef } from "react"

export function useOnClickOutside(
  node: RefObject<HTMLElement>,
  handler?: () => void,
) {
  const handlerRef = useRef<undefined | (() => void)>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (node.current?.contains(e.target as Node) ?? false) {
        return
      }

      if (handlerRef.current) {
        handlerRef.current()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [node])
}
