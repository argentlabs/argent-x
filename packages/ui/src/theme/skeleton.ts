import {
  cssVar,
  defineStyle,
  defineStyleConfig,
} from "@chakra-ui/styled-system"

const $startColor = cssVar("skeleton-start-color")
const $endColor = cssVar("skeleton-end-color")

const baseStyle = defineStyle({
  [$startColor.variable]: "rgba(0,0,0,0.1)",
  [$endColor.variable]: "rgba(0,0,0,0.2)",
  _dark: {
    [$startColor.variable]: "rgba(255,255,255,0.1)",
    [$endColor.variable]: "rgba(255,255,255,0.2)",
  },
  background: $startColor.reference,
  borderColor: $endColor.reference,
  opacity: 0.7,
  borderRadius: "sm",
})

export const skeletonTheme = defineStyleConfig({
  baseStyle,
})
