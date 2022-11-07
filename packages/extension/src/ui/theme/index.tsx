import { createTheme } from "@mui/material/styles"
import { colord, extend } from "colord"
import mixPlugin from "colord/plugins/mix"
import React, { FC } from "react"
import {
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
  css,
} from "styled-components"

extend([mixPlugin])

const white = "#FFFFFF"
const black = "#000000"

export const colors = {
  white,
  black,

  primary: "#F36A3D",

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

  green1: "#02bba8",
  green2: "#02a697",

  neutrals100: "#B7B7B9",
  neutrals200: "#9F9FA1",
  neutrals300: "#88888A",
  neutrals400: "#707072",
  neutrals500: "#58585B",
  neutrals600: "#404043",
  neutrals700: "#28282C",
  neutrals800: "#1D1F22",
  neutrals900: "#101014",
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
    primary: {
      bg: {
        base: colors.primary,
        hover: colord(colors.primary).saturate(1).lighten(0.075).toRgbString(),
        disabled: colord(colors.primary).alpha(0.5).toRgbString(),
      },
    },
    warn: {
      bg: {
        base: colors.yellow1,
        hover: colord(colors.yellow1).saturate(1).lighten(0.075).toRgbString(),
        disabled: colord(colors.yellow1).alpha(0.5).toRgbString(),
      },
    },
    "warn-high": {
      bg: {
        base: colors.red4,
        hover: colord(colors.red4).saturate(1).lighten(0.075).toRgbString(),
        disabled: colord(colors.red4).alpha(0.5).toRgbString(),
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
    transparent: {
      bg: {
        base: "transparent",
        hover: "rgba(255, 255, 255, 0.075)",
        disabled: "transaprent",
      },
    },
    inverted: {
      fg: {
        base: colors.bg2,
        disabled: colord(colors.bg2).alpha(0.5).toRgbString(),
      },
      bg: {
        base: colors.white,
        hover: colord(colors.white).darken(0.075).toRgbString(),
        disabled: colord(colors.white).alpha(0.5).toRgbString(),
      },
    },
    neutrals800: {
      bg: {
        base: colors.neutrals800,
        hover: colord(colors.neutrals800)
          .mix(colors.neutrals700, 0.75)
          .toRgbString(),
        disabled: colors.neutrals900,
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

export const scrollbarStyle = css`
  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`

export const theme: DefaultTheme = {
  ...colors,
  ...components,
  flexColumnNoWrap,
  flexRowNoWrap,
  // media queries
  mediaMaxWidth: mediaMaxWidthTemplates,
  mediaMinWidth: mediaMinWidthTemplates,
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
