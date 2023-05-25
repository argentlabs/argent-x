import { spacing } from "./spacing"
import { pxToRem } from "./utilities/pxToRem"

export const typography = {
  letterSpacings: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  lineHeights: {
    ...spacing /** our system specifies these in multiples of 4 same as spacings */,
  },

  fontWeights: {
    light: "300",
    normal: "400",
    semibold: "500",
    bold: "600",
    extrabold: "700",
  },

  fonts: {
    heading: `'Barlow', sans-serif`,
    body: `'Barlow', sans-serif`,
    mono: `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`,
  },

  fontSizes: {
    "3xs": pxToRem(17),
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
    "6xl": pxToRem(72),
    "10xl": pxToRem(80),
    "28xl": pxToRem(112),
  },
}
