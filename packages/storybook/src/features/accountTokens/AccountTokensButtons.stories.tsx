import type { Meta, StoryObj } from "@storybook/react"
import { AccountTokensButtons } from "@argent-x/extension/src/ui/features/accountTokens/AccountTokensButtons"

const meta = {
  component: AccountTokensButtons,
} satisfies Meta<typeof AccountTokensButtons>

export default meta

type Story = StoryObj<typeof AccountTokensButtons>

export const Default: Story = {
  args: {
    showAddFundsButton: true,
    showSendButton: true,
    showHideMultisigButton: false,
    isHideMultisigModalOpen: false,
    portfolioUrl: "https://example.com/portfolio",
    showSwapButton: true,
  },
}

export const WithoutPortfolio: Story = {
  args: {
    ...Default.args,
    portfolioUrl: null,
  },
}

export const WithHideMultisig: Story = {
  args: {
    ...Default.args,
    showHideMultisigButton: true,
  },
}

export const HideMultisigModalOpen: Story = {
  args: {
    ...WithHideMultisig.args,
    isHideMultisigModalOpen: true,
  },
}

export const NoButtons: Story = {
  args: {
    showAddFundsButton: false,
    showSendButton: false,
    showHideMultisigButton: false,
    isHideMultisigModalOpen: false,
    portfolioUrl: null,
  },
}
