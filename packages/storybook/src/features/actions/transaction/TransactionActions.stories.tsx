import { TransactionActions } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/TransactionActions"

import { frenslandCalls, jediswapCalls } from "./__fixtures__/calldata/generic"
import { StoryObj } from "@storybook/react"

export default {
  component: TransactionActions,
}

export const FrensLand: StoryObj<typeof TransactionActions> = {
  args: {
    action: {
      type: "INVOKE_FUNCTION",
      payload: frenslandCalls,
    },
  },
}

export const Jediswap: StoryObj<typeof TransactionActions> = {
  args: {
    action: {
      type: "INVOKE_FUNCTION",
      payload: jediswapCalls,
    },
  },
}
