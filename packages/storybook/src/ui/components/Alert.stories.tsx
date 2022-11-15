/* eslint-disable react/prop-types */
import { Alert, icons, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

const { LockIcon } = icons

export default {
  title: "components/Alert",
  component: Alert,
  argTypes: {
    ...getThemingArgTypes(theme, "Alert"),
  },
} as ComponentMeta<typeof Alert>

const Template: ComponentStory<typeof Alert> = (props) => {
  return <Alert {...props} />
}

export const Default = Template.bind({})
Default.args = {
  title: "Lorem ipsum",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
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
