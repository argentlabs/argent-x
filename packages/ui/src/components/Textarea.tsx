import { Textarea, defineStyleConfig } from "@chakra-ui/react"
import { defineStyle } from "@chakra-ui/styled-system"
import { mode } from "@chakra-ui/theme-tools"

export { Textarea }

const baseStyle = defineStyle({
  transitionProperty: "common",
  transitionDuration: "normal",
})

const variantFilled = defineStyle((props) => ({
  bg: mode("gray.900", "neutrals.800")(props),
  border: "none",
  _hover: {
    bg: mode("gray.800", "neutrals.700")(props),
  },
  _invalid: {
    boxShadow: "error",
  },
  _focusVisible: {
    bg: mode("white", "neutrals.700")(props),
    boxShadow: mode("outlineAccent", "none")(props),
  },
}))

const variants = {
  filled: variantFilled,
}

const sizes = {
  md: {
    px: "5",
    py: "4.5",
    fontSize: "base",
    fontWeight: "semibold",
    borderRadius: "lg",
    minHeight: "14",
    h: "initial",
  },
}

export const textareaTheme = defineStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: "md",
    variant: "filled",
  },
})
