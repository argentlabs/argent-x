import { FC } from "react"

import { getNetwork } from "../../../shared/networks"
import { useAccountTransactions } from "../../states/accountTransactions"
import { useAppState } from "../../states/app"
import { SectionHeader } from "./SectionHeader"
import { TransactionItem, TransactionsWrapper } from "./Transactions"

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
            txHash={hash}
            meta={meta}
            onClick={() => {
              const { explorerUrl } = getNetwork(switcherNetworkId)
              window.open(`${explorerUrl}/tx/${hash}`, "_blank")?.focus()
            }}
          />
        ))}
      </TransactionsWrapper>
    </>
  )
}
