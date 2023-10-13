import { Textarea, defineStyleConfig } from "@chakra-ui/react"
import { defineStyle } from "@chakra-ui/styled-system"
import { mode } from "@chakra-ui/theme-tools"

export { Textarea }

const baseStyle = defineStyle({
  transitionProperty: "common",
  transitionDuration: "normal",
})

const variantOutline = defineStyle((props) => ({
  bg: mode("white", "black")(props),
  border: "1px solid",
  borderColor: "border",
  _placeholder: {
    color: mode("gray.200", "neutrals.500")(props),
  },
  _hover: {
    borderColor: mode("gray.100", "neutrals.600")(props),
  },
  _invalid: {
    borderColor: "error.500",
    boxShadow: mode("inherit", "none")(props),
    _hover: {
      borderColor: mode("error.400", "error.600")(props),
    },
    _focusVisible: {
      borderColor: "error.500",
      boxShadow: mode("outlineError", "none")(props),
    },
  },
  _focusVisible: {
    borderColor: mode("accent.500", "neutrals.400")(props),
    boxShadow: mode("outlineAccent", "none")(props),
  },
}))

const variantFilled = defineStyle((props) => ({
  bg: mode("gray.50", "neutrals.800")(props),
  border: "none",
  _placeholder: {
    color: mode("gray.300", "neutrals.400")(props),
  },
  _hover: {
    bg: mode("gray.100", "neutrals.700")(props),
  },
  _invalid: {
    boxShadow: "error",
    _focusVisible: {
      boxShadow: mode("outlineError", "error")(props),
    },
  },
  _focusVisible: {
    bg: mode("white", "neutrals.700")(props),
    boxShadow: mode("outlineAccent", "none")(props),
  },
}))

const variants = {
  outline: variantOutline,
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
  sm: defineStyle({
    px: "3",
    py: "3.5",
    fontSize: "base",
    fontWeight: "semibold",
    borderRadius: "lg",
    minHeight: "12",
    h: "10" /** also defines the width of InputLeftElement and InputRightElement... */,
  }),
}

export const textareaTheme = defineStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: "md",
    variant: "outline",
  },
})
