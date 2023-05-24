import { AccordionIcon, theme } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

export default {
  component: Accordion,
  argTypes: {
    ...getThemingArgTypes(theme, "Accordion"),
  },
}

const children = (
  <AccordionItem>
    <AccordionButton>
      <Box as="span" flex="1" textAlign="left">
        Section 1 title
      </Box>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </AccordionPanel>
  </AccordionItem>
)

export const Default = {
  args: {
    allowToggle: true,
    children,
  },
}

export const ColorSchemeError = {
  args: {
    allowToggle: true,
    size: "sm",
    colorScheme: "error",
    children,
  },
}
