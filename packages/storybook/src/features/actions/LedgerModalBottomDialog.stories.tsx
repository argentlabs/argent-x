import {
  LedgerModalBottomDialog,
  LedgerModalBottomDialogState,
} from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ledger/LedgerModalBottomDialog"

import { decorators } from "../../decorators/routerDecorators"
import { Meta, StoryObj } from "@storybook/react"

const meta = {
  component: LedgerModalBottomDialog,
  decorators,
} satisfies Meta<typeof LedgerModalBottomDialog>

export default meta
type Story = StoryObj<typeof meta>

const Default = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
}

export const Confirm: Story = {
  args: {
    ...Default.args,
    state: LedgerModalBottomDialogState.CONFIRM,
  },
}

export const NotConnected: Story = {
  args: {
    ...Default.args,
    state: LedgerModalBottomDialogState.NOT_CONNECTED,
  },
}

export const ErrorUnknown: Story = {
  args: {
    ...Default.args,
    state: LedgerModalBottomDialogState.ERROR_UNKNOWN,
  },
}

export const ErrorPending: Story = {
  args: {
    ...Default.args,
    state: LedgerModalBottomDialogState.ERROR_PENDING,
  },
}

export const ErrorRejected: Story = {
  args: {
    ...Default.args,
    state: LedgerModalBottomDialogState.ERROR_REJECTED,
  },
}

export const Error: Story = {
  args: {
    ...Default.args,
    state: LedgerModalBottomDialogState.ERROR,
    errorMessage: "Lorem ipsum dolor sit amet",
  },
}
