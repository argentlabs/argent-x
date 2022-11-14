import { useColorMode } from "@chakra-ui/react"
import { FC, useEffect } from "react"

/**
 * In a production build this ensures that global styles are initially "dark"
 *
 * Must be a child of {@link ThemeProvider}
 *
 * @example
 * ```ts
 * import { ThemeProvider, SetDarkMode } from "@argent/ui"
 *
 * <ThemeProvider>
 *   <SetDarkMode />
 *   <App />
 * </ThemeProvider>
 * ```
 */

export const SetDarkMode: FC = () => {
  const { colorMode, setColorMode } = useColorMode()
  useEffect(() => {
    /** Ensure colour mode is dark - may previously have defaulted to 'white' */
    if (colorMode !== "dark") {
      setColorMode("dark")
    }
  }, [colorMode, setColorMode])
  return null
}
