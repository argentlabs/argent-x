import { defineStyleConfig } from "@chakra-ui/react"

import { typographyStyles } from "./Typography"

const baseStyle = {
  borderRadius: "base",
  border: "1px solid",
  color: "text",
  background: "black",
  borderColor: "border",
  py: "1",
  px: "2",
  ...typographyStyles.L1,
}

export const tooltipTheme = defineStyleConfig({ baseStyle })
