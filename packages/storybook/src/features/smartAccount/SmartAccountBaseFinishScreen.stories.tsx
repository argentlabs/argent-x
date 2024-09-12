import { SmartAccountBaseFinishScreen } from "@argent-x/extension/src/ui/features/smartAccount/SmartAccountBaseFinishScreen"

import type { Meta, StoryObj } from "@storybook/react"
import { accountAddressDecorators } from "../../decorators/routerDecorators"
import { ChangeGuardian } from "@argent-x/extension/src/shared/smartAccount/changeGuardianCallDataToType"

const meta = {
  component: SmartAccountBaseFinishScreen,
  decorators: accountAddressDecorators,
} satisfies Meta<typeof SmartAccountBaseFinishScreen>

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
