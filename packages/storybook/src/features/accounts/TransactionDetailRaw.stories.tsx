import {
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc721MintAspect,
  erc721Transfer,
} from "@argent-x/extension/src/shared/call/__test__/__fixtures__/transaction-calls/goerli-alpha"
import { defaultNetwork } from "@argent-x/extension/src/shared/network"
import { Transaction } from "@argent-x/extension/src/shared/transactions"
import { TransactionDetail } from "@argent-x/extension/src/ui/features/accountActivity/TransactionDetail"
import { Account } from "@argent-x/extension/src/ui/features/accounts/Account"
import { ComponentProps } from "react"
import { Call } from "starknet"

import { account, accountAddress } from "../../account"
import { decorators } from "../../decorators/routerDecorators"
import { tokensByNetwork } from "../../tokens"
import { TransactionDetailWrapped } from "./TransactionDetailWrapped"

const network = defaultNetwork

const makeTransaction = (transactions?: Call | Call[]): Transaction => {
  return {
    account: account as unknown as Account,
    hash: "0x535aa7c68e99011c090d3a2d277005dd9fe073ab6dc354a0c5d67f12505a5fc",
    meta: {
      transactions,
    },
    status: {
      finality_status: "ACCEPTED_ON_L2",
    },
    timestamp: 1662047260,
  }
}

export default {
  component: TransactionDetail,
  decorators,
}

const Default = {
  render: (props: ComponentProps<typeof TransactionDetailWrapped>) => (
    <TransactionDetailWrapped {...props}></TransactionDetailWrapped>
  ),
}

export const Erc20Transfer = {
  ...Default,
  args: {
    transaction: makeTransaction(erc20Transfer),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Erc20Mint = {
  ...Default,
  args: {
    transaction: makeTransaction(erc20MintTestToken),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Erc721Transfer = {
  ...Default,
  args: {
    transaction: makeTransaction(erc721Transfer),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Erc20SwapAlphaRoad = {
  ...Default,
  args: {
    transaction: makeTransaction(erc20SwapAlphaRoad),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Erc20SwapJediswap = {
  ...Default,
  args: {
    transaction: makeTransaction(erc20SwapJediswap),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Erc20SwapMySwap = {
  ...Default,
  args: {
    transaction: makeTransaction(erc20SwapMySwap),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Erc721MintAspect = {
  ...Default,
  args: {
    transaction: makeTransaction(erc721MintAspect),
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const Failed = {
  ...Default,
  args: {
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
  },
}

export const Reverted = {
  ...Default,
  args: {
    transaction: {
      ...makeTransaction(erc20Transfer),
      status: "REVERTED",
      revertReason:
        'Error in the called contract (0x03b1b7a7ae9a136a327b01b89ddfee24a474c74bf76032876b5754e44cd7040b):\nError at pc=0:32:\nGot an exception while executing a hint: Custom Hint Error: Requested contract address ContractAddress(PatriciaKey(StarkFelt("0x0000000000000000000000000000000000000000000000000000000000000042"))) is not deployed.\nCairo traceback (most recent call last):\nUnknown location (pc=0:557)\nUnknown location (pc=0:519)\nUnknown location (pc=0:625)\n',
    },
    accountAddress,
    network,
    tokensByNetwork,
  },
}

export const EmptyCallData = {
  ...Default,
  args: {
    transaction: makeTransaction(),
    accountAddress,
    network,
    tokensByNetwork,
  },
}
