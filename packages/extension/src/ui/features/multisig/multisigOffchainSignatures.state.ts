import { useMemo } from "react"
import type { MultisigPendingOffchainSignature } from "../../../shared/multisig/pendingOffchainSignaturesStore"
import {
  multisigPendingOffchainSignaturesStore,
  byAccountSelector,
} from "../../../shared/multisig/pendingOffchainSignaturesStore"
import type { SelectorFn } from "../../../shared/storage/__new/interface"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { atomFromRepo } from "../../views/implementation/atomFromRepo"
import { useView } from "../../views/implementation/react"

type UseMultisigAccountPendingOffchainSignatures = (
  account?: BaseWalletAccount,
) => MultisigPendingOffchainSignature[]

export const multisigPendingOffchainSignaturesAtom = atomFromRepo(
  multisigPendingOffchainSignaturesStore,
)

export const useMultisigPendingOffchainSignatures = (
  selector?: SelectorFn<MultisigPendingOffchainSignature>,
  sorted = true,
) => {
  const allTransactions = useView(multisigPendingOffchainSignaturesAtom)
  const transactions = useMemo(
    () => (selector ? allTransactions.filter(selector) : allTransactions),
    [allTransactions, selector],
  )
  return useMemo(
    () =>
      sorted
        ? transactions.sort((a, b) => b.timestamp - a.timestamp)
        : transactions,
    [transactions, sorted],
  )
}

export const useMultisigPendingOffchainSignaturesByAccount: UseMultisigAccountPendingOffchainSignatures =
  (account) => {
    return useMultisigPendingOffchainSignatures(byAccountSelector(account))
  }

export const useMultisigPendingOffchainSignature = (requestId?: string) => {
  const [signature] = useMultisigPendingOffchainSignatures(
    (signature) => signature.requestId === requestId,
  )

  return useMemo(
    () => (requestId ? signature : undefined),
    [requestId, signature],
  )
}
