import { ThemeProvider, muiTheme } from "@argent-x/extension/src/ui/theme"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { Decorator } from "@storybook/react"

export const depreactedMuiDecorator: Decorator = (Story) => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </MuiThemeProvider>
  )
}
