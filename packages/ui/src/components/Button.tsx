import { Button, chakra, defineStyleConfig } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

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
    "2xs": {
      minHeight: 8,
      fontSize: "sm",
      px: 3,
      py: 1,
    },
    xs: {
      minHeight: 9,
      fontSize: "sm",
      px: 4,
      py: 1,
    },
    sm: {
      minHeight: 10,
      fontSize: "sm",
      px: 5,
      py: 2,
    },
    md: {
      minHeight: 12,
      fontSize: "lg",
      px: 6,
      py: 2,
    },
    lg: {
      minHeight: 14,
      fontSize: "lg",
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
            bg: mode("gray.100", "gray.900")(props),
          },
          _active: {
            bg: mode("gray.200", "gray.800")(props),
          },
        }
      } else if (c === "neutrals") {
        return {
          bg: mode(`white`, `${c}.800`)(props),
          color: mode(`${c}.700`, "white")(props),
          boxShadow: mode("neutralsButtonLight", "initial")(props),
          _hover: {
            bg: mode(`gray.900`, `${c}.700`)(props),
          },
          _active: {
            bg: mode(`gray.9800`, `${c}.600`)(props),
          },
        }
      }
      /** same for dark or light mode */
      return {
        bg: `${c}.500`,
        color: "white",
        _hover: {
          bg: `${c}.600`,
          _disabled: {
            bg: `${c}.500`,
          },
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

export const ButtonRect = chakra(Button, {
  baseStyle: {
    rounded: "base",
  },
})
