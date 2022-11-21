import { HeaderCell } from "@argent/ui"
import { FC } from "react"

import { Network } from "../../../shared/network"
import { Token } from "../../../shared/token/type"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useAppState } from "../../app.state"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { openBlockExplorerTransaction } from "../../services/blockExplorer.service"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { TransactionListItem } from "./TransactionListItem"
import { transformTransaction } from "./transform"

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
      <HeaderCell>Pending transactions</HeaderCell>
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
            >
              <div style={{ display: "flex" }}>
                <TransactionStatusIndicator color={"orange"} />
              </div>
            </TransactionListItem>
          )
        }
        return null
      })}
    </>
  )
}
