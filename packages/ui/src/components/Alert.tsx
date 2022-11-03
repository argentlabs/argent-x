import { alertAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    p: 3,
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: "xs",
    lineHeight: "3.5",
    fontWeight: "bold",
    letterSpacing: "wide",
  },
})

export const alertTheme = defineMultiStyleConfig({ baseStyle })
