import type { Meta, StoryObj } from "@storybook/react"

import { PromoStakingBanner } from "@argent-x/extension/src/ui/features/banners/PromoStakingBanner"
import { decorators } from "../../decorators/routerDecorators"

export default {
  component: PromoStakingBanner,
  decorators,
} as Meta<typeof PromoStakingBanner>

type Story = StoryObj<typeof PromoStakingBanner>

export const Default: Story = {
  args: {},
}
