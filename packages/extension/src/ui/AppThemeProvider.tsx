import { theme as baseTheme } from "@argent/x-ui/theme"
import {
  ChakraProvider,
  type ChakraProviderProps,
  extendTheme,
} from "@chakra-ui/react"

export const theme = extendTheme(baseTheme, {
  styles: {
    global: {
      "html, body": {
        ".chakra-toast__inner": {
          maxWidth:
            "initial" /** reset Toast width restriction so Notification can set its own width  */,
        },
      },
    },
  },
})

export const AppThemeProvider = ({
  children,
  ...rest
}: ChakraProviderProps) => (
  <ChakraProvider theme={theme} {...rest}>
    {children}
  </ChakraProvider>
)
