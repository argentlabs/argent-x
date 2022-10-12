import { colord, extend } from "colord"
import mixPlugin from "colord/plugins/mix"
import { css } from "styled-components"

import { pxToRem } from "./utilities/pxToRem"

extend([mixPlugin])

const white = "#ffffff"
const black = "#000000"

export const colors = {
  white,
  white50: colord(white).alpha(0.5).toRgbString(),
  white30: colord(white).alpha(0.3).toRgbString(),

  black,
  black50: colord(black).alpha(0.5).toRgbString(),
  black30: colord(black).alpha(0.3).toRgbString(),

  primary: "#f36a3d",
  primaryLight: "#fcf1ed",
  primaryDark: "#803820",

  secondary: "#08a681",
  secondaryLight: "#edfcf9",
  secondaryDark: "#068063",

  accent: "#197aa6",
  accentLight: "#edf8fc",
  accentDark: "#135E80",

  warning: "#f4bc54",
  warningLight: "#fcf1ed",
  warningDark: "#803820",

  error: "#cc3247",
  errorLight: "#fcf1ed",
  errorDark: "#803820",

  success: "#51a55f",
  successLight: "#fcf1ed",
  successDark: "#803820",

  neutrals100: "#b7b7b9",
  neutrals200: "#9f9fa1",
  neutrals300: "#88888a",
  neutrals400: "#707072",
  neutrals500: "#58585b",
  neutrals600: "#404043",
  neutrals700: "#28282c",
  neutrals800: "#1d1f22",
  neutrals900: "#101014",

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

export const breakpoints = {
  sm: pxToRem(600),
  md: pxToRem(900),
  lg: pxToRem(1200),
  xl: pxToRem(1536),
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
  [width in keyof typeof breakpoints]: typeof css
} = Object.keys(breakpoints).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(breakpoints as any)[size]}) {
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
  [width in keyof typeof breakpoints]: typeof css
} = Object.keys(breakpoints).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (min-width: ${(breakpoints as any)[size]}) {
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

type Colors = typeof colors
type Components = typeof components

export interface CustomTheme extends Colors, Components {
  // css snippets
  flexColumnNoWrap: typeof flexColumnNoWrap
  flexRowNoWrap: typeof flexRowNoWrap

  // media queries
  mediaMaxWidth: typeof mediaMaxWidthTemplates
  mediaMinWidth: typeof mediaMinWidthTemplates

  margin: { extensionInTab: string }
}

export const theme: CustomTheme = {
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
