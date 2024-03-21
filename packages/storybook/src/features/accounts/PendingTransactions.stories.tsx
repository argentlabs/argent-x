import { Transaction } from "@argent-x/extension/src/shared/transactions"
import { PendingTransactions } from "@argent-x/extension/src/ui/features/accountActivity/PendingTransactions"
import { CellStack } from "@argent/x-ui"
import { ComponentProps } from "react"

import pendingTransactions from "./__fixtures__/transactions-pending.json"

export default {
  component: PendingTransactions,
}

export const Default = {
  render: (props: ComponentProps<typeof PendingTransactions>) => (
    <CellStack>
      <PendingTransactions {...props}></PendingTransactions>
    </CellStack>
  ),
  args: {
    pendingTransactions: pendingTransactions as Transaction[],
    network: pendingTransactions[0].account.network,
  },
}
