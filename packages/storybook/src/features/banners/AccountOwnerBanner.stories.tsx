import { Meta, StoryObj } from "@storybook/react"

import { AccountOwnerBanner } from "@argent-x/extension/src/ui/features/banners/AccountOwnerBanner"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof AccountOwnerBanner> = {
  component: AccountOwnerBanner,
  decorators,
}

export default meta

type Story = StoryObj<typeof AccountOwnerBanner>

export const Default: Story = {
  args: {
    to: "/account-owner",
  },
}
