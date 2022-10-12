import { extendTheme } from "@chakra-ui/react"

import { buttonTheme } from "../components/Button"
import { breakpoints, colors, theme } from "./theme"
import { makeColorVariants } from "./utilities/makeColorVariants"
import { pxToRem } from "./utilities/pxToRem"

/** TODO rename and replace above 'colors' once fully migrated to Chakra */
const chakraColors = {
  ...colors,
  gray: makeColorVariants(
    colors.neutrals400,
    true,
  ) /** inverse since we are on a black background, but in chakra 'light' mode */,
  primary: makeColorVariants(colors.primary),
  secondary: makeColorVariants(colors.secondary),
  accent: makeColorVariants(colors.accent),
  warn: makeColorVariants(colors.yellow1),
  "warn-high": makeColorVariants(colors.red4),
  info: makeColorVariants(colors.blue0),
  danger: makeColorVariants(colors.red1),
  neutrals800: makeColorVariants(colors.neutrals800),
  neutrals: {
    100: "#b7b7b9",
    200: "#9f9fa1",
    300: "#88888a",
    400: "#707072",
    500: "#58585b",
    600: "#404043",
    700: "#28282c",
    800: "#1d1f22",
    900: "#101014",
  },
}

const fontWeights = {
  light: "300",
  normal: "400",
  semibold: "500",
  bold: "600",
  extrabold: "700",
}

const fontSizes = {
  "2xs": pxToRem(12),
  xs: pxToRem(13),
  sm: pxToRem(14),
  base: pxToRem(16),
  lg: pxToRem(18),
  xl: pxToRem(20),
  "2xl": pxToRem(24),
  "3xl": pxToRem(28),
  "4xl": pxToRem(32),
  "5xl": pxToRem(40),
}

const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
}

const spacings = {
  0: pxToRem(0),
  1: pxToRem(4),
  2: pxToRem(8),
  3: pxToRem(12),
  "3.5": pxToRem(14),
  4: pxToRem(16),
  5: pxToRem(20),
  6: pxToRem(24),
  7: pxToRem(28),
  8: pxToRem(32),
  9: pxToRem(36),
  10: pxToRem(40),
  12: pxToRem(48),
  14: pxToRem(56),
  16: pxToRem(64),
  24: pxToRem(96),
}

export const chakraTheme = extendTheme({
  styles: {
    global: {
      "html, body": {
        color: "white",
      },
    },
  },
  ...theme,
  colors: chakraColors,
  spacings,
  fontSizes,
  fontWeights,
  letterSpacing,
  breakpoints,
  lineHeights: {
    ...spacings /** our system specifies these in multiples of 4 same as spacings */,
  },
  components: {
    Button: buttonTheme,
  },
})

/** @chakra/cli expects a default export - TODO: rename and remove this when migration is complete */
export default chakraTheme
