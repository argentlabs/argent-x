import type { Meta, StoryObj } from "@storybook/react"

import { SaveRecoverySeedphraseBanner } from "@argent-x/extension/src/ui/features/banners/SaveRecoverySeedphraseBanner"
import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SaveRecoverySeedphraseBanner,
  decorators,
} as Meta<typeof SaveRecoverySeedphraseBanner>

type Story = StoryObj<typeof SaveRecoverySeedphraseBanner>

export const Default: Story = {
  args: {},
}
