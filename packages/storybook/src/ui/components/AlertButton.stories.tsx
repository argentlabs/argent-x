/* eslint-disable react/prop-types */
import { AlertButton, icons, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

const { LockIcon } = icons

export default {
  component: AlertButton,
  argTypes: {
    onClick: { action: "onClick" },
    ...getThemingArgTypes(theme, "Alert"),
  },
}

export const Default = {
  args: {
    title: "Setup account recovery",
    description: "Click to secure your assets.",
    colorScheme: "primary",
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
