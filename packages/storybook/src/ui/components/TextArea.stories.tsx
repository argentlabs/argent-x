import { Textarea, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/TextArea",
  component: Textarea,
  argTypes: {
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "Textarea"),
  },
} as ComponentMeta<typeof Textarea>

const Template: ComponentStory<typeof Textarea> = (props) => (
  <Textarea {...props}></Textarea>
)

export const Default = Template.bind({})
Default.args = {
  placeholder: "Placeholder",
}
