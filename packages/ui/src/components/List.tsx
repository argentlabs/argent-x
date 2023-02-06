import { listAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system"

import { typographyStyles } from "./Typography"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const variants = {
  bordered: definePartsStyle(() => ({
    container: {
      border: "1px solid",
      borderColor: "neutrals.600",
      rounded: "lg",
      counterReset: "borderedList",
      marginInlineStart: 0,
      margin: 0,
      ...typographyStyles.P4,
    },
    item: {
      display: "flex",
      alignItems: "center",
      py: 2,
      px: 3,
      gap: 3,
      _notLast: {
        borderBottom: "1px solid",
        borderColor: "neutrals.700",
      },
      "&::before": {
        display: "flex",
        content: "counter(borderedList)",
        backgroundColor: "neutrals.700",
        counterIncrement: "borderedList",
        rounded: "full",
        width: 6,
        height: 6,
        flexShrink: 0,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      },
    },
  })),
}

export const listTheme = defineMultiStyleConfig({ variants })
