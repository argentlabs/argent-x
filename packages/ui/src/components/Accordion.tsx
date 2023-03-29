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
  return {
    container:
      c === "error"
        ? {
            bg: "error.900",
            borderRadius: "lg",
            color: "error.500",
            border: "none",
            overflow: "hidden",
          }
        : {
            border: "solid 1px",
            borderRadius: "lg",
            color: "neutrals.700",
          },
    panel:
      c === "error"
        ? {
            color: "error.300",
          }
        : {
            color: "white",
          },
    icon: {
      color: "white",
    },
    button:
      c === "error"
        ? {
            bg: "error.500",
            color: "white",
            _hover: {
              bg: "error.600",
            },
          }
        : {
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
