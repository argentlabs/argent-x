import { FC, Fragment, Suspense, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Token } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { formatDate, formatDateTime } from "../../services/dates"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { SectionHeader } from "../accounts/SectionHeader"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { ExplorerTransactionListItem } from "./ExplorerTransactionListItem"
import { PendingTransactionsContainer } from "./PendingTransactions"
import {
  TransactionListItem,
  TransactionsListWrapper,
} from "./TransactionListItem"
import {
  isActivityTransaction,
  isExplorerTransaction,
  isVoyagerTransaction,
} from "./transform/is"
import { transformExplorerTransaction } from "./transform/transformExplorerTransaction"
import { LoadMoreTrigger } from "./ui/LoadMoreTrigger"
import { ActivityTransaction } from "./useActivity"
import { useArgentExplorerAccountTransactionsInfinite } from "./useArgentExplorer"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  margin-bottom: 68px;
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin-bottom: 25px;
  text-align: center;
`

interface IAccountActivity {
  account: Account
  tokensByNetwork?: Token[]
  activity: Record<string, Array<ActivityTransaction | IExplorerTransaction>>
  loadMoreHashes: string[]
  onLoadMore: () => void
}

export const AccountActivity: FC<IAccountActivity> = ({
  account,
  tokensByNetwork,
  activity,
  loadMoreHashes = [],
  onLoadMore,
}) => {
  const navigate = useNavigate()
  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <SectionHeader>{dateLabel}</SectionHeader>
          <TransactionsListWrapper>
            {transactions.map((transaction) => {
              if (isActivityTransaction(transaction)) {
                const { hash, date, meta, isRejected } = transaction
                return (
                  <TransactionListItem
                    key={hash}
                    hash={hash}
                    status={isRejected ? "red" : undefined}
                    meta={{ subTitle: formatDateTime(date), ...meta }}
                    onClick={() => navigate(routes.transactionDetail(hash))}
                  />
                )
              } else if (isExplorerTransaction(transaction)) {
                const explorerTransactionTransformed =
                  transaction &&
                  transformExplorerTransaction({
                    explorerTransaction: transaction,
                    accountAddress: account.address,
                    tokensByNetwork,
                  })
                if (explorerTransactionTransformed) {
                  const { transactionHash } = transaction
                  const loadMore = loadMoreHashes.includes(transactionHash)
                  return (
                    <Fragment key={transactionHash}>
                      <ExplorerTransactionListItem
                        explorerTransaction={transaction}
                        explorerTransactionTransformed={
                          explorerTransactionTransformed
                        }
                        network={account.network}
                        onClick={() =>
                          navigate(routes.transactionDetail(transactionHash))
                        }
                      />
                      {loadMore && <LoadMoreTrigger onLoadMore={onLoadMore} />}
                    </Fragment>
                  )
                }
              } else {
                return null
              }
            })}
          </TransactionsListWrapper>
        </Fragment>
      ))}
    </>
  )
}

interface IAccountActivityContainer {
  account: Account
}

const PAGE_SIZE = 10

export const AccountActivityContainer: FC<IAccountActivityContainer> = ({
  account,
}) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const { data, setSize } = useArgentExplorerAccountTransactionsInfinite({
    accountAddress: account.address,
    pageSize: PAGE_SIZE,
  })

  const explorerTransactions = useMemo(() => {
    if (!data) {
      return
    }
    return data.flat()
  }, [data])

  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)

  const { transactions } = useAccountTransactions(account)
  const voyagerTransactions = useMemo(() => {
    // RECEIVED transactions are already shown as pending
    return transactions.filter(
      (transaction) => transaction.status !== "RECEIVED",
    )
  }, [transactions])
  console.log(JSON.stringify(transactions, null, 2))
  const mergedTransactions = useMemo(() => {
    if (!explorerTransactions) {
      return {
        transactions: voyagerTransactions,
      }
    }
    const matchedHashes: string[] = []

    const mergedTransactions = voyagerTransactions.map((voyagerTransaction) => {
      const explorerTransaction = explorerTransactions.find(
        (explorerTransaction) =>
          explorerTransaction.transactionHash === voyagerTransaction.hash,
      )
      if (explorerTransaction) {
        if (!explorerTransaction.timestamp) {
          explorerTransaction.timestamp = voyagerTransaction.timestamp
        }
        matchedHashes.push(voyagerTransaction.hash)
        return explorerTransaction
      }
      return voyagerTransaction
    })

    const unmatchedExplorerTransactions = explorerTransactions.filter(
      (explorerTransaction) =>
        !matchedHashes.includes(explorerTransaction.transactionHash),
    )

    const transactionsWithoutTimestamp = []
    for (const transaction of unmatchedExplorerTransactions) {
      if (transaction.timestamp) {
        mergedTransactions.push(transaction)
      } else {
        transactionsWithoutTimestamp.push(transaction)
      }
    }

    const sortedTransactions = mergedTransactions.sort(
      (a, b) => b.timestamp - a.timestamp,
    )

    return {
      transactions: sortedTransactions,
      transactionsWithoutTimestamp,
    }
  }, [explorerTransactions, voyagerTransactions])

  const { mergedActivity, loadMoreHashes } = useMemo(() => {
    const mergedActivity: Record<
      string,
      Array<ActivityTransaction | IExplorerTransaction>
    > = {}
    const { transactions, transactionsWithoutTimestamp } = mergedTransactions
    let lastExplorerTransactionHash
    for (const transaction of transactions) {
      const date = new Date(transaction.timestamp * 1000).toISOString()
      const dateLabel = formatDate(date)
      mergedActivity[dateLabel] ||= []
      if (isVoyagerTransaction(transaction)) {
        const { hash, meta, status } = transaction
        const isRejected = status === "REJECTED"
        const activityTransaction: ActivityTransaction = {
          hash,
          date,
          meta,
          isRejected,
        }
        mergedActivity[dateLabel].push(activityTransaction)
      } else {
        mergedActivity[dateLabel].push(transaction)
        lastExplorerTransactionHash = transaction.transactionHash
      }
    }

    const loadMoreHashes = []

    if (lastExplorerTransactionHash) {
      loadMoreHashes.push(lastExplorerTransactionHash)
    }

    if (transactionsWithoutTimestamp && transactionsWithoutTimestamp.length) {
      mergedActivity["Unknown date"] = transactionsWithoutTimestamp
      loadMoreHashes.push(
        transactionsWithoutTimestamp[transactionsWithoutTimestamp.length - 1]
          .transactionHash,
      )
    }
    return {
      mergedActivity,
      loadMoreHashes,
    }
  }, [mergedTransactions])

  const onLoadMore = useCallback(() => {
    if (!isReachingEnd) {
      setSize((size) => size + 1)
    }
  }, [isReachingEnd, setSize])

  return (
    <Container>
      <Header>Activity</Header>
      <PendingTransactionsContainer account={account} />
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallback title="Seems like Voyager API is down..." />
        }
      >
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <AccountActivity
            activity={mergedActivity}
            loadMoreHashes={loadMoreHashes}
            account={account}
            tokensByNetwork={tokensByNetwork}
            onLoadMore={onLoadMore}
          />
        </Suspense>
      </ErrorBoundary>
    </Container>
  )
}
