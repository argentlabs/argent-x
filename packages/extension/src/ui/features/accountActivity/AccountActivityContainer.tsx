import { FC, useCallback, useMemo } from "react"
import { get, uniqBy } from "lodash-es"
import {
  CellStack,
  Empty,
  H4,
  SpacerCell,
  iconsDeprecated,
  formatDate,
} from "@argent/x-ui"
import { Center, Skeleton } from "@chakra-ui/react"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { useContractAddresses } from "../accountNfts/nfts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useMultisigPendingTransactionsByAccount } from "../multisig/multisigTransactions.state"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { AccountActivity } from "./AccountActivity"
import { PendingMultisigTransactions } from "./PendingMultisigTransactions"
import { PendingTransactions } from "./PendingTransactions"
import { isVoyagerTransaction } from "../../../shared/activity/utils/transform/is"
import { ActivityTransaction } from "../../../shared/activity/utils/transform/type"
import { useArgentExplorerAccountTransactionsInfinite } from "./useArgentExplorer"
import { isEqualAddress, normalizeAddress } from "@argent/x-shared"
import { getTransactionFailureReason } from "../../../shared/activity/utils/transform/getTransactionFailureReason"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { useTokensInCurrentNetworkIncludingSpam } from "../accountTokens/tokens.state"
import { useMultisigPendingOffchainSignaturesByAccount } from "../multisig/multisigOffchainSignatures.state"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"
import { WalletAccount } from "../../../shared/wallet.model"

const { ActivityIcon } = iconsDeprecated

export interface AccountActivityContainerProps {
  account: WalletAccount
}

const PAGE_SIZE = 10

/** @deprecated Remove when Activity V2 is stable */

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
  const selectedNetworkId = useView(selectedNetworkIdView)
  const tokensByNetwork = useTokensInCurrentNetworkIncludingSpam()
  const nftContractAddresses = useContractAddresses()

  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(account)

  const pendingMultisigOffchainSignatures =
    useMultisigPendingOffchainSignaturesByAccount(account)

  const pendingMultisigActions = useMemo(
    () =>
      [
        ...pendingMultisigTransactions,
        ...pendingMultisigOffchainSignatures,
      ].sort((tx) => -tx.timestamp),
    [pendingMultisigTransactions, pendingMultisigOffchainSignatures],
  )
  const pendingMultisigHashes = pendingMultisigTransactions.map(
    (tx) => tx.transactionHash,
  )
  const { data, setSize, error, isValidating } =
    useArgentExplorerAccountTransactionsInfinite({
      accountAddress: account.address,
      network: selectedNetworkId,
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
    return uniqBy(
      transactions.filter((transaction) => {
        const { finality_status } = getTransactionStatus(transaction)
        return (
          finality_status !== "RECEIVED" && !transaction.meta?.isDeployAccount
        )
      }),
      (tx) => normalizeAddress(tx.hash),
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
          isEqualAddress(
            explorerTransaction.transactionHash,
            voyagerTransaction.hash,
          ),
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
        !matchedHashes.some((matchedHash) =>
          isEqualAddress(matchedHash, explorerTransaction.transactionHash),
        ),
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
    const submittedTransactions = transactions.filter(
      (transaction) => transaction.status !== "NOT_RECEIVED",
    )

    const submittedTransactionsWithoutPendingMultisig =
      submittedTransactions.filter(
        (transaction) =>
          !("hash" in transaction) ||
          ("hash" in transaction &&
            !pendingMultisigHashes.includes(transaction.hash)),
      )
    for (const transaction of submittedTransactionsWithoutPendingMultisig) {
      const date = new Date(transaction.timestamp * 1000).toISOString()
      const dateLabel = formatDate(date)

      if (!mergedActivity[dateLabel]) {
        mergedActivity[dateLabel] = []
      }
      if (isVoyagerTransaction(transaction)) {
        const { hash, meta } = transaction
        const failureReason = getTransactionFailureReason(
          getTransactionStatus(transaction),
        )

        const activityTransaction: ActivityTransaction = {
          hash,
          date,
          meta,
          failureReason,
        }

        mergedActivity[dateLabel].push(activityTransaction)
      } else {
        const failureReason = getTransactionFailureReason({
          finality_status: transaction.finalityStatus,
          execution_status: transaction.executionStatus,
        })

        mergedActivity[dateLabel].push({
          ...transaction,
          failureReason,
        })

        if (transaction.transactionHash) {
          lastExplorerTransactionHash = transaction.transactionHash
        }
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
    !pendingMultisigTransactions?.length
  ) {
    return (
      <Empty icon={<ActivityIcon />} title={"No activity for this network"} />
    )
  }

  const SharedActivities = () => (
    <>
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
  return (
    <>
      {account.type === "multisig" ? (
        <>
          {pendingMultisigActions && pendingMultisigActions.length > 0 && (
            <PendingMultisigTransactions
              pendingMultisigActions={pendingMultisigActions}
              account={account}
              network={network}
            />
          )}
          <SharedActivities />
        </>
      ) : (
        <SharedActivities />
      )}
    </>
  )
}
