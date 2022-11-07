import {
  ChakraProvider,
  ChakraProviderProps,
  ThemeConfig,
  theme as baseTheme,
  extendTheme,
} from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

import { textareaTheme } from "../components"
import { buttonTheme } from "../components/Button"
import { inputTheme } from "../components/Input"
import { breakpoints } from "./breakpoints"
import { colors } from "./colors"
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
  styles: {
    global: (props: any) => ({
      "html, body": {
        color: mode("neutrals.700", "white")(props),
        bg: mode("white", "neutrals.900")(props),
      },
    }),
  },
  breakpoints,
  ...typography,
  shadows,
  space: spacing,
  components: {
    Button: buttonTheme,
    Input: inputTheme,
    Textarea: textareaTheme,
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
