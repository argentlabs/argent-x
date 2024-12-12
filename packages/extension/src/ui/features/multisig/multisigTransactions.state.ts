import { isEmpty } from "lodash-es"
import { num } from "starknet"
import { isUpgradeTransaction } from "../../../shared/activity/utils/transform/is"
import type { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import {
  multisigPendingTransactionsAccountView,
  multisigPendingTxToTransformedTx,
} from "../../../shared/multisig/pendingTransactionsStore"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import { multisigView } from "./multisig.state"
import { useMemo } from "react"

export const useMultisigPendingTransactionsByAccount = (
  account?: BaseWalletAccount,
) => {
  return useView(multisigPendingTransactionsAccountView(account))
}

export const useMultisigPendingTransactionsAwaitingConfirmation = (
  account?: BaseWalletAccount,
) => {
  const multisig = useView(multisigView(account))
  const multisigPendingTransactionsByAccount =
    useMultisigPendingTransactionsByAccount(account)

  return useMemo(() => {
    if (!multisig || !multisigPendingTransactionsByAccount) {
      return []
    }
    return multisigPendingTransactionsByAccount.filter((transaction) =>
      transaction.nonApprovedSigners.some(
        (signer) => num.toBigInt(signer) === num.toBigInt(multisig.publicKey),
      ),
    )
  }, [multisig, multisigPendingTransactionsByAccount])
}

export const useMultisigPendingUpgradeTransactions = (
  account?: WalletAccount,
): MultisigPendingTransaction[] => {
  const pendingTransactions = useView(
    multisigPendingTransactionsAccountView(account),
  )

  return useMemo(() => {
    if (isEmpty(pendingTransactions) || !account) {
      return []
    }
    return pendingTransactions.filter((transaction) => {
      const transformedTransaction = multisigPendingTxToTransformedTx(
        transaction,
        account,
      )

      return (
        transformedTransaction && isUpgradeTransaction(transformedTransaction)
      )
    })
  }, [account, pendingTransactions])
}
