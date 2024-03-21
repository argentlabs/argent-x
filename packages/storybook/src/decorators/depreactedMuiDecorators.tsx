import { ThemeProvider, muiTheme } from "@argent-x/extension/src/ui/theme"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { Preview } from "@storybook/react"

export const decorators: Preview["decorators"] = [
  (Story) => {
    return (
      <MuiThemeProvider theme={muiTheme}>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </MuiThemeProvider>
    )
  },
]
