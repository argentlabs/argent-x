import { useState, useEffect } from "react"

const EXTENSION_INNER_WIDTH_WITH_PADDING = 400
export const useIsFullScreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const checkFullscreen = () => {
      if (window.innerWidth > EXTENSION_INNER_WIDTH_WITH_PADDING) {
        setIsFullscreen(true)
      } else {
        setIsFullscreen(false)
      }
    }

    checkFullscreen()
    window.addEventListener("resize", checkFullscreen)

    return () => {
      window.removeEventListener("resize", checkFullscreen)
    }
  }, [])
  return isFullscreen
}
