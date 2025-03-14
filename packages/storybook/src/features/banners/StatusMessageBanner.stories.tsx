import type { Meta, StoryObj } from "@storybook/react"

import { StatusMessageBanner } from "@argent-x/extension/src/ui/features/banners/StatusMessageBanner"

import { statusMessages } from "./__fixtures__/statusMesages"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof StatusMessageBanner> = {
  component: StatusMessageBanner,
  decorators,
}

export default meta

type Story = StoryObj<typeof StatusMessageBanner>

export const Danger: Story = {
  args: {
    statusMessage: statusMessages.danger,
  },
}

export const Warning: Story = {
  args: {
    statusMessage: statusMessages.warning,
  },
}

export const Info: Story = {
  args: {
    statusMessage: statusMessages.info,
  },
}

export const Upgrade: Story = {
  args: {
    statusMessage: statusMessages.upgrade,
  },
}

export const Null: Story = {
  args: {
    statusMessage: statusMessages.null,
  },
}
