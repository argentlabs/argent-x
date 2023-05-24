import { PinInput, PinInputField, theme } from "@argent/ui"
import { HStack } from "@chakra-ui/react"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentProps } from "react"

export default {
  component: PinInput,
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "PinInput"),
  },
}

export const Default = {
  render: (props: ComponentProps<typeof PinInput>) => (
    <HStack spacing={1.5}>
      <PinInput {...props}>
        <PinInputField></PinInputField>
        <PinInputField></PinInputField>
        <PinInputField></PinInputField>
        <PinInputField></PinInputField>
        <PinInputField></PinInputField>
        <PinInputField></PinInputField>
      </PinInput>
    </HStack>
  ),
  args: {
    placeholder: "",
    otp: true,
  },
}

export const Filled = {
  ...Default,
  args: {
    placeholder: "",
    otp: true,
    variant: "filled",
    value: "1",
  },
}

export const FilledIsInvalid = {
  ...Default,
  args: {
    placeholder: "",
    otp: true,
    variant: "filled",
    value: "2",
    isInvalid: true,
  },
}

export const Outline = {
  ...Default,
  args: {
    placeholder: "",
    otp: true,
    variant: "outline",
    value: "3",
  },
}

export const OutlineIsInvalid = {
  ...Default,
  args: {
    placeholder: "",
    otp: true,
    variant: "outline",
    value: "4",
    isInvalid: true,
  },
}
