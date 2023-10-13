import { accordionAnatomy } from "@chakra-ui/anatomy"
import {
  createMultiStyleConfigHelpers,
  useAccordionItemState,
} from "@chakra-ui/react"
import { useReducedMotion } from "framer-motion"
import { ComponentProps, FC } from "react"

import { ChevronDownIcon } from "./icons"
import { typographyStyles } from "./Typography"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(accordionAnatomy.keys)

const baseStyle = definePartsStyle((props) => {
  const { colorScheme: c } = props
  if (c === "error") {
    return {
      container: {
        bg: "error.900",
        borderRadius: "lg",
        color: "error.500",
        border: "none",
        overflow: "hidden",
      },
      panel: {
        color: "error.300",
      },
      icon: {
        color: "white",
      },
      button: {
        bg: "error.500",
        color: "white",
        _hover: {
          bg: "error.600",
        },
      },
    }
  }
  if (c === "neutrals") {
    return {
      container: {
        bg: "transparent",
        borderRadius: "lg",
        border: "none",
        overflow: "hidden",
      },
      panel: {
        color: "white",
        bg: "neutrals.800",
        mt: "1px",
      },
      icon: {
        color: "white",
      },
      button: {
        bg: "neutrals.800",
        color: "white",
        _hover: {
          bg: "neutrals.700",
        },
      },
    }
  }
  return {
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
    button: {
      color: "white",
    },
  }
})

const sizes = {
  base: definePartsStyle({}),
  sm: definePartsStyle({
    button: {
      p: 3,
      ...typographyStyles.L1,
    },
    panel: {
      p: 3,
      ...typographyStyles.P4,
    },
  }),
}

export const accordionTheme = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: "base",
  },
})

export const AccordionIcon: FC<ComponentProps<typeof ChevronDownIcon>> = (
  props,
) => {
  const { isOpen, isDisabled } = useAccordionItemState()
  const prefersReducedMotion = useReducedMotion()
  return (
    <ChevronDownIcon
      transform={isOpen ? "rotate(-180deg)" : undefined}
      transition={prefersReducedMotion ? undefined : "transform 0.2s"}
      transformOrigin={"center"}
      opacity={isDisabled ? 0.4 : 1}
      {...props}
    />
  )
}
