import { createTheme } from "@mui/material/styles"
import { colord } from "colord"
import React, { FC } from "react"
import {
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
} from "styled-components"
import { normalize } from "styled-normalize"

const white = "#FFFFFF"
const black = "#000000"

export const colors = {
  white,
  black,

  bg1: "#161616",
  bg2: "#333332",
  bg3: "#474747",
  bg4: "#5f5e5c",
  bg5: "#fafafa",
  bg6: "#393939",

  text1: white,
  text2: "#8f8e8c",
  text3: "#5c5b59",
  text4: "#c2c0be",

  red1: "#c12026",
  red2: "#ff675c",
  red3: "#ff875b",
  red4: "#f36a3d",

  blue0: "#0078a4",
  blue1: "#29c5ff",
  blue2: "#94e2ff",

  yellow1: "#ffbf3d",
}

export const components = {
  button: {
    default: {
      fg: {
        base: colors.text1,
        disabled: colord(colors.text1).alpha(0.5).toRgbString(),
      },
      bg: {
        base: "rgba(255, 255, 255, 0.15)",
        hover: "rgba(255, 255, 255, 0.25)",
        disabled: "rgba(255, 255, 255, 0.15)",
      },
    },
    "warn-high": {
      bg: {
        base: colors.red4,
        hover: colord(colors.red4).saturate(1).lighten(0.075).toRgbString(),
        disabled: colord(colors.red4).alpha(0.5).toRgbString(),
      },
    },
    warn: {
      bg: {
        base: colors.yellow1,
        hover: colord(colors.yellow1).saturate(1).lighten(0.075).toRgbString(),
        disabled: colord(colors.yellow1).alpha(0.5).toRgbString(),
      },
    },
    danger: {
      bg: {
        base: colors.red1,
        hover: colord(colors.red1).lighten(0.075).toRgbString(),
        disabled: colord(colors.red1).alpha(0.5).toRgbString(),
      },
    },
    info: {
      bg: {
        base: colors.blue0,
        hover: colord(colors.blue0).lighten(0.075).toRgbString(),
        disabled: colord(colors.blue0).alpha(0.5).toRgbString(),
      },
    },
    radius: "500px",
    transition: "color 200ms ease-in-out, background-color 200ms ease-in-out",
  },
}

const MEDIA_WIDTHS = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

/**
 * Adds Media Query with max-width property
 *
 * Example: ${({ theme }) => theme.mediaMaxWidth.sm`
 *  background-color: red
 * `}
 * The above snippet resolves to
 *
 * @media (max-width: 600px) {
 *    background-color: red
 * }
 *
 */
const mediaMaxWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {}) as any

/**
 * Adds Media Query with min-width property
 *
 * Example: ${({ theme }) => theme.mediaMinWidth.lg`
 *  margin: 10px
 * `}
 * The above snippet resolves to
 *
 * @media (min-width: 1200px) {
 *    margin: 10px
 * }
 *
 */
const mediaMinWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (min-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {}) as any

/**
 * Simpler way to add flex Column with nowrap
 *
 * Example: const Button = styled.button`
 *  ${({ theme }) => theme.flexColumnNoWrap}
 *  background-color: red
 * `
 *
 * The above snippet resolves to
 * const Button = styled.button`
 *   display: flex;
 *   flex-flow: column nowrap;
 *   background-color: red
 * `
 */
const flexColumnNoWrap = css`
  display: flex;
  flex-flow: column nowrap;
`

/**
 * Simpler way to add flex row with nowrap
 *
 * Example: const Button = styled.button`
 *  ${({ theme }) => theme.flexColumnNoWrap};
 *  background-color: red;
 * `
 *
 * The above snippet resolves to
 * const Button = styled.button`
 *    display: flex;
 *    flex-flow: row nowrap;
 *   background-color: red;
 * `
 */

const flexRowNoWrap = css`
  display: flex;
  flex-flow: row nowrap;
`

export const theme: DefaultTheme = {
  ...colors,
  ...components,
  flexColumnNoWrap,
  flexRowNoWrap,
  // media queries
  mediaMaxWidth: mediaMaxWidthTemplates,
  mediaMinWidth: mediaMinWidthTemplates,
  margin: {
    extensionInTab: "10%",
  },
}

export const ThemeProvider: FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      {children}
    </StyledComponentsThemeProvider>
  )
}

export interface GlobalStyleProps {
  extensionIsInTab: boolean
}

export const FixedGlobalStyle = createGlobalStyle<GlobalStyleProps>`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
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

export const ThemedGlobalStyle = createGlobalStyle`
  body {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg1};
  }
`

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    allVariants: {
      /** unset default Roboto font */
      fontFamily: undefined,
    },
  },
})
