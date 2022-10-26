import { Textarea, defineStyleConfig } from "@chakra-ui/react"
import { defineStyle } from "@chakra-ui/styled-system"

export { Textarea }

const baseStyle = defineStyle({
  /** placeholder */
})

const variantFilled = defineStyle({
  bg: "neutrals.800",
  border: "none",
  _hover: {
    bg: "neutrals.700",
  },
  _invalid: {
    boxShadow: "error",
  },
  _focusVisible: {
    bg: "neutrals.700",
  },
})

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
