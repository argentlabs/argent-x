import { chromeStorageMock } from "@argent-x/extension/src/shared/storage/__test__/chrome-storage.mock"
import {
  FixedGlobalStyle,
  ThemeProvider,
  ThemedGlobalStyle,
  muiTheme,
} from "@argent-x/extension/src/ui/theme"
import { theme } from "@argent/ui"
import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { Story } from "@storybook/react"
import React from "react"
import { createGlobalStyle } from "styled-components"

/** polyfill browser extension storage  */
global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    id: "test",
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  storage: chromeStorageMock,
}

/** remove explicit width and height constraints which otherwise impact Docs */
const StorybookGlobalStyle = createGlobalStyle`
  html, body {
    min-width: unset;
    min-height: unset;
  }
`

export const decorators = [
  (Story: Story) => (
    <ChakraProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <FixedGlobalStyle extensionIsInTab />
        <StorybookGlobalStyle />
        <ThemeProvider>
          <ThemedGlobalStyle />
          <Story />
        </ThemeProvider>
      </MuiThemeProvider>
    </ChakraProvider>
  ),
]
