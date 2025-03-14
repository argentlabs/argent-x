import { atom } from "jotai"
import { transactionsRepo } from "../../shared/transactions/store"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { getTransactionStatus } from "../../shared/transactions/utils"
import { atomFamily } from "jotai/utils"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import {
  accountsEqual,
  atomFamilyAccountsEqual,
} from "../../shared/utils/accountsEqual"
import { isSafeUpgradeTransaction } from "../../shared/utils/isSafeUpgradeTransaction"
import { atomWithDebugLabel } from "./atomWithDebugLabel"

export const allTransactionsView = atomFromRepo(transactionsRepo)

export const pendingTransactionsView = atom(async (get) => {
  const transactions = await get(allTransactionsView)
  return transactions.filter(
    (transaction) =>
      getTransactionStatus(transaction).finality_status === "RECEIVED",
  )
})

export const accountTransactionsView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const transactions = await get(allTransactionsView)
        return transactions.filter((transaction) =>
          accountsEqual(transaction.account, account),
        )
      }),
      `accountTransactionsView-${account?.id}`,
    ),
  atomFamilyAccountsEqual,
)

export const networkTransactionsView = atomFamily(
  (networkId?: string) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const transactions = await get(allTransactionsView)
        return transactions.filter(
          (transaction) => transaction.account.networkId === networkId,
        )
      }),
      `networkTransactionsView-${networkId}`,
    ),
  (a, b) => a === b,
)

export const accountPendingTransactionsView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const transactions = await get(accountTransactionsView(account))
        return transactions.filter(
          (transaction) =>
            getTransactionStatus(transaction).finality_status === "RECEIVED",
        )
      }),
      `accountPendingTransactionsView-${account?.id}`,
    ),
  atomFamilyAccountsEqual,
)

export const upgradeTransactionsView = atom(async (get) => {
  const transactions = await get(allTransactionsView)
  return transactions.filter(isSafeUpgradeTransaction)
})

export const accountUpgradeTransactionView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const upgradeTransactions = await get(upgradeTransactionsView)
        return upgradeTransactions.filter((tx) =>
          accountsEqual(tx.account, account),
        )
      }),
      `accountUpgradeTransactionView-${account?.id}`,
    ),
  atomFamilyAccountsEqual,
)
