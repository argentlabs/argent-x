import {
  ChakraProvider,
  ChakraProviderProps,
  ThemeConfig,
  theme as baseTheme,
  extendTheme,
} from "@chakra-ui/react"

import {
  alertTheme,
  menuTheme,
  textareaTheme,
  tooltipTheme,
} from "../components"
import { buttonTheme } from "../components/Button"
import { inputTheme } from "../components/Input"
import { breakpoints } from "./breakpoints"
import { colors } from "./colors"
import { semanticTokens } from "./semanticTokens"
import { shadows } from "./shadows"
import { spacing } from "./spacing"
import { typography } from "./typography"

export { scrollbarStyle } from "./scrollbarStyle"

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
}

const extendedTheme = extendTheme({
  config,
  semanticTokens,
  styles: {
    global: {
      "html, body": {
        color: "text",
        bg: "bg",
      },
    },
  },
  breakpoints,
  ...typography,
  shadows,
  space: spacing,
  components: {
    Alert: alertTheme,
    Button: buttonTheme,
    Input: inputTheme,
    Menu: menuTheme,
    Textarea: textareaTheme,
    Tooltip: tooltipTheme,
  },
})

export type UITheme = Omit<typeof baseTheme, "colors"> & {
  colors: typeof colors
}

export const theme = {
  ...extendedTheme,
  colors /** omits default chakra colours */,
} as UITheme

export const ThemeProvider = ({ children }: ChakraProviderProps) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
)
