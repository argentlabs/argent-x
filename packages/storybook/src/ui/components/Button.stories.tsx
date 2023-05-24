import { ArrowBackIcon } from "@argent-x/extension/src/ui/components/Icons/MuiIcons"
import { Button, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

export default {
  component: Button,
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
    },
    onClick: { action: "onClick" },
    ...getThemingArgTypes(theme, "Button"),
  },
}

export const Default = {
  args: {
    children: "Button",
  },
}

export const Disabled = {
  args: {
    children: "Button",
    isDisabled: true,
  },
}

export const Primary = {
  args: {
    children: "Button",
    colorScheme: "primary",
  },
}

export const Danger = {
  args: {
    children: "Button",
    colorScheme: "danger",
  },
}

export const WarnHigh = {
  args: {
    children: "Button",
    colorScheme: "warn-high",
  },
}

export const Warn = {
  args: {
    children: "Button",
    colorScheme: "warn",
  },
}

export const Inverted = {
  args: {
    children: "Button",
    colorScheme: "inverted",
  },
}

export const Info = {
  args: {
    children: "Button",
    colorScheme: "info",
  },
}

export const Neutrals = {
  args: {
    children: "Button",
    colorScheme: "neutrals",
  },
}

export const OnboardingBack = {
  args: {
    children: <ArrowBackIcon />,
    colorScheme: "neutrals",
  },
}

export const Transparent = {
  args: {
    children: "Button",
    colorScheme: "transparent",
  },
}
