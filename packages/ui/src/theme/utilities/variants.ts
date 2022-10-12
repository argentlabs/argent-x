import { css } from "styled-components"

import { variantPropsMatchesComponentProps } from "./matches"

export type Props = Record<string, any>

export interface Variant<T extends Props> {
  props: T | T[]
  style: ReturnType<typeof css>
}

export function withVariants<T extends Props>(variants: Variant<T>[]) {
  return (props: Props) => {
    const matchingStyles = []
    for (const variant of variants) {
      if (variantPropsMatchesComponentProps(variant.props, props)) {
        matchingStyles.push(variant.style)
      }
    }
    return matchingStyles
  }
}
