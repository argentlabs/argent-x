import { Meta, StoryObj } from "@storybook/react"
import { BarBackButton, BarCloseButton } from "@argent/x-ui"

import { AccountDetailsNavigationBar } from "@argent-x/extension/src/ui/features/navigation/AccountDetailsNavigationBar"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof AccountDetailsNavigationBar> = {
  component: AccountDetailsNavigationBar,
  decorators,
}

export default meta

type Story = StoryObj<typeof AccountDetailsNavigationBar>

const account = {
  name: "Account Lorem Ipsum Dolor Sit Amet 10",
  id: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a::mainnet-alpha::local_secret::0",
  address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
}

export const Default: Story = {
  args: {
    accountName: account.name,
    accountId: account.id,
    accountAddress: account.address,
    networkName: "Mainnet",
  },
}

export const LedgerConnected: Story = {
  args: {
    ...Default.args,
    isLedgerConnected: true,
  },
}

export const LedgerNotConnected: Story = {
  args: {
    ...Default.args,
    isLedgerConnected: false,
  },
}

export const WithLeftButton: Story = {
  args: {
    ...Default.args,
    leftButton: <BarBackButton />,
  },
}

export const WithLeftAndRightButton: Story = {
  args: {
    ...Default.args,
    leftButton: <BarBackButton />,
    rightButton: <BarCloseButton />,
  },
}

export const LongText: Story = {
  args: {
    ...Default.args,
    accountName: "Very Long Account Name That Should Be Truncated",
    networkName: "Very Long Network Name That Should Be Truncated",
    isLedgerConnected: true,
  },
}
