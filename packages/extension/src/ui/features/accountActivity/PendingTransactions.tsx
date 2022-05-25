import { FC } from "react"

import { useAppState } from "../../app.state"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { SectionHeader } from "../accounts/SectionHeader"
import { useNetwork } from "../networks/useNetworks"
import { TransactionItem, TransactionsWrapper } from "./TransactionItem"

interface PendingTransactionsProps {
  accountAddress: string
}

export const PendingTransactions: FC<PendingTransactionsProps> = ({
  accountAddress,
}) => {
  const { switcherNetworkId } = useAppState()
  const { network } = useNetwork(switcherNetworkId)
  const { pendingTransactions } = useAccountTransactions(accountAddress)

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
