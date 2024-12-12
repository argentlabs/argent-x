import { Meta, StoryObj } from "@storybook/react"

import { AccountDeprecatedBanner } from "@argent-x/extension/src/ui/features/banners/AccountDeprecatedBanner"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof AccountDeprecatedBanner> = {
  component: AccountDeprecatedBanner,
  decorators,
}

export default meta

type Story = StoryObj<typeof AccountDeprecatedBanner>

export const Default: Story = {
  args: {
    to: "/account-deprecated",
  },
}
