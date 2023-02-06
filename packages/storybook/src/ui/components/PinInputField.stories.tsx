import { PinInput, PinInputField, theme } from "@argent/ui"
import { HStack } from "@chakra-ui/react"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/PinInput",
  component: PinInput,
  argTypes: {
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "PinInput"),
  },
} as ComponentMeta<typeof PinInput>

const Template: ComponentStory<typeof PinInput> = (props) => (
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
)

export const Default = Template.bind({})
Default.args = {
  placeholder: "",
  otp: true,
}

export const Filled = Template.bind({})
Filled.args = {
  placeholder: "",
  otp: true,
  variant: "filled",
  value: "1",
}

export const FilledIsInvalid = Template.bind({})
FilledIsInvalid.args = {
  placeholder: "",
  otp: true,
  variant: "filled",
  value: "2",
  isInvalid: true,
}

export const Outline = Template.bind({})
Outline.args = {
  placeholder: "",
  otp: true,
  variant: "outline",
  value: "3",
}

export const OutlineIsInvalid = Template.bind({})
OutlineIsInvalid.args = {
  placeholder: "",
  otp: true,
  variant: "outline",
  value: "4",
  isInvalid: true,
}
