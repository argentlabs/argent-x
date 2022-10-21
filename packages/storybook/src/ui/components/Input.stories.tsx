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
  <Input {...props}></Input>
)

export const Default = Template.bind({})
Default.args = {
  placeholder: "Placeholder",
}
