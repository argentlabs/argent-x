import { Notification } from "@argent-x/extension/src/ui/components/Notification"
import { storybookCellStackDecorator } from "@argent/x-ui"
import { Meta, StoryObj } from "@storybook/react"

const meta: Meta<typeof Notification> = {
  component: Notification,
  decorators: [storybookCellStackDecorator],
}

export default meta
type Story = StoryObj<typeof Notification>

export const Default: Story = {
  args: {
    iconUrl: "./assets/notification-success-icon@3x.png",
    title: "Your transfer to 0x1234...abcd was successful",
  },
}
