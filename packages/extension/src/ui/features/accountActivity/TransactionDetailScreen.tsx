import { isArray } from "lodash-es"
import { FC, useMemo } from "react"
import { Navigate, useParams } from "react-router-dom"

import { compareTransactions } from "../../../shared/transactions"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useContractAddresses } from "../accountNfts/nfts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { LoadingScreenContainer } from "../actions/LoadingScreenContainer"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { TransactionDetail } from "./TransactionDetail"
import {
  transformExplorerTransaction,
  transformTransaction,
} from "../../../shared/activity/utils/transform"
import { useArgentExplorerTransaction } from "./useArgentExplorer"
import { useTokensInCurrentNetworkIncludingSpam } from "../accountTokens/tokens.state"

export const TransactionDetailScreen: FC = () => {
  const network = useCurrentNetwork()
  const { txHash } = useParams()
  const {
    data: explorerTransaction,
    error,
    isValidating,
  } = useArgentExplorerTransaction({
    hash: txHash,
    network: network.id,
  })
  const isInitialLoad = !explorerTransaction && !error && isValidating

  const account = useView(selectedAccountView)
  const tokensByNetwork = useTokensInCurrentNetworkIncludingSpam()
  const nftContractAddresses = useContractAddresses()

  const { transactions } = useAccountTransactions(account)

  const transaction = useMemo(() => {
    if (!txHash) {
      return
    }
    return transactions.find((tx) =>
      compareTransactions(tx, {
        hash: txHash,
        account: {
          networkId: network.id,
        },
      }),
    )
  }, [network.id, transactions, txHash])

  // TODO: remove this when after backend update
  const isUdcTransaction = useMemo(() => {
    if (!transaction?.meta?.transactions) {
      return false
    }
    if (isArray(transaction?.meta?.transactions)) {
      return (
        transaction.meta.transactions[0].entrypoint === "deployContract" ||
        transaction.meta.transactions[0].entrypoint === "declareContract"
      )
    }
    return (
      transaction.meta.transactions.entrypoint === "deployContract" ||
      transaction.meta.transactions.entrypoint === "declareContract"
    )
  }, [transaction])

  const explorerTransactionTransformed = useMemo(() => {
    if (explorerTransaction && account) {
      if (!explorerTransaction.timestamp && transaction) {
        explorerTransaction.timestamp = transaction.timestamp
      }
      return transformExplorerTransaction({
        explorerTransaction,
        accountAddress: account.address,
        tokensByNetwork,
        nftContractAddresses,
      })
    }
  }, [
    account,
    explorerTransaction,
    nftContractAddresses,
    tokensByNetwork,
    transaction,
  ])

  const transactionTransformed = useMemo(() => {
    if (transaction && account) {
      return transformTransaction({
        transaction,
        accountAddress: account.address,
        tokensByNetwork,
        nftContractAddresses,
      })
    }
  }, [account, nftContractAddresses, tokensByNetwork, transaction])

  if (!account) {
    return <Navigate to={routes.accounts()} />
  } else if (!txHash) {
    return <Navigate to={routes.accountTokens()} />
  }

  if (isInitialLoad) {
    return <LoadingScreenContainer />
  }

  if (
    !isUdcTransaction &&
    explorerTransaction &&
    explorerTransactionTransformed
  ) {
    return (
      <TransactionDetail
        explorerTransaction={explorerTransaction}
        transactionTransformed={explorerTransactionTransformed}
        network={network}
        tokensByNetwork={tokensByNetwork}
      />
    )
  }

  if (transaction && transactionTransformed) {
    return (
      <TransactionDetail
        transaction={transaction}
        transactionTransformed={transactionTransformed}
        network={network}
        tokensByNetwork={tokensByNetwork}
      />
    )
  }

  /** not possible via UI */
  return null
}
