import { FC, Fragment, Suspense, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Token } from "../../../shared/token/type"
import { Transaction } from "../../../shared/transactions"
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
import { transformExplorerTransaction } from "./transform/transformExplorerTransaction"
import { ActivityTransaction } from "./useActivity"
import { useArgentExplorerAccountTransactions } from "./useArgentExplorer"

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
}

export const isActivityTransaction = (
  transaction: any,
): transaction is ActivityTransaction => {
  return !!(transaction.hash && transaction.date)
}

export const isVoyagerTransaction = (
  transaction: any,
): transaction is Transaction => {
  return !!(
    transaction.hash &&
    transaction.timestamp &&
    transaction.account &&
    transaction.status
  )
}

export const isExplorerTransaction = (
  transaction: any,
): transaction is IExplorerTransaction => {
  return !!(!isVoyagerTransaction(transaction) && transaction.transactionHash)
}

export const AccountActivity: FC<IAccountActivity> = ({
  account,
  tokensByNetwork,
  activity,
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
                  return (
                    <ExplorerTransactionListItem
                      key={transaction.transactionHash}
                      explorerTransaction={transaction}
                      explorerTransactionTransformed={
                        explorerTransactionTransformed
                      }
                      network={account.network}
                      onClick={() =>
                        navigate(
                          routes.transactionDetail(transaction.transactionHash),
                        )
                      }
                    />
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

export const AccountActivityContainer: FC<IAccountActivityContainer> = ({
  account,
}) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const { data: explorerTransactions } = useArgentExplorerAccountTransactions({
    accountAddress: account.address,
  })
  const { transactions } = useAccountTransactions(account)
  const voyagerTransactions = useMemo(() => {
    // RECEIVED transactions are already shown as pending
    return transactions.filter(
      (transaction) => transaction.status !== "RECEIVED",
    )
  }, [transactions])
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

  const mergedActivity = useMemo(() => {
    const mergedActivity: Record<
      string,
      Array<ActivityTransaction | IExplorerTransaction>
    > = {}
    const { transactions, transactionsWithoutTimestamp } = mergedTransactions
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
      }
    }
    if (transactionsWithoutTimestamp && transactionsWithoutTimestamp.length) {
      mergedActivity["Unknown date"] = transactionsWithoutTimestamp
    }
    return mergedActivity
  }, [mergedTransactions])

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
            account={account}
            tokensByNetwork={tokensByNetwork}
          />
        </Suspense>
      </ErrorBoundary>
    </Container>
  )
}
