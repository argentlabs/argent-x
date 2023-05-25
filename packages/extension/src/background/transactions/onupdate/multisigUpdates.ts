import { updateMultisigAccountDetails } from "../../../shared/account/update"
import { MULTISG_TXN_TYPES, Transaction } from "../../../shared/transactions"
import { TransactionUpdateListener } from "./type"

export const handleMultisigUpdates: TransactionUpdateListener = async (
  updates: Transaction[],
) => {
  const multisigUpdates = updates.filter(
    (t) => t.meta?.type && MULTISG_TXN_TYPES.includes(t.meta.type),
  )

  if (multisigUpdates.length > 0) {
    await updateMultisigAccountDetails(multisigUpdates.map((t) => t.account))
  }
}
