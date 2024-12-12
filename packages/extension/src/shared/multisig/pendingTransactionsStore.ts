import memoize from "memoizee"
import type { AllowArray, BigNumberish } from "starknet"

import { isEqualAddress } from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { atomFromRepo } from "../../ui/views/implementation/atomFromRepo"
import { accountService } from "../account/service"
import type { ActionQueueItemMeta } from "../actionQueue/schema"
import { transformTransaction } from "../activity/utils/transform"
import { isOnChainRejectTransaction } from "../activity/utils/transform/is"
import { getTransactionFromPendingMultisigTransaction } from "../activity/utils/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { ArrayStorage } from "../storage"
import { adaptArrayStorage } from "../storage/__new/repository"
import type { SelectorFn } from "../storage/types"
import type {
  ExtendedFinalityStatus,
  ExtendedTransactionType,
} from "../transactions"
import { addTransaction } from "../transactions/store"
import {
  accountsEqual,
  atomFamilyAccountsEqual,
  isEqualAccountIds,
} from "../utils/accountsEqual"
import type { BaseWalletAccount, WalletAccount } from "../wallet.model"
import {
  TransactionCreatedForMultisigPendingTransaction,
  multisigEmitter,
} from "./emitter"
import type {
  ApiMultisigTransaction,
  ApiMultisigTransactionState,
} from "./multisig.model"
import { getMultisigAccountFromBaseWallet } from "./utils/baseMultisig"

export type MultisigPendingTransaction = {
  requestId: string
  account: BaseWalletAccount
  timestamp: number
  transaction: ApiMultisigTransaction
  type?: ExtendedTransactionType
  approvedSigners: string[]
  nonApprovedSigners: string[]
  state: ApiMultisigTransactionState
  creator: string
  nonce: number
  transactionHash: string
  notify: boolean
  meta?: Pick<
    ActionQueueItemMeta,
    "title" | "subtitle" | "icon" | "transactionReview"
  >
}

export const multisigPendingTransactionsStore =
  new ArrayStorage<MultisigPendingTransaction>([], {
    namespace: "core:multisig:pendingTransactions",
    compare: (a, b) =>
      a.requestId === b.requestId && accountsEqual(a.account, b.account),
  })

export const multisigPendingTransactionsRepo = adaptArrayStorage(
  multisigPendingTransactionsStore,
)

export const allMultisigPendingTransactionsView = atom(async (get) => {
  const multisigPendingTransactions = await get(
    atomFromRepo(multisigPendingTransactionsRepo),
  )
  return multisigPendingTransactions.sort((a, b) => a.timestamp - b.timestamp)
})

export const multisigPendingTransactionsAccountView = atomFamily(
  (account?: BaseWalletAccount) =>
    atom(async (get) => {
      const multisigPendingTransactions = await get(
        allMultisigPendingTransactionsView,
      )
      return multisigPendingTransactions.filter((tx) =>
        accountsEqual(tx.account, account),
      )
    }),
  atomFamilyAccountsEqual,
)

export const multisigPendingTransactionView = atomFamily((requestId?: string) =>
  atom(async (get) => {
    const multisigPendingTransactions = await get(
      allMultisigPendingTransactionsView,
    )
    return multisigPendingTransactions.find((tx) => tx.requestId === requestId)
  }),
)

export const byAccountSelector = memoize(
  (account?: BaseWalletAccount) =>
    (transaction: MultisigPendingTransaction) => {
      return accountsEqual(transaction.account, account)
    },
  { normalizer: ([account]) => (account ? account.id : "unknown-account") },
)

export async function getMultisigPendingTransactions(
  selector: SelectorFn<MultisigPendingTransaction> = () => true,
): Promise<MultisigPendingTransaction[]> {
  return multisigPendingTransactionsStore.get(selector)
}

