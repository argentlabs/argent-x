import { Button, defineStyleConfig } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

import { typographyStyles } from "./Typography"

/** as a convenience */
export { Button }

export const buttonTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      display: "flex",
      alignIitems: "center",
      justifyContent: "center",
      outline: "none",
      border: "none",
      textAlign: "center",
      rounded: "full",
      fontWeight: "bold",
      _active: {
        transform: "scale(0.975)",
      },
      cursor: "pointer",
      _disabled: {
        pointerEvents: "none",
      },
      _focusVisible: {
        boxShadow: mode("outlineAccent", "outline")(props),
      },
    }
  },
  sizes: {
    auto: {},
    "3xs": {
      ...typographyStyles.B3,
      px: "1.5",
      py: 0,
    },
    "2xs": {
      ...typographyStyles.B3,
      minHeight: 8,
      px: 3,
      py: 1,
    },
    xs: {
      ...typographyStyles.B3,
      minHeight: 9,
      px: 4,
      py: 1,
    },
    sm: {
      ...typographyStyles.B3,
      minHeight: 10,
      px: 5,
      py: 2,
    },
    md: {
      ...typographyStyles.B2,
      minHeight: 12,
      px: 6,
      py: 2,
    },
    lg: {
      ...typographyStyles.B1,
      minHeight: 14,
      px: 8,
      py: 2,
    },
  },
  variants: {
    outline: {},
    solid: (props) => {
      const { colorScheme: c } = props
      if (c === "inverted") {
        return {
          bg: mode("black", "white")(props),
          color: mode("white", "black")(props),
          _hover: {
            bg: mode("gray.800", "gray.100")(props),
          },
          _active: {
            bg: mode("gray.700", "gray.200")(props),
          },
        }
      } else if (c === "neutrals") {
        const color = mode(`${c}.700`, "white")(props)
        return {
          bg: mode(`white`, `${c}.800`)(props),
          color,
          boxShadow: mode("neutralsButtonLight", "initial")(props),
          _hover: { color, bg: mode(`gray.50`, `${c}.700`)(props) },
          _active: { color, bg: mode(`gray.100`, `${c}.600`)(props) },
        }
      } else if (c === "tertiary") {
        return {
          bg: mode(`${c}.200`, `${c}.500`)(props),
          color: mode(`white`, `white`)(props),
          _hover: {
            bg: mode(`${c}.300`, `${c}.400`)(props),
          },
          _active: {
            bg: mode(`${c}.400`, `${c}.300`)(props),
          },
        }
      } else if (c === "transparent") {
        const color = mode(`gray.700`, "white")(props)
        return {
          bg: "transparent",
          color,
          _hover: {
            color,
            bg: mode(`gray.50`, `neutrals.700`)(props),
          },
          _active: {
            color,
            bg: mode(`gray.100`, `neutrals.800`)(props),
          },
        }
      }

      /** same for dark or light mode */
      return {
        bg: `${c}.500`,
        color: "white",
        _hover: {
          bg: `${c}.600`,
        },
        _active: {
          bg: `${c}.700`,
        },
      }
    },
  },
  defaultProps: {
    size: "md",
    variant: "solid",
    colorScheme: "neutrals",
  },
})
