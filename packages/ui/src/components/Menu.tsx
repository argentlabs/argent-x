import { menuAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys)

const sizes = {
  "2xs": definePartsStyle({
    button: {
      minHeight: 8,
      fontSize: "sm",
    },
    item: {
      minHeight: 8,
      fontSize: "sm",
    },
  }),
}

const baseStyle = definePartsStyle({
  button: {
    fontWeight: "bold",
  },
  list: {
    py: 0,
    borderRadius: "xl",
    border: "none",
    bg: "neutrals.700",
    overflow: "hidden",
    boxShadow: "menu",
  },
  item: {
    p: 3,
    fontWeight: "bold",
    color: "neutrals.100",
    _hover: {
      color: "white",
      bg: "neutrals.600",
    },
    _focus: {
      color: "white",
      bg: "neutrals.600",
    },
    ".chakra-menu__icon-wrapper": {
      fontSize: "inherit",
    },
  },
})

export const menuTheme = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: "2xs",
  },
})
