import { HeaderCell } from "@argent/ui"
import { Center, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { openBlockExplorerTransaction } from "../../services/blockExplorer.service"
import { EnrichedMultisigPendingTransaction } from "../multisig/multisigTransactions.state"
import { TransactionListItem } from "./TransactionListItem"
import { transformTransaction } from "./transform"

interface PendingTransactionsProps {
  pendingTransactions: EnrichedMultisigPendingTransaction[]
}

export const PendingMultisigTransactions: FC<PendingTransactionsProps> = ({
  pendingTransactions,
}) => {
  if (!pendingTransactions.length) {
    return null
  }

  return (
    <>
      <HeaderCell>
        <Flex alignItems={"center"} gap={1}>
          Waiting for others to confirm
        </Flex>
      </HeaderCell>
      {pendingTransactions.map((transaction) => {
        const transactionTransformed = transformTransaction({
          transaction,
          accountAddress,
          tokensByNetwork,
        })
        if (transactionTransformed) {
          const { hash } = transaction
          return (
            <TransactionListItem
              key={hash}
              txHash={hash}
              transactionTransformed={transactionTransformed}
              network={network}
              onClick={() => openBlockExplorerTransaction(hash, network)}
            />
          )
        }
        return null
      })}
    </>
  )
}
