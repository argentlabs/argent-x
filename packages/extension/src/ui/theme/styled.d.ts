import { FlattenSimpleInterpolation } from "styled-components"

import { colors, components } from "./index"

export type Color = string
export type Colors = typeof colors
export type Components = typeof components

interface ThemeOptions {
  margin?: {
    extensionInTab?: string
  }
}

interface StyledBreakpoints {
  sm: ThemedCssFunction<DefaultTheme>
  md: ThemedCssFunction<DefaultTheme>
  lg: ThemedCssFunction<DefaultTheme>
  xl: ThemedCssFunction<DefaultTheme>
}

declare module "styled-components" {
  export interface DefaultTheme extends Colors, Components {
    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation

    // media queries
    mediaMaxWidth: StyledBreakpoints
    mediaMinWidth: StyledBreakpoints

    margin: { extensionInTab: string }
  }
}
