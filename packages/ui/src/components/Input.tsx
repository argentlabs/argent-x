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

export const baseStyle = definePartsStyle({
  field: {
    /** placeholder */
  },
})

export const variantOutline = definePartsStyle((props) => {
  return {
    field: {
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
    },
  }
})

export const variantFilled = definePartsStyle((props) => {
  return {
    field: {
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
    },
  }
})

export const variantFlat = definePartsStyle((props) => {
  return {
    field: {
      bg: mode("gray.50", "neutrals.800")(props),
      border: "none",
      _placeholder: {
        color: mode("gray.300", "neutrals.400")(props),
      },
      _hover: {
        bg: mode("gray.100", "neutrals.800")(props),
      },
      _invalid: {
        boxShadow: "error",
        _focusVisible: {
          boxShadow: mode("outlineError", "error")(props),
        },
      },
      _focusVisible: {
        bg: mode("white", "neutrals.800")(props),
        boxShadow: mode("outlineAccent", "none")(props),
      },
    },
  }
})

const variants = {
  outline: variantOutline,
  filled: variantFilled,
  flat: variantFlat,
}

export const size = {
  md: defineStyle({
    px: "5",
    py: "4.5",
    fontSize: "base",
    fontWeight: "semibold",
    borderRadius: "lg",
    minHeight: "14",
  }),
  sm: defineStyle({
    px: "3",
    py: "3.5",
    fontSize: "base",
    fontWeight: "semibold",
    borderRadius: "lg",
    minHeight: "12",
    h: "10" /** also defines the width of InputLeftElement and InputRightElement... */,
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
    element: defineStyle({
      ...size.md,
      px: undefined,
    }),
  }),
  sm: definePartsStyle({
    field: size.sm,
    addon: size.sm,
    element: defineStyle({
      ...size.sm,
      px: undefined,
    }),
  }),
  pill: definePartsStyle({
    field: size.pill,
    addon: size.pill,
    element: defineStyle({
      ...size.pill,
      px: undefined,
    }),
  }),
}

export const inputTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: "md",
    variant: "outline",
  },
})
