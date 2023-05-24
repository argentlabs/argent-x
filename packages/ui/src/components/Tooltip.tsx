import { defineStyleConfig } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

import { typographyStyles } from "./Typography"

export const tooltipTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      borderRadius: "base",
      border: "1px solid",
      borderColor: "border",
      py: "1",
      px: "2",
      ...typographyStyles.L1,
      color: mode("black", "text")(props),
      background: mode("white", "black")(props),
    }
  },
  variants: {
    tertiary: () => {
      return {
        borderRadius: "lg",
        borderColor: "neutrals.700",
        color: "white",
        background: "neutrals.700",
        lineHeight: "21px",
        fontSize: "base",
        fontWeight: "400",
        px: "4",
        py: "4",
      }
    },
  },
})
