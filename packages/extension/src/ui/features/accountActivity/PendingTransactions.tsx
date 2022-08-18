import { FC } from "react"

import { Network } from "../../../shared/network"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { SectionHeader } from "../accounts/SectionHeader"
import { useCurrentNetwork } from "../networks/useNetworks"
import {
  TransactionListItem,
  TransactionsListWrapper,
} from "./TransactionListItem"

interface IPendingTransactionsContainer {
  account: BaseWalletAccount
}

export const PendingTransactionsContainer: FC<
  IPendingTransactionsContainer
> = ({ account }) => {
  const network = useCurrentNetwork()
  const { pendingTransactions } = useAccountTransactions(account)
  return (
    <PendingTransactions
      pendingTransactions={pendingTransactions}
      network={network}
    />
  )
}

interface IPendingTransactions {
  pendingTransactions: Transaction[]
  network: Network
}

export const PendingTransactions: FC<IPendingTransactions> = ({
  pendingTransactions,
  network,
}) => {
  if (!pendingTransactions.length) {
    return null
  }

  return (
    <>
      <SectionHeader>Pending transactions</SectionHeader>
      <TransactionsListWrapper>
        {pendingTransactions.map(({ hash, meta }) => (
          <TransactionListItem
            key={hash}
            hash={hash}
            status="orange"
            highlighted
            meta={meta}
            showExternalOpenIcon
            onClick={() => openVoyagerTransaction(hash, network)}
          />
        ))}
      </TransactionsListWrapper>
    </>
  )
}
