import { FC } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { SectionHeader } from "../accounts/SectionHeader"
import { useCurrentNetwork } from "../networks/useNetworks"
import { TransactionItem, TransactionsWrapper } from "./TransactionItem"

interface PendingTransactionsProps {
  account: BaseWalletAccount
}

export const PendingTransactions: FC<PendingTransactionsProps> = ({
  account,
}) => {
  const network = useCurrentNetwork()
  const { pendingTransactions } = useAccountTransactions(account)

  if (!pendingTransactions.length) {
    return <></>
  }

  return (
    <>
      <SectionHeader>Pending transactions</SectionHeader>
      <TransactionsWrapper>
        {pendingTransactions.map(({ hash, meta }) => (
          <TransactionItem
            key={hash}
            hash={hash}
            status="orange"
            highlighted
            meta={meta}
            showExternalOpenIcon
            onClick={() => openVoyagerTransaction(hash, network)}
          />
        ))}
      </TransactionsWrapper>
    </>
  )
}
