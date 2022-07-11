import { FlattenSimpleInterpolation } from "styled-components"

export type Color = string
export interface Colors {
  // base
  white: Color
  black: Color

  bg1: Color
  bg2: Color
  bg3: Color
  bg4: Color
  bg5: Color

  text1: Color
  text2: Color
  text3: Color
  text4: Color

  red1: Color
  red2: Color
  red3: Color
  red4: Color

  blue1: Color
  blue2: Color

  yellow1: Color
}

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
