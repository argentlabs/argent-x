import { Input, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Input",
  component: Input,
  argTypes: {
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "Input"),
  },
} as ComponentMeta<typeof Input>

const Template: ComponentStory<typeof Input> = (props) => (
  <Input placeholder="Placeholder" {...props}></Input>
)

export const Default = Template.bind({})
Default.args = {}

export const Filled = Template.bind({})
Filled.args = {
  value: "Lorem ipsum dolor",
}

export const IsInvalid = Template.bind({})
IsInvalid.args = {
  value: "Lorem ipsum dolor",
  isInvalid: true,
}
