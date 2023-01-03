import { HeaderCell } from "@argent/ui"
import { Center, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { Network } from "../../../shared/network"
import { Token } from "../../../shared/token/type"
import { useTokensInNetwork } from "../../../shared/tokens.state"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useAppState } from "../../app.state"
import { openBlockExplorerTransaction } from "../../services/blockExplorer.service"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { TransactionListItem } from "./TransactionListItem"
import { transformTransaction } from "./transform"

interface PendingTransactionsContainerProps {
  account: BaseWalletAccount
}

export const PendingTransactionsContainer: FC<
  PendingTransactionsContainerProps
> = ({ account }) => {
  const network = useCurrentNetwork()
  const { pendingTransactions } = useAccountTransactions(account)
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  return (
    <PendingTransactions
      pendingTransactions={pendingTransactions}
      network={network}
      tokensByNetwork={tokensByNetwork}
      accountAddress={account.address}
    />
  )
}

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
