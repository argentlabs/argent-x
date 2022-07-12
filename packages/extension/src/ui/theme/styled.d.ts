import { FlattenSimpleInterpolation } from "styled-components"

import { colors } from "./index"

export type Color = string
export type Colors = typeof colors

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
  export interface DefaultTheme extends Colors {
    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation

    // media queries
    mediaMaxWidth: StyledBreakpoints
    mediaMinWidth: StyledBreakpoints

    margin: { extensionInTab: string }
  }
}
