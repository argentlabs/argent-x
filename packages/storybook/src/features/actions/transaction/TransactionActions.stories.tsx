import { TransactionActions } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/TransactionActions"

import { frenslandCalls, jediswapCalls } from "./__fixtures__/calldata/generic"

export default {
  component: TransactionActions,
}

export const FrensLand = {
  args: {
    transactions: frenslandCalls,
  },
}

export const Jediswap = {
  args: {
    transactions: jediswapCalls,
  },
}
