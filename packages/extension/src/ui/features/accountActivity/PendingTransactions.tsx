import { HeaderCell } from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { Network } from "../../../shared/network"
import { Transaction } from "../../../shared/transactions"
import { openBlockExplorerTransaction } from "../../services/blockExplorer.service"
import { TransactionListItem } from "./TransactionListItem"
import { transformTransaction } from "../../../shared/activity/utils/transform"
import { Token } from "../../../shared/token/__new/types/token.model"

interface PendingTransactionsProps {
  pendingTransactions: Transaction[]
  network: Network
  tokensByNetwork?: Token[]
  accountAddress: string
}

export const PendingTransactions: FC<PendingTransactionsProps> = ({
  pendingTransactions,
  network,
  tokensByNetwork,
  accountAddress,
}) => {
  if (!pendingTransactions.length) {
    return null
  }

  return (
    <>
      <HeaderCell>
        <Flex alignItems={"center"} gap={1}>
          Pending transactions
          <Center
            color={"neutrals.900"}
            backgroundColor={"skyBlue.500"}
            rounded={"full"}
            height={4}
            minWidth={4}
            fontWeight={"extrabold"}
            fontSize={"2xs"}
            px={0.5}
          >
            {pendingTransactions.length}
          </Center>
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
