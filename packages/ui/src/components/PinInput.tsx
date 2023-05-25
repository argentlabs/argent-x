import { HStack, PinInput, PinInputField, chakra } from "@chakra-ui/react"
import { defineStyle, defineStyleConfig } from "@chakra-ui/styled-system"

import {
  baseStyle as inputBaseStyle,
  sizes as inputSizes,
  variantFilled,
  variantFlat,
  variantOutline,
} from "./Input"
import { typographyStyles } from "./Typography"

export { PinInputField, PinInput }

const baseStyle = defineStyle({
  ...inputBaseStyle,
  textAlign: "center",
})

const variants = {
  outline: defineStyle((props) => variantOutline(props).field),
  filled: defineStyle((props) => variantFilled(props).field),
  flat: defineStyle((props) => variantFlat(props).field),
}

const sizes = {
  ...inputSizes,
  md: {
    ...inputSizes.md,
    ...typographyStyles.H3,
    w: 12,
    px: 0,
  },
}

export const pinInputTheme = defineStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: "md",
    variant: "outline",
  },
})

export const PinInputWrapper = chakra(HStack, {
  baseStyle: {
    gap: 2,
    display: "flex",
  },
})
