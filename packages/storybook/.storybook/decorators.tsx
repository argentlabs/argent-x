import { GlobalStyle, theme } from "@argent-x/extension/src/ui/theme"
import { ThemeProvider } from "@mui/material"
import React from "react"

export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <GlobalStyle extensionIsInTab={false} />
      <Story />
    </ThemeProvider>
  ),
]
