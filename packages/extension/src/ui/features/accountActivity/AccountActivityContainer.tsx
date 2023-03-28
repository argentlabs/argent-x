import { CellStack, Empty, H4, SpacerCell, icons } from "@argent/ui"
import { Center, Skeleton } from "@chakra-ui/react"
import { get } from "lodash-es"
import { FC, useCallback, useMemo } from "react"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { formatDate } from "../../services/dates"
import { useAspectContractAddresses } from "../accountNfts/aspect.service"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useMultisigAccountPendingTransactions } from "../multisig/multisigTransactions.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountActivity } from "./AccountActivity"
import { PendingMultisigTransactions } from "./PendingMultisigTransactions"
import { PendingTransactions } from "./PendingTransactions"
import { isVoyagerTransaction } from "./transform/is"
import { ActivityTransaction } from "./useActivity"
import { useArgentExplorerAccountTransactionsInfinite } from "./useArgentExplorer"

const { ActivityIcon } = icons

export interface AccountActivityContainerProps {
  account: Account
}

const PAGE_SIZE = 10

export const AccountActivityContainer: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const accountIdentifier = getAccountIdentifier(account)
  return (
    <CellStack key={accountIdentifier} flex={1}>
      <Center>
        <H4>Activity</H4>
      </Center>
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallbackWithCopyError
            message={"Sorry, an error occurred fetching activity"}
          />
        }
      >
        <AccountActivityLoader account={account} />
      </ErrorBoundary>
    </CellStack>
  )
}

export const AccountActivityLoader: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const network = useCurrentNetwork()
  const { pendingTransactions } = useAccountTransactions(account)
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const { data: nftContractAddresses } = useAspectContractAddresses()
  const { enrichedPendingMultisigTransactions } =
    useMultisigAccountPendingTransactions(account)

  const { data, setSize, error, isValidating } =
    useArgentExplorerAccountTransactionsInfinite({
      accountAddress: account.address,
      network: switcherNetworkId,
      pageSize: PAGE_SIZE,
    })

  const isInitialExplorerFetch =
    isValidating && data === undefined && error === undefined

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

  if (isInitialExplorerFetch) {
    return (
      <>
        <SpacerCell />
        <Skeleton height="16" rounded={"xl"} />
        <Skeleton height="16" rounded={"xl"} />
        <Skeleton height="16" rounded={"xl"} />
      </>
    )
  }

  if (
    !pendingTransactions.length &&
    !Object.keys(mergedActivity).length &&
    !enrichedPendingMultisigTransactions?.length
  ) {
    return (
      <Empty icon={<ActivityIcon />} title={"No activity for this network"} />
    )
  }

  return (
    <>
      {enrichedPendingMultisigTransactions &&
        enrichedPendingMultisigTransactions.length > 0 && (
          <PendingMultisigTransactions
            pendingTransactions={enrichedPendingMultisigTransactions}
            account={account}
            network={network}
          />
        )}
      <PendingTransactions
        pendingTransactions={pendingTransactions}
        network={network}
        tokensByNetwork={tokensByNetwork}
        accountAddress={account.address}
      />
      <AccountActivity
        activity={mergedActivity}
        loadMoreHashes={loadMoreHashes}
        account={account}
        tokensByNetwork={tokensByNetwork}
        nftContractAddresses={nftContractAddresses}
        onLoadMore={onLoadMore}
      />
    </>
  )
}
