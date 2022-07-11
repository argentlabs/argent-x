import { createTheme } from "@mui/material/styles"
import React, { FC } from "react"
import {
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
} from "styled-components"
import { normalize } from "styled-normalize"

import { Colors } from "./styled"

const white = "#FFFFFF"
const black = "#000000"

export const colors = (): Colors => {
  return {
    white,
    black,

    bg1: "#161616",
    bg2: "#333332",
    bg3: "#474747",
    bg4: "#5f5e5c",
    bg5: "#fafafa",

    text1: white,
    text2: "#8f8e8c",
    text3: "#5c5b59",
    text4: "#c2c0be",

    red1: "#c12026",
    red2: "#ff675c",
    red3: "#ff875b",

    blue1: "#29c5ff",
    blue2: "#94e2ff",

    yellow1: "#ffbf3d",
  }
}

const MEDIA_WIDTHS = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

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

export const theme = (): DefaultTheme => {
  return {
    ...colors(),

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,

    // media queries
    mediaMaxWidth: mediaMaxWidthTemplates,
    mediaMinWidth: mediaMinWidthTemplates,

    margin: {
      extensionInTab: "10%",
    },
  }
}

export const ThemeProvider: FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const themeObj = theme()

  return (
    <StyledComponentsThemeProvider theme={themeObj}>
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
})
