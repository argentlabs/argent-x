import { Input, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

export default {
  component: Input,
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "Input"),
  },
}

export const Default = {
  args: {
    placeholder: "Placeholder",
  },
}

export const Filled = {
  args: {
    variant: "filled",
    value: "Lorem ipsum dolor",
  },
}

export const FilledIsInvalid = {
  args: {
    variant: "filled",
    value: "Lorem ipsum dolor",
    isInvalid: true,
  },
}

export const Outline = {
  args: {
    variant: "outline",
    value: "Lorem ipsum dolor",
  },
}

export const OutlineIsInvalid = {
  args: {
    variant: "outline",
    value: "Lorem ipsum dolor",
    isInvalid: true,
  },
}
