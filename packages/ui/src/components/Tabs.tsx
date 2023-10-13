import { tabsAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

import { typographyStyles } from "."

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys)

const sizes = {
  sm: definePartsStyle({
    tab: {
      ...typographyStyles.L1,
      py: "2",
      px: "3",
    },
    tabpanel: {
      p: 0,
    },
  }),
}

const pill = definePartsStyle(() => {
  return {
    tab: {
      color: "neutrals.300",
      rounded: "full",
      bg: "neutrals.800",
      border: "1px solid",
      borderColor: "transparent",
      _hover: {
        color: "neutrals.200",
        bg: "neutrals.700",
      },
      _selected: {
        bg: "transparent",
        borderColor: "white",
        color: "white",
      },
    },
    tablist: {
      gap: 1,
    },
    tabpanel: {},
  }
})

const variants = {
  pill,
}

export const tabsTheme = defineMultiStyleConfig({
  variants,
  sizes,
  defaultProps: {
    size: "sm",
    variant: "pill",
  },
})
