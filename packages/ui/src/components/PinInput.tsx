import { HStack, chakra, defineStyleConfig } from "@chakra-ui/react"

export const pinInputTheme = defineStyleConfig({
  baseStyle: {
    _placeholder: {
      color: "transparent",
    },
  },
  sizes: {
    lg: {
      height: 14,
    },
  },
  defaultProps: {
    size: "lg",
  },
})

export const pinInputFieldTheme = defineStyleConfig({})

export { PinInputField, PinInput } from "@chakra-ui/react"

export const PinInputWrapper = chakra(HStack, {
  baseStyle: {
    gap: 2,
    display: "flex",
  },
})
