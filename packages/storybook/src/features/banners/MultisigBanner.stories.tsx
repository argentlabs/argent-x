import type { Meta, StoryObj } from "@storybook/react"

import { MultisigBanner } from "@argent-x/extension/src/ui/features/banners/MultisigBanner"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof MultisigBanner> = {
  component: MultisigBanner,
  decorators,
}

export default meta

type Story = StoryObj<typeof MultisigBanner>

export const Activate: Story = {
  args: {
    showActivateMultisigBanner: true,
    onActivateMultisig: () => {},
  },
}

export const Deploying: Story = {
  args: {
    showActivateMultisigBanner: false,
    isMultisigDeploying: true,
  },
}
