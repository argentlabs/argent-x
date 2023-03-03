import { defaultNetwork } from "@argent-x/extension/src/shared/network"
import { Transaction } from "@argent-x/extension/src/shared/transactions"
import { TransactionDetail } from "@argent-x/extension/src/ui/features/accountActivity/TransactionDetail"
import {
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc721MintAspect,
  erc721Transfer,
} from "@argent-x/extension/src/ui/features/accountActivity/transform/transaction/__test__/__fixtures__/transaction-calls/goerli-alpha"
import { Account } from "@argent-x/extension/src/ui/features/accounts/Account"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { Call } from "starknet"

import { account, accountAddress } from "../../account"
import { tokensByNetwork } from "../../tokensByNetwork"
import { TransactionDetailWrapped } from "./TransactionDetailWrapped"

const network = defaultNetwork

const makeTransaction = (transactions?: Call | Call[]): Transaction => {
  return {
    account: account as Account,
    hash: "0x535aa7c68e99011c090d3a2d277005dd9fe073ab6dc354a0c5d67f12505a5fc",
    meta: {
      transactions,
    },
    status: "ACCEPTED_ON_L2",
    timestamp: 1662047260,
  }
}

export default {
  title: "accounts/TransactionDetail (Raw)",
  component: TransactionDetail,
} as ComponentMeta<typeof TransactionDetail>

const Template: ComponentStory<typeof TransactionDetailWrapped> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <TransactionDetailWrapped {...props}></TransactionDetailWrapped>
  </MemoryRouter>
)

export const Erc20Transfer = Template.bind({})
Erc20Transfer.args = {
  transaction: makeTransaction(erc20Transfer),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Erc20Mint = Template.bind({})
Erc20Mint.args = {
  transaction: makeTransaction(erc20MintTestToken),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Erc721Transfer = Template.bind({})
Erc721Transfer.args = {
  transaction: makeTransaction(erc721Transfer),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Erc20SwapAlphaRoad = Template.bind({})
Erc20SwapAlphaRoad.args = {
  transaction: makeTransaction(erc20SwapAlphaRoad),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Erc20SwapJediswap = Template.bind({})
Erc20SwapJediswap.args = {
  transaction: makeTransaction(erc20SwapJediswap),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Erc20SwapMySwap = Template.bind({})
Erc20SwapMySwap.args = {
  transaction: makeTransaction(erc20SwapMySwap),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Erc721MintAspect = Template.bind({})
Erc721MintAspect.args = {
  transaction: makeTransaction(erc721MintAspect),
  accountAddress,
  network,
  tokensByNetwork,
}

export const Failed = Template.bind({})
Failed.args = {
  transaction: {
    ...makeTransaction(erc20Transfer),
    status: "REJECTED",
    failureReason: {
      code: "123",
      error_message: `Error at pc=0:12:
Got an exception while executing a hint.
Cairo traceback (most recent call last):
Unknown location (pc=0:161)
Unknown location (pc=0:147)

Error in the called contract (0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a):
Error message: nonce invalid
Error at pc=0:1638:
An ASSERT_EQ instruction failed: 48 != 49.
Cairo traceback (most recent call last):
Unknown location (pc=0:802)
Unknown location (pc=0:655)`,
    },
  },
  accountAddress,
  network,
  tokensByNetwork,
}

export const EmptyCallData = Template.bind({})
EmptyCallData.args = {
  transaction: makeTransaction(),
  accountAddress,
  network,
  tokensByNetwork,
}
