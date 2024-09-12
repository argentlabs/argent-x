import { HeaderCell } from "@argent/x-ui"
import { FC, Fragment } from "react"
import { useNavigate } from "react-router-dom"

import { IExplorerTransaction } from "../../../shared/explorer/type"

import { ErrorBoundary } from "../../components/ErrorBoundary"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { routes } from "../../../shared/ui/routes"
import { TransactionListErrorItem } from "./TransactionListErrorItem"
import { TransactionListItem } from "./TransactionListItem"
import {
  transformExplorerTransaction,
  transformTransaction,
} from "../../../shared/activity/utils/transform"
import {
  isActivityTransaction,
  isExplorerTransaction,
} from "../../../shared/activity/utils/transform/is"
import { LoadMoreTrigger } from "./ui/LoadMoreTrigger"
import { ActivityTransaction } from "../../../shared/activity/utils/transform/type"
import { Token } from "../../../shared/token/__new/types/token.model"
import { WalletAccount } from "../../../shared/wallet.model"

interface AccountActivityBaseProps {
  account: WalletAccount
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
  loadMoreHashes: string[]
  onLoadMore: () => void
}

interface AccountActivityProps extends AccountActivityBaseProps {
  activity: Record<string, Array<ActivityTransaction | IExplorerTransaction>>
}

interface AccountActivityItemProps extends AccountActivityBaseProps {
  transaction: ActivityTransaction | IExplorerTransaction
}

export const AccountActivity: FC<AccountActivityProps> = ({
  activity,
  ...rest
}) => {
  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <HeaderCell>{dateLabel}</HeaderCell>
          {transactions.map((transaction) => {
            const key = isActivityTransaction(transaction)
              ? transaction.hash
              : transaction.transactionHash
            return (
              <ErrorBoundary key={key} fallback={<TransactionListErrorItem />}>
                <AccountActivityItem transaction={transaction} {...rest} />
              </ErrorBoundary>
            )
          })}
        </Fragment>
      ))}
    </>
  )
}

const AccountActivityItem: FC<AccountActivityItemProps> = ({
  account,
  tokensByNetwork,
  nftContractAddresses,
  loadMoreHashes = [],
  onLoadMore,
  transaction,
}) => {
  const navigate = useNavigate()

  if (isActivityTransaction(transaction)) {
    const { hash, failureReason } = transaction
    const transactionTransformed = transformTransaction({
      transaction,
      accountAddress: account.address,
      tokensByNetwork,
      nftContractAddresses,
    })

    if (transactionTransformed) {
      return (
        <TransactionListItem
          txHash={hash}
          transactionTransformed={transactionTransformed}
          network={account.network}
          onClick={() => navigate(routes.transactionDetail(hash))}
          failureReason={failureReason}
        >
          {failureReason ? (
            <div style={{ display: "flex" }}>
              <TransactionStatusIndicator
                status={"red"}
                label={failureReason}
              />
            </div>
          ) : null}
        </TransactionListItem>
      )
    }
  } else if (isExplorerTransaction(transaction)) {
    const explorerTransactionTransformed =
      transaction &&
      transformExplorerTransaction({
        explorerTransaction: transaction,
        accountAddress: account.address,
        tokensByNetwork,
        nftContractAddresses,
      })
    if (explorerTransactionTransformed) {
      const { transactionHash } = transaction
      const loadMore = loadMoreHashes.includes(transactionHash)
      return (
        <>
          <TransactionListItem
            txHash={transactionHash}
            transactionTransformed={explorerTransactionTransformed}
            network={account.network}
            onClick={() => navigate(routes.transactionDetail(transactionHash))}
            failureReason={transaction.failureReason}
          />
          {loadMore && <LoadMoreTrigger onLoadMore={onLoadMore} mt={-2} />}
        </>
      )
    }
  }
  return <TransactionListErrorItem />
}
