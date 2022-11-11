import { alertAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

import { typographyStyles } from "./Typography"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    p: 3,
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...typographyStyles.L1,
  },
})

export const alertTheme = defineMultiStyleConfig({ baseStyle })
