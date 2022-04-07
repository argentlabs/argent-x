import { FC } from "react"

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
            status="DEPLOYING"
            highlighted
            meta={meta}
            onClick={() => openVoyagerTransaction(hash, switcherNetworkId)}
          />
        ))}
      </TransactionsWrapper>
    </>
  )
}
