import { NavigationBarAccountDetails } from "@argent-x/extension/src/ui/features/actions/transactionV2/header"
import { Meta, StoryObj } from "@storybook/react"

const meta: Meta<typeof NavigationBarAccountDetails> = {
  component: NavigationBarAccountDetails,
}

export default meta
type Story = StoryObj<typeof NavigationBarAccountDetails>

export const Default: Story = {
  args: {
    accountName: "Lorem ipsum account",
    accountAddress:
      "0x01cF2A3112c54821398A8544736108B8491a72dFd9d0687759037bc0792097EC",
    networkName: "Lorem ipsum network",
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

export const LongTitle: Story = {
  args: {
    ...Default.args,
    accountName: "Lorem ipsum dolor sit ipsum dolor sit amet account",
    networkName: "Lorem ipsum network",
    isLedgerConnected: true,
  },
}
