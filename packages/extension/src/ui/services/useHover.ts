import { MutableRefObject, useEffect, useRef, useState } from "react"

// T - could be any type of HTML element like: HTMLDivElement, HTMLParagraphElement and etc.
// hook returns tuple(array) with type [any, boolean]
export function useHover<T>(): [MutableRefObject<T | null>, boolean] {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T | null>(null)
  const handleMouseOver = (): void => setValue(true)
  const handleMouseOut = (): void => setValue(false)
  useEffect(
    () => {
      const node: any = ref.current
      if (node) {
        node.addEventListener("mouseover", handleMouseOver)
        node.addEventListener("mouseout", handleMouseOut)
        return () => {
          node.removeEventListener("mouseover", handleMouseOver)
          node.removeEventListener("mouseout", handleMouseOut)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref.current], // Recall only if ref changes
  )
  return [ref, value]
}
