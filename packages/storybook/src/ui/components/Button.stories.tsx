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

export const Danger = Template.bind({})
Danger.args = {
  children: "Button",
  variant: "danger",
  disabled: false,
}

export const WarnHigh = Template.bind({})
WarnHigh.args = {
  children: "Button",
  variant: "warn-high",
  disabled: false,
}

export const Warn = Template.bind({})
Warn.args = {
  children: "Button",
  variant: "warn",
  disabled: false,
}

export const Info = Template.bind({})
Info.args = {
  children: "Button",
  variant: "info",
  disabled: false,
}
