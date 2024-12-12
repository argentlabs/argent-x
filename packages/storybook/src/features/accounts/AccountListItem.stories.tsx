import { Button, CellStack, icons } from "@argent/x-ui"
import { StoryObj } from "@storybook/react"
import { ComponentProps } from "react"

import { AccountListItem } from "@argent-x/extension/src/ui/features/accounts/AccountListItem"
import { AccountListItemEditAccessory } from "@argent-x/extension/src/ui/features/accounts/AccountListItemEditAccessory"

import { decorators } from "../../decorators/routerDecorators"

const { WalletSecondaryIcon, AddressBookIcon } = icons

export default {
  component: AccountListItem,
  decorators,
  render: (props: ComponentProps<typeof AccountListItem>) => (
    <CellStack>
      <AccountListItem {...props}></AccountListItem>
    </CellStack>
  ),
}

const account = {
  accountName: "Account Lorem Ipsum Dolor Sit Amet 10",
  accountAddress:
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  networkId: "sepolia-alpha",
}

export const Default: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    onClick: () => {
      console.log("AccountListItem clicked")
    },
  },
}

export const StarknetID: StoryObj<typeof AccountListItem> = {
  args: {
    accountName: "foobar.stark",
    accountAddress: "foobar.stark",
    networkId: "sepolia-alpha",
  },
}

export const Highlight: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    highlighted: true,
  },
}

export const Deploying: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    deploying: true,
  },
}

export const Upgrade: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    upgrade: true,
  },
}

export const WithAmount: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    showRightElements: true,
    prettyAccountBalance: "$1.2",
  },
}

export const WithAccountExtraInfo: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    accountExtraInfo: "2/3",
  },
}

export const Connected: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    showRightElements: true,
    connectedHost: "foobar.xyz",
  },
}

export const ConnectedWithAmount: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    showRightElements: true,
    connectedHost: "foobar.xyz",
    prettyAccountBalance: "$1.2",
  },
}

export const Hidden: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    showRightElements: true,
    hidden: true,
  },
}

export const Children: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    children: <span>Child in here</span>,
  },
}

export const AvatarOutlined: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    avatarOutlined: true,
  },
}

export const PluginAccount: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    accountType: "plugin",
  },
}

export const Disabled: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
}

export const AvatarSize: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    avatarSize: 9,
  },
}

export const NetworkName: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    networkName: "Integration",
  },
}

export const Deprecated: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    isDeprecated: true,
  },
}

export const AvatarIcon: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    avatarIcon: <WalletSecondaryIcon />,
  },
}

export const Ledger: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    isLedger: true,
  },
}

export const IsClickableFalse: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    avatarSize: 9,
    isClickable: false,
    avatarIcon: <WalletSecondaryIcon />,
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
export const AcessoryHover: StoryObj<typeof AccountListItem> = {
  args: {
    ...Default.args,
    avatarSize: 9,
    avatarIcon: <WalletSecondaryIcon />,
    children: (
      <AccountListItemEditAccessory
        onClick={() => {
          console.log("AccountListItemEditAccessory clicked")
        }}
      />
    ),
  },
}
