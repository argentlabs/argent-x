import { switchAnatomy as parts } from "@chakra-ui/anatomy"
import { Switch } from "@chakra-ui/react"
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system"

export { Switch }

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyle = definePartsStyle({
  track: {
    bg: "neutrals.600",
    _checked: {
      bg: "primary.500",
    },
  },
})

export const switchTheme = defineMultiStyleConfig({
  baseStyle,
})
