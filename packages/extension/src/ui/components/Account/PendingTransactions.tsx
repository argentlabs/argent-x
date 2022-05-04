import { FC } from "react"

import { useNetwork } from "../../hooks/useNetworks"
import { useAccountTransactions } from "../../states/accountTransactions"
import { useAppState } from "../../states/app"
import { openVoyagerTransaction } from "../../utils/voyager.service"
import { SectionHeader } from "./SectionHeader"
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
            onClick={() => openVoyagerTransaction(hash, network)}
          />
        ))}
      </TransactionsWrapper>
    </>
  )
}
