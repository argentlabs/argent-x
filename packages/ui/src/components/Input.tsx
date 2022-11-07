import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import { Input } from "@chakra-ui/react"
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/styled-system"
import { mode } from "@chakra-ui/theme-tools"

export { Input }

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyle = definePartsStyle({
  field: {
    /** placeholder */
  },
})

const variantOutline = definePartsStyle(() => {
  return {
    field: {
      /** placeholder */
    },
  }
})

export const variantFilled = definePartsStyle((props) => {
  return {
    field: {
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
    },
  }
})

const variants = {
  outline: variantOutline,
  filled: variantFilled,
}

const size = {
  md: defineStyle({
    px: "5",
    py: "4.5",
    fontSize: "base",
    fontWeight: "semibold",
    borderRadius: "lg",
    minHeight: "14",
  }),
  pill: defineStyle({
    px: "4",
    py: "1",
    fontSize: "sm",
    fontWeight: "semibold",
    borderRadius: "full",
    minHeight: "8",
    textAlign: "right",
  }),
}

const sizes = {
  md: definePartsStyle({
    field: size.md,
    addon: size.md,
  }),
  pill: definePartsStyle({
    field: size.pill,
    addon: size.pill,
  }),
}

export const inputTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: "md",
    variant: "filled",
  },
})
