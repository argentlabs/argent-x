import { ShieldBaseFinishScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseFinishScreen"
import { ChangeGuardian } from "@argent-x/extension/src/ui/features/shield/usePendingChangingGuardian"

import type { Meta, StoryObj } from "@storybook/react"
import { accountAddressDecorators } from "../../decorators/routerDecorators"

const meta = {
  component: ShieldBaseFinishScreen,
  decorators: accountAddressDecorators,
} satisfies Meta<typeof ShieldBaseFinishScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Removed: Story = {
  args: {
    accountName: "Account 1",
    returnRoute: "/",
    liveAccountGuardianState: {
      type: ChangeGuardian.REMOVING,
      status: "SUCCESS",
      hasGuardian: false,
    },
  },
}

export const Adding: Story = {
  args: {
    accountName: "Account 1",
    returnRoute: "/",
    liveAccountGuardianState: {
      type: ChangeGuardian.ADDING,
      status: "PENDING",
      hasGuardian: false,
    },
  },
}

export const Added: Story = {
  args: {
    accountName: "Account 1",
    returnRoute: "/",
    liveAccountGuardianState: {
      type: ChangeGuardian.ADDING,
      status: "SUCCESS",
      hasGuardian: true,
    },
  },
}

export const Removing: Story = {
  args: {
    accountName: "Account 1",
    returnRoute: "/",
    liveAccountGuardianState: {
      type: ChangeGuardian.REMOVING,
      status: "PENDING",
      hasGuardian: true,
    },
  },
}
