import { DefaultTheme } from "styled-components"

import {
  ColorKey,
  FontSizeKey,
  FontWeightKey,
  LetterSpacingKey,
  SpacingKey,
} from "../theme"

type ThemeProp = {
  theme: DefaultTheme
}

type ThemeKey =
  | FontSizeKey
  | SpacingKey
  | FontWeightKey
  | LetterSpacingKey
  | ColorKey

/** helper which constructs the equivalent of `font-size: ${({ theme }) => theme.fontSizes["5xl"]};` */
const themeFn =
  (
    /** which css style prop to use e.g. 'font-size' */
    cssProp: string,
    /** which key to use to get the value from the map e.g. '5xl'  */
    key: ThemeKey | ThemeKey[],
    /** which property record from the theme contains the value */
    themeKey:
      | "spacings"
      | "fontSizes"
      | "fontWeights"
      | "letterSpacing"
      | "colors" = "spacings",
  ) =>
  ({ theme }: ThemeProp) => {
    const themeRecord: Record<string, string> = theme[themeKey]
    /** if passed an array, create with breakpoints */
    if (Array.isArray(key)) {
      return key.map((k, index) => {
        const outputValue = themeRecord[k] ?? k
        /** first value is 'mobile first' and needs no breakpoint */
        if (index === 0) {
          return `${cssProp}: ${outputValue};`
        }
        const breakpoint = Object.values(theme.customBreakpoints)[index]
        return `
          @media (min-width: ${breakpoint}) {
            ${cssProp}: ${outputValue};
          }
        `
      })
    }
    const outputValue = themeRecord[key] ?? key
    return `${cssProp}: ${outputValue};`
  }

type FontSize = FontSizeKey | FontSizeKey[]
type FontWeight = FontWeightKey | FontWeightKey[]
type Spacing = SpacingKey | SpacingKey[]

/**
 * Each of the below functions returns the derived style for the current theme
 *
 * @example
 * // Creates a Box component with padding 5, fontSize '5xl' and forground colour 'primary' from current theme
 * const Box = styled.div`
 *   ${p(5)}
 *   ${fontSize('5xl')}
 *   ${fg('primary')}
 * `;
 *
 * // Each function is the equivalent of e.g. ${fontSize('5xl')}
 * styled.div`
 *   font-size: ${({ theme }) => theme.fontSizes["5xl"]};
 * `
 *
 * @returns a style string for the current theme
 */
export const fontSize = (key: FontSize) =>
  themeFn("font-size", key, "fontSizes")

export const fontWeight = (key: FontWeight) =>
  themeFn("font-weight", key, "fontWeights")

export const lineHeight = (key: Spacing) => themeFn("line-height", key)
export const minHeight = (key: Spacing) => themeFn("min-height", key)

export const padding = (key: Spacing) => themeFn("padding", key)
export const p = padding
export const px = (key: Spacing) => [
  themeFn("padding-left", key),
  themeFn("padding-right", key),
]
export const py = (key: Spacing) => [
  themeFn("padding-top", key),
  themeFn("padding-bottom", key),
]
export const pl = (key: Spacing) => themeFn("padding-left", key)
export const pt = (key: Spacing) => themeFn("padding-top", key)
export const pr = (key: Spacing) => themeFn("padding-right", key)
export const pb = (key: Spacing) => themeFn("padding-bottom", key)

export const margin = (key: Spacing) => themeFn("margin", key)
export const m = margin
export const mx = (key: Spacing) => [
  themeFn("margin-left", key),
  themeFn("margin-right", key),
]
export const my = (key: Spacing) => [
  themeFn("margin-top", key),
  themeFn("margin-bottom", key),
]
export const ml = (key: Spacing) => themeFn("margin-left", key)
export const mt = (key: Spacing) => themeFn("margin-top", key)
export const mr = (key: Spacing) => themeFn("margin-right", key)
export const mb = (key: Spacing) => themeFn("margin-bottom", key)

export const gap = (key: Spacing) => themeFn("gap", key)

export const letterSpacing = (key: LetterSpacingKey) =>
  themeFn("letter-spacing", key, "letterSpacing")

export const fg = (key: ColorKey) => themeFn("color", key, "colors")
export const bg = (key: ColorKey) => themeFn("background-color", key, "colors")
