import { constants, num } from "starknet"
import { WalletAccount } from "../../shared/wallet.model"
import { TransactionError } from "../../shared/errors/transaction"

export const checkTransactionHash = (
  transactionHash?: num.BigNumberish,
  account?: WalletAccount,
): boolean => {
  try {
    if (!transactionHash) {
      throw new TransactionError({
        code: "NO_TRANSACTION_HASH",
      })
    }
    const bn = num.toBigInt(transactionHash)
    if (bn <= constants.ZERO && account?.type !== "multisig") {
      throw new TransactionError({
        code: "INVALID_TRANSACTION_HASH_RANGE",
      })
    }
    return true
  } catch {
    return false
  }
}
