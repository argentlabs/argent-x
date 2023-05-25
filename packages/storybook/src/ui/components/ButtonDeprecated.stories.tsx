import { Button as ButtonDeprecated } from "@argent-x/extension/src/ui/components/Button"

export default {
  component: ButtonDeprecated,
  argTypes: {
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
    onClick: { action: "onClick" },
  },
}

export const Default = {
  args: {
    children: "Button",
    disabled: false,
  },
}

export const Disabled = {
  args: {
    children: "Button",
    disabled: true,
  },
}

export const Primary = {
  args: {
    children: "Button",
    variant: "primary",
    disabled: false,
  },
}

export const Danger = {
  args: {
    children: "Button",
    variant: "danger",
    disabled: false,
  },
}

export const WarnHigh = {
  args: {
    children: "Button",
    variant: "warn-high",
    disabled: false,
  },
}

export const Warn = {
  args: {
    children: "Button",
    variant: "warn",
    disabled: false,
  },
}

export const Inverted = {
  args: {
    children: "Button",
    variant: "inverted",
    disabled: false,
  },
}

export const Info = {
  args: {
    children: "Button",
    variant: "info",
    disabled: false,
  },
}

export const Neutrals800 = {
  args: {
    children: "Button",
    variant: "neutrals800",
    disabled: false,
  },
}
