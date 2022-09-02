import { FC } from "react"

import { Network } from "../../../shared/network"
import { Token } from "../../../shared/token/type"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useAppState } from "../../app.state"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { SectionHeader } from "../accounts/SectionHeader"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { ExplorerTransactionListItem } from "./ExplorerTransactionListItem"
import {
  TransactionListItem,
  TransactionsListWrapper,
} from "./TransactionListItem"
import { transformTransaction } from "./transform/transformTransaction"

interface IPendingTransactionsContainer {
  account: BaseWalletAccount
}

export const PendingTransactionsContainer: FC<
  IPendingTransactionsContainer
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

interface IPendingTransactions {
  pendingTransactions: Transaction[]
  network: Network
  tokensByNetwork?: Token[]
  accountAddress: string
}

export const PendingTransactions: FC<IPendingTransactions> = ({
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
      <SectionHeader>Pending transactions</SectionHeader>
      <TransactionsListWrapper>
        {pendingTransactions.map((transaction) => {
          const { hash, meta } = transaction
          const transactionTransformed = transformTransaction({
            transaction,
            accountAddress,
            tokensByNetwork,
          })
          if (transactionTransformed) {
            const { hash } = transaction
            return (
              <ExplorerTransactionListItem
                explorerTransactionTransformed={transactionTransformed}
                network={network}
                onClick={() => openVoyagerTransaction(hash, network)}
              >
                <div style={{ display: "flex" }}>
                  <TransactionStatusIndicator color={"orange"} />
                </div>
              </ExplorerTransactionListItem>
            )
          }
          return (
            <TransactionListItem
              key={hash}
              hash={hash}
              status="orange"
              highlighted
              meta={meta}
              showExternalOpenIcon
              onClick={() => openVoyagerTransaction(hash, network)}
            />
          )
        })}
      </TransactionsListWrapper>
    </>
  )
}