export async function getMultisigPendingTransaction(
  requestId: string,
): Promise<MultisigPendingTransaction | undefined> {
  const pendingTransactions = await getMultisigPendingTransactions(
    (transaction) => transaction.requestId === requestId,
  )

  if (pendingTransactions.length === 0) {
    return undefined
  }

  return pendingTransactions[0]
}

export async function addToMultisigPendingTransactions(
  pendingTransactions: AllowArray<MultisigPendingTransaction>,
): Promise<void> {
  return multisigPendingTransactionsStore.push(pendingTransactions)
}

export async function removeFromMultisigPendingTransactions(
  pendingTransactions: AllowArray<MultisigPendingTransaction>,
): Promise<MultisigPendingTransaction[]> {
  return multisigPendingTransactionsStore.remove(pendingTransactions)
}

// the reject on chain transaction replaces the original transaction
export async function removeMultisigPendingTransactionOnRejectOnChain(
  nonce?: BigNumberish,
  account?: WalletAccount,
): Promise<void> {
  if (!nonce || !account) {
    return
  }
  const transactionsWithNonce = await getMultisigPendingTransactions(
    (transaction) => transaction.nonce === nonce,
  )

  const txToBeRemoved = transactionsWithNonce.filter((multisigTransaction) => {
    const transaction = getTransactionFromPendingMultisigTransaction(
      multisigTransaction,
      account,
    )
    const transactionTransformed = transformTransaction({
      transaction,
      accountAddress: account.address,
    })
    if (
      transactionTransformed &&
      !isOnChainRejectTransaction(transactionTransformed)
    ) {
      return true
    }
  })
  void multisigPendingTransactionsStore.remove(txToBeRemoved)
}

export async function removeRejectedOnChainPendingTransactions(
  allTransactions: MultisigPendingTransaction[],
): Promise<MultisigPendingTransaction[]> {
  const groupedTransactionsByAccount =
    groupTransactionsByAccount(allTransactions)
  const accountsTransactionLists = Object.values(groupedTransactionsByAccount)

  // account with type WalletAccount is needed later
  const accounts: WalletAccount[] =
    await accountService.getFromBaseWalletAccounts(
      Object.keys(groupedTransactionsByAccount).map((accountKey) => {
        const [address, networkId] = accountKey.split("-")
        return {
          id: accountKey,
          address,
          networkId,
        }
      }),
    )

  const txToBeRemoved = accountsTransactionLists
    .flatMap((accountTransactions) => {
      const walletAccount = accounts.find((account) => {
        return accountsEqual(account, accountTransactions[0]?.account)
      })
      return extractRejectedTransactions(accountTransactions, walletAccount)
    })
    .filter((tx) => !!tx) as MultisigPendingTransaction[]

  return multisigPendingTransactionsStore.remove(txToBeRemoved)
}

const groupTransactionsByAccount = (
  allTransactions: MultisigPendingTransaction[],
) => {
  return allTransactions.reduce(
    (groups: { [key: string]: MultisigPendingTransaction[] }, transaction) => {
      const accountKey = transaction.account.id
      // Check if a group for this account already exists
      for (const key in groups) {
        if (isEqualAccountIds(accountKey, key)) {
          groups[key].push(transaction)
          return groups
        }
      }
      groups[accountKey] = [transaction]
      return groups
    },
    {},
  )
}

export const multisigPendingTxToTransformedTx = (
  multisigTransaction: MultisigPendingTransaction,
  account: WalletAccount,
) => {
  const transaction = getTransactionFromPendingMultisigTransaction(
    multisigTransaction,
    account,
  )
  return transformTransaction({
    transaction,
    accountAddress: multisigTransaction.account.address,
  })
}

