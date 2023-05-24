/* eslint-disable react/prop-types */
import { Alert, icons, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

const { LockIcon } = icons

export default {
  component: Alert,
  argTypes: {
    ...getThemingArgTypes(theme, "Alert"),
  },
}

export const Default = {
  args: {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    icon: <LockIcon />,
  },
}

export const Large = {
  args: {
    title: "Setup account recovery",
    description: "Click to secure your assets.",
    size: "lg",
    colorScheme: "warning",
    icon: <LockIcon />,
  },
}
