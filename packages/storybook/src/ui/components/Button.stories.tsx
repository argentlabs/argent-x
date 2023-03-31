import { ArrowBackIcon } from "@argent-x/extension/src/ui/components/Icons/MuiIcons"
import { Button, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Button",
  component: Button,
  argTypes: {
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "Button"),
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
  colorScheme: "primary",
}

export const Danger = Template.bind({})
Danger.args = {
  children: "Button",
  colorScheme: "danger",
}

export const WarnHigh = Template.bind({})
WarnHigh.args = {
  children: "Button",
  colorScheme: "warn-high",
}

export const Warn = Template.bind({})
Warn.args = {
  children: "Button",
  colorScheme: "warn",
}

export const Inverted = Template.bind({})
Inverted.args = {
  children: "Button",
  colorScheme: "inverted",
}

export const Info = Template.bind({})
Info.args = {
  children: "Button",
  colorScheme: "info",
}

export const Neutrals = Template.bind({})
Neutrals.args = {
  children: "Button",
  colorScheme: "neutrals",
}

export const OnboardingBack = Template.bind({})
OnboardingBack.args = {
  children: (
    <>
      <ArrowBackIcon />
    </>
  ),
  colorScheme: "neutrals",
}

export const Transparent = Template.bind({})
Transparent.args = {
  children: "Button",
  colorScheme: "transparent",
}
