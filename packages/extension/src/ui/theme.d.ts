import {
  Theme as MUITheme,
  ThemeOptions as MUIThemeOptions,
} from "@mui/material/styles"

/**
 * Adds additional variables to the theme
 *
 * @see https://mui.com/material-ui/customization/theming/#custom-variables
 */

declare module "@mui/material/styles" {
  interface Theme extends MUITheme {
    margin: {
      extensionInTab: string
    }
  }
  // allow configuration using `createTheme`
  interface ThemeOptions extends MUIThemeOptions {
    margin?: {
      extensionInTab?: string
    }
  }
}
