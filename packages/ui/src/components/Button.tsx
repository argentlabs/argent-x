import { chakra, defineStyleConfig } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"

/** as a convenience */
export { Button }

export const buttonTheme = defineStyleConfig({
  baseStyle: {
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
    solid: ({ colorScheme }) => {
      if (colorScheme === "inverted") {
        return {
          bg: "white",
          color: "black",
          _hover: {
            bg: "gray.900",
          },
          _active: {
            bg: "gray.800",
          },
        }
      }
      return {}
    },
  },
  defaultProps: {
    size: "md",
    variant: "solid",
    colorScheme: "neutrals800",
  },
})

export const ButtonRect = chakra(Button, {
  baseStyle: {
    rounded: "base",
  },
})
