export const semanticTokens = {
  colors: {
    text: {
      primary: {
        default: "black",
        _dark: "white",
      },
      secondary: {
        default: "neutrals.500",
        _dark: "neutrals.300",
      },
    },
    bg: {
      default: "white",
      _dark: "neutrals.900",
    },
    border: {
      default: "gray.50",
      _dark: "neutrals.800",
    },
    panel: {
      default: "gray.50",
      _dark: "black",
    },
    /** TODO: this is a simple working example - these need mapping properly from Figma */
    surface: {
      default: {
        default: "white",
        _dark: "neutrals.900",
      },
      elevated: {
        default: "gray.50",
        _dark: "neutrals.800",
      },
      "elevated.hover": {
        default: "gray.100",
        _dark: "neutrals.700",
      },
    },
  },
}
