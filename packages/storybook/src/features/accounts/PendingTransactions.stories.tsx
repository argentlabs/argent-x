import { Transaction } from "@argent-x/extension/src/shared/transactions"
import { PendingTransactions } from "@argent-x/extension/src/ui/features/accountActivity/PendingTransactions"
import { CellStack } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import pendingTransactions from "./__fixtures__/transactions-pending.json"

export default {
  title: "accounts/PendingTransactions",
  component: PendingTransactions,
} as ComponentMeta<typeof PendingTransactions>

const Template: ComponentStory<typeof PendingTransactions> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <CellStack>
      <PendingTransactions {...props}></PendingTransactions>
    </CellStack>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {
  pendingTransactions: pendingTransactions as Transaction[],
  network: pendingTransactions[0].account.network,
}
