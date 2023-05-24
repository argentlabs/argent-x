import { AccountListItem } from "@argent-x/extension/src/ui/features/accounts/AccountListItem"
import { CellStack } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: AccountListItem,
  parameters: {
    layout: "fullscreen",
  },
}

const account = {
  accountName: "Account 1 Lorem Ipsum Dolor Sit Amet",
  accountAddress:
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  networkId: "goerli-alpha",
}

export const Default = {
  render: (props: ComponentProps<typeof AccountListItem>) => (
    <CellStack>
      <AccountListItem {...props}></AccountListItem>
    </CellStack>
  ),
  args: {
    ...account,
  },
}

export const Outline = {
  ...Default,
  args: {
    ...account,
    outlined: true,
  },
}

export const Highlight = {
  ...Default,
  args: {
    ...account,
    highlighted: true,
  },
}

export const Deploying = {
  ...Default,
  args: {
    ...account,
    deploying: true,
  },
}

export const Upgrade = {
  ...Default,
  args: {
    ...account,
    upgrade: true,
  },
}

export const Connected = {
  ...Default,
  args: {
    ...account,
    connectedHost: "foobar.xyz",
  },
}

export const Hidden = {
  ...Default,
  args: {
    ...account,
    hidden: true,
  },
}

export const Children = {
  ...Default,
  args: {
    ...account,
    children: <span>Child in here</span>,
  },
}

export const AvatarOutlined = {
  ...Default,
  args: {
    ...account,
    avatarOutlined: true,
  },
}

export const PluginAccount = {
  ...Default,
  args: {
    ...account,
    accountType: "plugin",
  },
}
