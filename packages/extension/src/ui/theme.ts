import { createTheme } from "@mui/material/styles"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"

/**
 * Adds additional variables to the theme
 *
 * @see https://mui.com/material-ui/customization/theming/#custom-variables
 */

declare module "@mui/material/styles" {
  interface Theme {
    margin: {
      extensionInTab: string
    }
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    margin?: {
      extensionInTab?: string
    }
  }
}

export const theme = createTheme({
  palette: {
    mode: "dark",
  },
  margin: {
    extensionInTab: "10%",
  },
})

export interface GlobalStyleProps {
  extensionIsInTab: boolean
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;
    color: white;
  }

  html, body {
    min-width: 360px;
    min-height: 600px;

    width: ${({ extensionIsInTab }) => (extensionIsInTab ? "unset" : "360px")};
    height: ${({ extensionIsInTab }) => (extensionIsInTab ? "unset" : "600px")};
    
    overscroll-behavior: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar { /* Chrome, Safari, Opera */
      display: none;
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`
