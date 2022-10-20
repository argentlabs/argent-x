import { extendTheme } from "@chakra-ui/react"

import { buttonTheme } from "../components/Button"
import { breakpoints } from "./breakpoints"
import { colors } from "./colors"
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
  space: spacing,
  components: {
    Button: buttonTheme,
  },
})

export const theme = {
  ...extendedTheme,
  colors /** omits default chakra colours */,
}
