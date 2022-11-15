/* eslint-disable react/prop-types */
import { icons, theme } from "@argent/ui"
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from "@chakra-ui/react"
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

const Template: ComponentStory<typeof Alert> = ({
  title,
  description,
  ...rest
}) => {
  return (
    <Alert {...rest}>
      <AlertIcon>
        <LockIcon />
      </AlertIcon>
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Box>
    </Alert>
  )
}

export const Default = Template.bind({})
Default.args = {
  title: "Lorem ipsum",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
}

export const Large = Template.bind({})
Large.args = {
  title: "Setup account recovery",
  description: "Click to secure your assets.",
  size: "lg",
  colorScheme: "warning",
}
