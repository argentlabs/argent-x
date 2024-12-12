import { Meta, StoryObj } from "@storybook/react"
import { AccountTokensButtonsSkeleton } from "@argent-x/extension/src/ui/features/accountTokens/AccountTokensButtons"

const meta = {
  component: AccountTokensButtonsSkeleton,
} satisfies Meta<typeof AccountTokensButtonsSkeleton>

export default meta

type Story = StoryObj<typeof AccountTokensButtonsSkeleton>

export const Default: Story = {}
