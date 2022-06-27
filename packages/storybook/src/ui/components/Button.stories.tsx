import { Button } from "@argent-x/extension/src/ui/components/Button"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Button",
  component: Button,
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (props) => (
  <Button {...props}></Button>
)

export const Default = Template.bind({})
Default.args = {
  children: "Button",
  disabled: false,
}

export const Disabled = Template.bind({})
Disabled.args = {
  children: "Button",
  disabled: true,
}
