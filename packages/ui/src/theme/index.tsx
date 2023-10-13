import {
  ChakraProvider,
  ChakraProviderProps,
  ThemeConfig,
  theme as baseTheme,
  extendTheme,
} from "@chakra-ui/react"

import {
  accordionTheme,
  alertTheme,
  menuTheme,
  textareaTheme,
  tooltipTheme,
} from "../components"
import { buttonTheme } from "../components/Button"
import { inputTheme } from "../components/Input"
import { listTheme } from "../components/List"
import { pinInputTheme } from "../components/PinInput"
import { progressTheme } from "../components/Progress"
import { switchTheme } from "../components/Switch"
import { tabsTheme } from "../components/Tabs"
import { breakpoints } from "./breakpoints"
import { colors } from "./colors"
import { semanticTokens } from "./semanticTokens"
import { shadows } from "./shadows"
import { sizes } from "./sizes"
import { skeletonTheme } from "./skeleton"
import { spacing } from "./spacing"
import { typography } from "./typography"

export { scrollbarStyle } from "./scrollbarStyle"
export { SetDarkMode } from "./SetDarkMode"

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
  sizes,
  shadows,
  space: spacing,
  components: {
    Accordion: accordionTheme,
    Alert: alertTheme,
    Button: buttonTheme,
    Input: inputTheme,
    List: listTheme,
    Menu: menuTheme,
    PinInput: pinInputTheme,
    Progress: progressTheme,
    Skeleton: skeletonTheme,
    Switch: switchTheme,
    Tabs: tabsTheme,
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

/** Theme with initial color mode "light" also see {@link SetDarkMode} */
export const ThemeProvider = ({ children }: ChakraProviderProps) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
)
