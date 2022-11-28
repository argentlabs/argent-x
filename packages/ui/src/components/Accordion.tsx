import { accordionAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(accordionAnatomy.keys)

const baseStyle = definePartsStyle({
  // define the part you're going to style
  container: {
    border: "solid 1px",
    borderRadius: "lg",
    color: "neutrals.700",
  },
  panel: {
    color: "white",
  },
  icon: {
    color: "white",
  },
})

export const accordionTheme = defineMultiStyleConfig({ baseStyle })
