import type { Meta, StoryObj } from "@storybook/react"

import { AccountNavigationBar } from "@argent-x/extension/src/ui/features/navigation/AccountNavigationBar"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof AccountNavigationBar> = {
  component: AccountNavigationBar,
  decorators,
}

export default meta

type Story = StoryObj<typeof AccountNavigationBar>

const account = {
  name: "Account Lorem Ipsum Dolor Sit Amet 10",
  id: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a::mainnet-alpha::local_secret::0",
  address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
}

export const Default: Story = {
  args: {
    accountName: account.name,
    accountId: account.id,
    networkName: "Mainnet",
  },
}

export const Shield: Story = {
  args: {
    ...Default.args,
    isSmartAccount: true,
  },
}

export const Multisig: Story = {
  args: {
    ...Default.args,
    isMultisig: true,
  },
}

export const LedgerAccount: Story = {
  args: {
    ...Default.args,
    isLedgerAccount: true,
  },
}

export const OnlySettings: Story = {
  args: {
    ...Default.args,
    showPortfolioButton: false,
  },
}

export const EnvLabel: Story = {
  args: {
    ...Default.args,
    envLabel: "Hydrogen",
  },
}

export const LongText: Story = {
  args: {
    ...Default.args,
    accountName: "Very Long Account Name That Should Be Truncated",
    networkName: "Very Long Network Name That Should Be Truncated",
    envLabel: "Hydrogen",
  },
}

export const AllFeaturesEnabled: Story = {
  args: {
    ...LongText.args,
    isSmartAccount: true,
    isMultisig: true,
    isLedgerAccount: true,
    showSettingsButton: true,
    showPortfolioButton: true,
  },
}
