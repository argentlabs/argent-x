/* eslint-disable react/prop-types */
import { AlertButton, icons, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

const { LockIcon } = icons

export default {
  title: "components/AlertButton",
  component: AlertButton,
  argTypes: {
    ...getThemingArgTypes(theme, "Alert"),
  },
} as ComponentMeta<typeof AlertButton>

const onClick = () => console.log("onClick")

const Template: ComponentStory<any> = (props) => {
  return <AlertButton onClick={onClick} {...props} />
}

export const Default = Template.bind({})
Default.args = {
  title: "Setup account recovery",
  description: "Click to secure your assets.",
  colorScheme: "primary",
  icon: <LockIcon />,
}

export const Large = Template.bind({})
Large.args = {
  title: "Setup account recovery",
  description: "Click to secure your assets.",
  size: "lg",
  colorScheme: "warning",
  icon: <LockIcon />,
}
