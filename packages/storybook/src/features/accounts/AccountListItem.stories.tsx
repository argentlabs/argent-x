import { StoryObj } from "@storybook/react"
import { AccountListItem } from "@argent-x/extension/src/ui/features/accounts/AccountListItem"
import { Button, CellStack, icons } from "@argent/x-ui"
import { ComponentProps } from "react"
import { decorators } from "../../decorators/routerDecorators"

const { AddressBookIcon, WalletIcon } = icons

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
  networkId: "goerli-alpha",
}

export const Default: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
  },
}

export const StarknetID: StoryObj<typeof AccountListItem> = {
  args: {
    accountName: "foobar.stark",
    accountAddress: "foobar.stark",
    networkId: "goerli-alpha",
  },
}

export const Highlight: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    highlighted: true,
  },
}

export const Deploying: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    deploying: true,
  },
}

export const Upgrade: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    upgrade: true,
  },
}

export const WithAmount: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    showRightElements: true,
    prettyAccountBalance: "$1.2",
  },
}

export const WithAccountExtraInfo: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    accountExtraInfo: "2/3",
  },
}

export const Connected: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    showRightElements: true,
    connectedHost: "foobar.xyz",
  },
}

export const ConnectedWithAmount: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    showRightElements: true,
    connectedHost: "foobar.xyz",
    prettyAccountBalance: "$1.2",
  },
}

export const Hidden: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    showRightElements: true,
    hidden: true,
  },
}

export const Children: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    children: <span>Child in here</span>,
  },
}

export const AvatarOutlined: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    avatarOutlined: true,
  },
}

export const PluginAccount: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    accountType: "plugin",
  },
}

export const Disabled: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    isDisabled: true,
  },
}

export const AvatarSize: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    avatarSize: 9,
  },
}

export const NetworkName: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    networkName: "Integration",
  },
}

export const Deprecated: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    isDeprecated: true,
  },
}

export const AvatarIcon: StoryObj<typeof AccountListItem> = {
  args: {
    ...account,
    avatarIcon: <WalletIcon />,
  },
}

export const IsClickableFalse: StoryObj<typeof AccountListItem> = {
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
