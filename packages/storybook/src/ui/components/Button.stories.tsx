import { ArrowBackIcon } from "@argent-x/extension/src/ui/components/Icons/MuiIcons"
import { Button } from "@argent-x/ui/src/components/Button"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Button",
  component: Button,
  argTypes: {
    size: {
      control: { type: "inline-radio" },
    },
    shape: {
      control: { type: "inline-radio" },
    },
  },
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (props) => (
  <Button {...props}></Button>
)

export const Default = Template.bind({})
Default.args = {
  children: "Button",
}

export const Disabled = Template.bind({})
Disabled.args = {
  children: "Button",
  disabled: true,
}

export const Primary = Template.bind({})
Primary.args = {
  children: "Button",
  variant: "primary",
}

export const Danger = Template.bind({})
Danger.args = {
  children: "Button",
  variant: "danger",
}

export const WarnHigh = Template.bind({})
WarnHigh.args = {
  children: "Button",
  variant: "warn-high",
}

export const Warn = Template.bind({})
Warn.args = {
  children: "Button",
  variant: "warn",
}

export const Inverted = Template.bind({})
Inverted.args = {
  children: "Button",
  variant: "inverted",
}

export const Info = Template.bind({})
Info.args = {
  children: "Button",
  variant: "info",
}

export const Neutrals800 = Template.bind({})
Neutrals800.args = {
  children: "Button",
  variant: "neutrals800",
}

export const OnboardingBack = Template.bind({})
OnboardingBack.args = {
  children: (
    <>
      <ArrowBackIcon />
    </>
  ),
  variant: "neutrals800",
}
