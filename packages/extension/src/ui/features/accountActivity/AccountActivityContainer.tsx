import { CellStack, H4, SpacerCell } from "@argent/ui"
import { Center, Skeleton } from "@chakra-ui/react"
import { get } from "lodash-es"
import { FC, Suspense, useCallback, useMemo } from "react"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { formatDate } from "../../services/dates"
import { useAspectContractAddresses } from "../accountNfts/aspect.service"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { AccountActivity } from "./AccountActivity"
import { PendingTransactionsContainer } from "./PendingTransactions"
import { isVoyagerTransaction } from "./transform/is"
import { ActivityTransaction } from "./useActivity"
import { useArgentExplorerAccountTransactionsInfinite } from "./useArgentExplorer"

export interface AccountActivityContainerProps {
  account: Account
}

const PAGE_SIZE = 10

export const AccountActivityContainer: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  return (
    <CellStack>
      <Center>
        <H4>Activity</H4>
      </Center>
      <PendingTransactionsContainer account={account} />
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallback title="Seems like Voyager API is down..." />
        }
      >
        <Suspense
          fallback={
            <>
              <SpacerCell />
              <Skeleton height="16" rounded={"xl"} />
              <Skeleton height="16" rounded={"xl"} />
              <Skeleton height="16" rounded={"xl"} />
            </>
          }
        >
          <AccountActivityLoader account={account} />
        </Suspense>
      </ErrorBoundary>
    </CellStack>
  )
}

export const AccountActivityLoader: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const { data: nftContractAddresses } = useAspectContractAddresses()
  const { data, setSize } = useArgentExplorerAccountTransactionsInfinite(
    {
      accountAddress: account.address,
      network: switcherNetworkId,
      pageSize: PAGE_SIZE,
    },
    {
      suspense: true,
    },
  )

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
      (transaction) =>
        transaction.status !== "RECEIVED" && !transaction.meta?.isDeployAccount,
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

      // TODO: remove this when after backend update
      const isUdcTransaction =
        get(voyagerTransaction, "meta.transactions.entrypoint") ===
          "deployContract" ||
        get(voyagerTransaction, "meta.transactions.entrypoint") ===
          "declareContract"

      if (!isUdcTransaction && explorerTransaction) {
        if (!explorerTransaction.timestamp) {
          explorerTransaction.timestamp = voyagerTransaction.timestamp
        }
        matchedHashes.push(voyagerTransaction.hash)
        return explorerTransaction
      }
      if (isUdcTransaction) {
        matchedHashes.push(voyagerTransaction.hash)
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
    <AccountActivity
      activity={mergedActivity}
      loadMoreHashes={loadMoreHashes}
      account={account}
      tokensByNetwork={tokensByNetwork}
      nftContractAddresses={nftContractAddresses}
      onLoadMore={onLoadMore}
    />
  )
}
