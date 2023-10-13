import { AccountListItem } from "@argent-x/extension/src/ui/features/accounts/AccountListItem"
import { Button, CellStack, icons } from "@argent/ui"
import { ComponentProps } from "react"

const { AddressBookIcon, WalletIcon } = icons

export default {
  component: AccountListItem,
  parameters: {
    layout: "fullscreen",
  },
  render: (props: ComponentProps<typeof AccountListItem>) => (
    <CellStack>
      <AccountListItem {...props}></AccountListItem>
    </CellStack>
  ),
}

const account = {
  accountName: "Account 1 Lorem Ipsum Dolor Sit Amet",
  accountAddress:
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  networkId: "goerli-alpha",
}

export const Default = {
  args: {
    ...account,
  },
}

export const StarknetID = {
  args: {
    accountName: "foobar.stark",
    accountAddress: "foobar.stark",
    networkId: "goerli-alpha",
  },
}

export const Outline = {
  args: {
    ...account,
    outlined: true,
  },
}

export const Highlight = {
  args: {
    ...account,
    highlighted: true,
  },
}

export const Deploying = {
  args: {
    ...account,
    deploying: true,
  },
}

export const Upgrade = {
  args: {
    ...account,
    upgrade: true,
  },
}

export const WithAmount = {
  args: {
    ...account,
    prettyAccountBalance: "$1.2",
  },
}

export const WithAccountExtraInfo = {
  args: {
    ...account,
    accountExtraInfo: "2/3",
  },
}

export const Connected = {
  args: {
    ...account,
    connectedHost: "foobar.xyz",
  },
}

export const ConnectedWithAmount = {
  args: {
    ...account,
    connectedHost: "foobar.xyz",
    prettyAccountBalance: "$1.2",
  },
}

export const Hidden = {
  args: {
    ...account,
    hidden: true,
  },
}

export const Children = {
  args: {
    ...account,
    children: <span>Child in here</span>,
  },
}

export const AvatarOutlined = {
  args: {
    ...account,
    avatarOutlined: true,
  },
}

export const PluginAccount = {
  args: {
    ...account,
    accountType: "plugin",
  },
}

export const Disabled = {
  args: {
    ...account,
    isDisabled: true,
  },
}

export const AvatarSize = {
  args: {
    ...account,
    avatarSize: 9,
  },
}

export const NetworkName = {
  args: {
    ...account,
    networkName: "Integration",
  },
}

export const Deprecated = {
  args: {
    ...account,
    isDeprecated: true,
  },
}

export const AvatarIcon = {
  args: {
    ...account,
    avatarIcon: <WalletIcon />,
  },
}

export const IsClickableFalse = {
  args: {
    ...account,
    avatarSize: 9,
    isClickable: false,
    avatarIcon: <WalletIcon />,
    children: (
      <Button
        ml={3}
        size={"xs"}
        rounded={"lg"}
        pointerEvents="auto"
        bg={"neutrals.500"}
        leftIcon={<AddressBookIcon />}
      >
        Save
      </Button>
    ),
  },
}
