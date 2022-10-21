import { theme as baseTheme, extendTheme } from "@chakra-ui/react"

import { buttonTheme } from "../components/Button"
import { inputTheme } from "../components/Input"
import { breakpoints } from "./breakpoints"
import { colors } from "./colors"
import { shadows } from "./shadows"
import { spacing } from "./spacing"
import { typography } from "./typography"

const extendedTheme = extendTheme({
  styles: {
    global: {
      "html, body": {
        color: "white",
        bg: "neutrals.900",
      },
    },
  },
  breakpoints,
  ...typography,
  shadows,
  space: spacing,
  components: {
    Button: buttonTheme,
    Input: inputTheme,
  },
})

export type UITheme = Omit<typeof baseTheme, "colors"> & {
  colors: typeof colors
}

export const theme = {
  ...extendedTheme,
  colors /** omits default chakra colours */,
} as UITheme

console.log(JSON.stringify(theme, null, 2))
