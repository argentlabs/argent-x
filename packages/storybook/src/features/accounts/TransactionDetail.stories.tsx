import { Transaction } from "@argent-x/extension/src/shared/transactions"
import { TransactionDetail } from "@argent-x/extension/src/ui/features/accountActivity/TransactionDetailScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import pendingTransactions from "./__fixtures__/transactions-pending.json"

const transaction = pendingTransactions[0] as Transaction
const network = transaction.account.network

export default {
  title: "accounts/TransactionDetail",
  component: TransactionDetail,
} as ComponentMeta<typeof TransactionDetail>

const Template: ComponentStory<typeof TransactionDetail> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <TransactionDetail {...props}></TransactionDetail>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {
  transaction,
  network,
}

export const Failed = Template.bind({})
Failed.args = {
  transaction: {
    ...transaction,
    status: "REJECTED",
    failureReason: {
      code: "123",
      error_message: `Error at pc=0:12:
        Got an exception while executing a hint.
        Cairo traceback (most recent call last):
        Unknown location (pc=0:161)
        Unknown location (pc=0:147)
        
        Error in the called contract (0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25):
        Error message: nonce invalid
        Error at pc=0:1638:
        An ASSERT_EQ instruction failed: 48 != 49.
        Cairo traceback (most recent call last):
        Unknown location (pc=0:802)
        Unknown location (pc=0:655)`,
    },
  },
  network,
}
