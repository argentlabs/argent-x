import { makeColorVariants } from "./utilities/makeColorVariants"

export const colors = {
  transparent: "transparent",
  current: "currentColor",
  black: "#000000",
  white: "#ffffff",
  gray: makeColorVariants(
    "#707072" /** neutrals.400 */,
    true,
  ) /** inverse since we are on a black background, but in chakra 'light' mode */,
  primary: makeColorVariants("#f36a3d"),
  secondary: makeColorVariants("#08a681"),
  accent: makeColorVariants("#197aa6"),
  warn: makeColorVariants("#ffbf3d"),
  "warn-high": makeColorVariants("#f36a3d"),
  info: makeColorVariants("#0078a4"),
  danger: makeColorVariants("#c12026"),
  error: makeColorVariants("#cc3247"),
  neutrals800: makeColorVariants("#1d1f22"),
  skyBlue: makeColorVariants("#29c5ff"),
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
