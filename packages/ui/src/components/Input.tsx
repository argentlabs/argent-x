import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import { Input } from "@chakra-ui/react"
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/styled-system"

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

const variantFilled = definePartsStyle(({ theme }) => {
  return {
    field: {
      bg: "neutrals.800",
      border: "none",
      _hover: {
        bg: "neutrals.700",
      },
      _invalid: {
        /** using large values gives a 2px inner shadow with no visual influence from the border radius */
        boxShadow: `inset 0 -20px 0 -18px ${theme.colors.error[500]}`,
      },
      _focusVisible: {
        bg: "neutrals.700",
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
}

const sizes = {
  md: definePartsStyle({
    field: size.md,
    addon: size.md,
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
