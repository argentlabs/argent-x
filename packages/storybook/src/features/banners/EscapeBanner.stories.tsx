import { Meta, StoryObj } from "@storybook/react"

import {
  ESCAPE_TYPE_GUARDIAN,
  ESCAPE_TYPE_SIGNER,
} from "@argent-x/extension/src/shared/account/details/escape.model"
import { EscapeBanner } from "@argent-x/extension/src/ui/features/banners/EscapeBanner"
import { LiveAccountEscapeProps } from "@argent-x/extension/src/ui/features/smartAccount/escape/useAccountEscape"
import { getActiveFromNow } from "@argent-x/extension/src/shared/utils/getActiveFromNow"
import { PendingChangeGuardian as PendingChangeGuardianType } from "@argent-x/extension/src/ui/features/smartAccount/usePendingChangingGuardian"
import { decorators } from "../../decorators/routerDecorators"
import { accounts } from "@argent-x/extension/src/ui/features/actions/__fixtures__"

export default {
  component: EscapeBanner,
  decorators,
} as Meta<typeof EscapeBanner>

type Story = StoryObj<typeof EscapeBanner>

const activeAtNow = new Date().getTime() / 1000

const activeAt5d = activeAtNow + 24 * 60 * 60 * 5

const account = accounts[0]

export const PendingEscape: Story = {
  args: {
    account,
    pending: true,
  },
}

export const PendingChangeGuardian: Story = {
  args: {
    account,
    pendingChangeGuardian: {} as PendingChangeGuardianType,
  },
}

export const EscapeGuardian: Story = {
  args: {
    account,
    liveAccountEscape: {
      activeAt: activeAt5d,
      type: ESCAPE_TYPE_GUARDIAN,
      ...getActiveFromNow(activeAt5d),
    } as LiveAccountEscapeProps,
  },
}

export const EscapeGuardian1: Story = {
  args: {
    account,
    liveAccountEscape: {
      activeFromNowMs: 0,
    } as LiveAccountEscapeProps,
  },
}

export const EscapeGuardian2: Story = {
  args: {
    account,
    liveAccountEscape: {
      activeFromNowMs: 0,
    } as LiveAccountEscapeProps,
    accountGuardianIsSelf: true,
  },
}

export const EscapeGuardianComplete: Story = {
  args: {
    account,
    liveAccountEscape: {
      type: ESCAPE_TYPE_GUARDIAN,
    } as LiveAccountEscapeProps,
  },
}

export const EscapeSigner: Story = {
  args: {
    account,
    liveAccountEscape: {
      activeAt: activeAt5d,
      type: ESCAPE_TYPE_SIGNER,
      ...getActiveFromNow(activeAt5d),
    } as LiveAccountEscapeProps,
  },
}

export const EscapeSignerComplete: Story = {
  args: {
    account,
    liveAccountEscape: {
      type: ESCAPE_TYPE_SIGNER,
    } as LiveAccountEscapeProps,
  },
}
