import {
  AccordionIcon,
  P4,
  theme,
  AccordionIconDropdown,
  LabelValueStack,
  LabelValueRow,
} from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Text,
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

export const ColorSchemeNeutrals = {
  args: {
    allowToggle: true,
    size: "sm",
    colorScheme: "neutrals",
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

export const CustomIcon = {
  args: {
    allowToggle: true,
    size: "sm",
    colorScheme: "neutrals",
    children: (
      <AccordionItem>
        <AccordionButton>
          <P4 mr={1}>Section 1 title</P4>
          <AccordionIconDropdown />
        </AccordionButton>
        <AccordionPanel>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </AccordionPanel>
        <AccordionPanel>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </AccordionPanel>
      </AccordionItem>
    ),
  },
}

const NestedNested = () => (
  <Accordion allowToggle defaultIndex={0} size={"sm"} variant={"nested"}>
    <AccordionItem>
      <AccordionButton>
        <Text mr={1}>Section title</Text>
        <AccordionIconDropdown />
      </AccordionButton>
      <AccordionPanel>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
)

export const Nested = {
  args: {
    allowToggle: true,
    size: "sm",
    variant: "nested",
    defaultIndex: 0,
    children: (
      <AccordionItem>
        <AccordionButton>
          <Text mr={1}>Section 1 title</Text>
          <AccordionIconDropdown />
        </AccordionButton>
        <AccordionPanel>
          <NestedNested />
          <Accordion
            allowToggle
            defaultIndex={0}
            size={"sm"}
            variant={"nested"}
          >
            <AccordionItem>
              <AccordionButton>
                <Text mr={1}>Section 1 title</Text>
                <AccordionIconDropdown />
              </AccordionButton>
              <AccordionPanel>
                <LabelValueStack>
                  <NestedNested />
                  <LabelValueRow label={"Lorem"} value={"Ipsum"} />
                  <LabelValueRow label={"Lorem"} value={"Ipsum"} />
                  <NestedNested />
                  <LabelValueRow label={"Lorem"} value={"Ipsum"} />
                  <LabelValueRow label={"Lorem"} value={"Ipsum"} />
                  <NestedNested />
                </LabelValueStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </AccordionPanel>
      </AccordionItem>
    ),
  },
}
