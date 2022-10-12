import { IconButton } from "@argent-x/ui/src/components/Button"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/IconButtonNew",
  component: IconButton,
} as ComponentMeta<typeof IconButton>

const Template: ComponentStory<typeof IconButton> = (props) => (
  <IconButton {...props}></IconButton>
)

export const IconAndText = Template.bind({})
IconAndText.args = {
  copyValue: "Will be copied to clipboard",
  children: <>Some content in here</>,
}

export const IconOnly = Template.bind({})
IconOnly.args = {
  copyValue: "Will be copied to clipboard",
}