const extractRejectedTransactions = (
  accountPendingTransactions: MultisigPendingTransaction[],
  account?: WalletAccount,
): MultisigPendingTransaction[] => {
  if (!account) {
    return []
  }
  const nonces = new Set(
    accountPendingTransactions.map((transaction) => transaction.nonce),
  )

  return Array.from(nonces).flatMap((nonce) => {
    const transactionsByNonce = accountPendingTransactions.filter(
      (transaction) => transaction.nonce === nonce,
    )

    if (transactionsByNonce.length > 1) {
      /** this is for backwards compatibility, before multisig queing, to support existing multiple pending transactions with the same nonce
       *  the hasOnChainReject condition can be removed once all accounts have upgraded to 5.17.0 */
      const hasOnChainReject = transactionsByNonce.some(
        (multisigTransaction) => {
          const transformedTx = multisigPendingTxToTransformedTx(
            multisigTransaction,
            account,
          )
          return transformedTx && isOnChainRejectTransaction(transformedTx)
        },
      )
      if (hasOnChainReject) {
        return transactionsByNonce.filter((multisigTransaction) => {
          const transformedTx = multisigPendingTxToTransformedTx(
            multisigTransaction,
            account,
          )
          return transformedTx && !isOnChainRejectTransaction(transformedTx)
        })
      }
    }

    return []
  })
}

export function getInitialFinalityStatus(
  state: ApiMultisigTransactionState,
): ExtendedFinalityStatus {
  switch (state) {
    case "CANCELLED":
      return "CANCELLED"
    case "TX_ACCEPTED_L2":
      return "ACCEPTED_ON_L2"
    case "COMPLETE":
      return "ACCEPTED_ON_L1"
    case "REJECTED":
    case "ERROR":
      return "REJECTED"
    case "AWAITING_SIGNATURES":
      return "NOT_RECEIVED"
    case "SUBMITTED":
    case "SUBMITTING":
    case "TX_PENDING":
      return "RECEIVED" /** equivalent to 'pending' */
    case "REVERTED":
      return "REVERTED"
  }
  /** ensures all cases are handled */
  state satisfies never
}

export async function multisigPendingTransactionToTransaction(
  requestId: string,
  state: ApiMultisigTransactionState,
): Promise<void> {
  const pendingTxn = await getMultisigPendingTransaction(requestId)

  if (!pendingTxn) {
    throw new Error("Pending Multisig transaction not found")
  }

  const { transaction, type, transactionHash, account } = pendingTxn

  const multisigAccount = await getMultisigAccountFromBaseWallet(account)

  if (!multisigAccount) {
    throw new Error("Multisig account not found")
  }

  if (state === "AWAITING_SIGNATURES") {
    throw new Error("Transaction is still awaiting signatures")
  }

  const finalityStatus = getInitialFinalityStatus(state)

  await addTransaction(
    {
      hash: transactionHash,
      account: multisigAccount,
      meta: {
        type,
        transactions: transaction.calls,
      },
    },
    {
      finality_status: finalityStatus,
    },
  )

  await multisigEmitter.emit(TransactionCreatedForMultisigPendingTransaction, {
    requestId,
    transactionHash,
  })

  await removeFromMultisigPendingTransactions(pendingTxn)
}

export async function setHasSeenTransaction(requestId: string) {
  const pendingTxn = await getMultisigPendingTransaction(requestId)

  if (!pendingTxn || !pendingTxn.notify) {
    return
  }

  return await multisigPendingTransactionsStore.push({
    ...pendingTxn,
    notify: false,
  })
}

export async function addPendingMultisigApproval(
  requestId: string,
  pubKey?: string,
): Promise<void> {
  const pendingMultisig = await getMultisigPendingTransaction(requestId)

  if (pendingMultisig && pubKey) {
    if (!pendingMultisig.approvedSigners.includes(pubKey)) {
      pendingMultisig.approvedSigners.push(pubKey)
    }
    pendingMultisig.nonApprovedSigners =
      pendingMultisig.nonApprovedSigners.filter(
        (signer) => !isEqualAddress(signer, pubKey),
      )

    await multisigPendingTransactionsStore.push(pendingMultisig)
  }
}
