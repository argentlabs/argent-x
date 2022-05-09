import { FC } from "react"

import { SectionHeader } from "../../components/Account/SectionHeader"
import { useAccountTransactions } from "../../states/accountTransactions"
import { useAppState } from "../../states/app"
import { openVoyagerTransaction } from "../../utils/voyager.service"
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
            onClick={() => openVoyagerTransaction(hash, network)}
          />
        ))}
      </TransactionsWrapper>
    </>
  )
}
