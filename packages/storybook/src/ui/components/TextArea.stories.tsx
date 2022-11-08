import { Textarea, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Textarea",
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
  <Textarea placeholder="Placeholder" {...props}></Textarea>
)

export const Default = Template.bind({})
Default.args = {}

export const Filled = Template.bind({})
Filled.args = {
  variant: "filled",
  value: "Lorem ipsum dolor",
}

export const FilledIsInvalid = Template.bind({})
FilledIsInvalid.args = {
  variant: "filled",
  value: "Lorem ipsum dolor",
  isInvalid: true,
}

export const Outline = Template.bind({})
Outline.args = {
  variant: "outline",
  value: "Lorem ipsum dolor",
}

export const OutlineIsInvalid = Template.bind({})
OutlineIsInvalid.args = {
  variant: "outline",
  value: "Lorem ipsum dolor",
  isInvalid: true,
}
