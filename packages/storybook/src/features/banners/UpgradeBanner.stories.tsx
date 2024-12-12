import { Meta, StoryObj } from "@storybook/react"

import { UpgradeBanner } from "@argent-x/extension/src/ui/features/banners/UpgradeBanner"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof UpgradeBanner> = {
  component: UpgradeBanner,
  decorators,
}

export default meta

type Story = StoryObj<typeof UpgradeBanner>

export const Default: Story = {
  args: {
    learnMoreLink: "https://www.argent.xyz/learn-more",
  },
}

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
}
