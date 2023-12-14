import { accordionAnatomy } from "@chakra-ui/anatomy"
import {
  createMultiStyleConfigHelpers,
  useAccordionItemState,
} from "@chakra-ui/react"
import { useReducedMotion } from "framer-motion"
import { ComponentProps, FC } from "react"

import { ChevronDownIcon, DropdownDownIcon } from "./icons"
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
        color: "text.primary",
        mt: "1px",
        bg: "surface.elevated",
      },
      icon: {
        color: "text.primary",
      },
      button: {
        bg: "surface.elevated",
        color: "text.primary",
        _hover: {
          bg: "surface.elevated.hover",
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
      color: "text.primary",
    },
    icon: {
      color: "text.primary",
    },
    button: {
      color: "text.primary",
    },
  }
})

const nested = definePartsStyle({
  root: {
    _notFirst: {
      mt: 2,
    },
  },
  container: {
    bg: "transparent",
    border: "none",
    overflow: "hidden",
    borderRadius: 0,
  },
  button: {
    ...typographyStyles.P4,
    fontWeight: "normal",
    color: "text.secondary",
    padding: 0,
  },
  panel: {
    padding: 0,
    borderLeft: "2px solid",
    borderLeftColor: "neutrals.100",
    pl: 2.5,
    mt: 2,
    _dark: {
      borderLeftColor: "neutrals.500",
    },
  },
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
  variants: {
    nested,
  },
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

export const AccordionIconDropdown: FC<
  ComponentProps<typeof DropdownDownIcon>
> = (props) => {
  const { isOpen, isDisabled } = useAccordionItemState()
  const prefersReducedMotion = useReducedMotion()
  return (
    <DropdownDownIcon
      transform={isOpen ? undefined : "rotate(-90deg)"}
      transition={prefersReducedMotion ? undefined : "transform 0.2s"}
      transformOrigin={"center"}
      opacity={isDisabled ? 0.4 : 1}
      color="text.secondary"
      {...props}
    />
  )
}
