import { BigNumber } from "ethers"
import { Call, EstimateFee, constants, number, stark } from "starknet"

import {
  ExtQueueItem,
  TransactionActionPayload,
} from "../../shared/actionQueue/types"
import { getL1GasPrice } from "../../shared/ethersUtils"
import { AllowArray } from "../../shared/storage/types"
import { nameTransaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { BackgroundService } from "../background"
import { getNonce, increaseStoredNonce, resetStoredNonce } from "../nonce"
import { addTransaction, transactionsStore } from "./store"

export const checkTransactionHash = (
  transactionHash?: number.BigNumberish,
): boolean => {
  try {
    if (!transactionHash) {
      throw Error("transactionHash not defined")
    }
    const bn = number.toBN(transactionHash)
    if (bn.lte(constants.ZERO)) {
      throw Error("transactionHash needs to be >0")
    }
    return true
  } catch {
    return false
  }
}

type TransactionAction = ExtQueueItem<{
  type: "TRANSACTION"
  payload: TransactionActionPayload
}>

export const executeTransactionAction = async (
  action: TransactionAction,
  { wallet }: BackgroundService,
) => {
  const { transactions, abis, transactionsDetail, meta = {} } = action.payload
  const allTransactions = await transactionsStore.get()

  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const selectedAccount = await wallet.getSelectedAccount()
  if (!selectedAccount) {
    throw Error("no accounts")
  }

  const pendingAccountTransactions = allTransactions.filter(
    (tx) =>
      tx.status === "RECEIVED" && accountsEqual(tx.account, selectedAccount),
  )

  const hasUpgradePending = pendingAccountTransactions.some(
    (tx) => tx.meta?.isUpgrade,
  )

  const accountNeedsDeploy = selectedAccount.needsDeploy

  const starknetAccount = await wallet.getStarknetAccount(
    selectedAccount,
    hasUpgradePending,
  )

  // if nonce doesnt get provided by the UI, we can use the stored nonce to allow transaction queueing
  const nonceWasProvidedByUI = transactionsDetail?.nonce !== undefined // nonce can be a number of 0 therefore we need to check for undefined
  const nonce = accountNeedsDeploy
    ? number.toHex(number.toBN(1))
    : nonceWasProvidedByUI
    ? number.toHex(number.toBN(transactionsDetail?.nonce || 0))
    : await getNonce(selectedAccount, wallet)

  let maxFee = "0"

  if (accountNeedsDeploy) {
    const { account, txHash } = await wallet.deployAccount(selectedAccount)

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not get added to the sequencer",
      )
    }

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        ...meta,
        title: "Activate Account",
        isDeployAccount: true,
      },
    })

    const { suggestedMaxFee } = await calculateEstimateFeeFromL1Gas(
      account,
      transactions,
    )
    maxFee = number.toHex(stark.estimatedFeeToMaxFee(suggestedMaxFee, 1))
  } else {
    if (hasUpgradePending) {
      const oldStarknetAccount = await wallet.getStarknetAccount(
        selectedAccount,
        false,
      )
      // Use old starknet account to calculate the max fee if upgrade is in progress
      const { suggestedMaxFee } = await oldStarknetAccount.estimateFee(
        transactions,
      )
      maxFee = number.toHex(stark.estimatedFeeToMaxFee(suggestedMaxFee, 1))
    } else {
      // estimate fee with onchain nonce even tho transaction nonce may be different
      const { suggestedMaxFee } = await starknetAccount.estimateFee(
        transactions,
      )
      maxFee = number.toHex(stark.estimatedFeeToMaxFee(suggestedMaxFee, 1))
    }
  }

  const transaction = await starknetAccount.execute(transactions, abis, {
    ...transactionsDetail,
    nonce,
    maxFee,
  })

  if (!checkTransactionHash(transaction.transaction_hash)) {
    throw Error("Transaction could not get added to the sequencer")
  }

  const title = nameTransaction(transactions)

  await addTransaction({
    hash: transaction.transaction_hash,
    account: selectedAccount,
    meta: {
      ...meta,
      title,
      transactions,
    },
  })

  if (!nonceWasProvidedByUI) {
    await increaseStoredNonce(selectedAccount)
  }

  if (meta.isUpgrade) {
    await resetStoredNonce(selectedAccount) // reset nonce after upgrade. This is needed because nonce was managed by AccountContract before 0.10.0
  }

  return transaction
}

export const calculateEstimateFeeFromL1Gas = async (
  account: WalletAccount,
  transactions: AllowArray<Call>,
): Promise<EstimateFee> => {
  const fallbackPrice = number.toBN(10e14)
  try {
    if (account.networkId === "localhost") {
      console.log("Using fallback gas price for localhost")
      return {
        overall_fee: fallbackPrice,
        suggestedMaxFee: stark.estimatedFeeToMaxFee(fallbackPrice),
      }
    }

    const l1GasPrice = await getL1GasPrice(account.networkId)

    const callsLen = Array.isArray(transactions) ? transactions.length : 1
    const multiplier = BigNumber.from(3744)

    const price = l1GasPrice.mul(callsLen).mul(multiplier).toString()

    return {
      overall_fee: number.toBN(price),
      suggestedMaxFee: stark.estimatedFeeToMaxFee(price),
    }
  } catch {
    console.warn("Could not get L1 gas price")
    return {
      overall_fee: fallbackPrice,
      suggestedMaxFee: stark.estimatedFeeToMaxFee(fallbackPrice),
    }
  }
}
