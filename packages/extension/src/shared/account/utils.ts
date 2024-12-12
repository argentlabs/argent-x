import type { BaseWalletAccount, WalletAccount } from "../wallet.model"

/**
 * Transforms a WalletAccount into a BaseWalletAccount
 * @returns A BaseWalletAccount containing only id, address, and networkId
 */
export const toBaseWalletAccount = (
  walletAccount: WalletAccount | BaseWalletAccount,
): BaseWalletAccount => {
  const { id, address, networkId } = walletAccount
  return { id, address, networkId }
}
