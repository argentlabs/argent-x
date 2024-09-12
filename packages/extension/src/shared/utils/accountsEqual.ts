import { isEqualAddress } from "@argent/x-shared"
import type { BaseWalletAccount, WalletAccount } from "../wallet.model"

/** prevents infinite re-renders when both accounts are undefined */
export const atomFamilyAccountsEqual = (
  a?: BaseWalletAccount,
  b?: BaseWalletAccount,
) => {
  if (!a && !b) {
    return true
  }
  return accountsEqual(a, b)
}

export const accountsEqual = (a?: BaseWalletAccount, b?: BaseWalletAccount) => {
  try {
    if (!a || !b) {
      return false
    }
    return isEqualAddress(a.address, b.address) && a.networkId === b.networkId
  } catch (e) {
    console.error("~ accountsEqual", e)
    return false
  }
}

export const accountsEqualByChainId = (a: WalletAccount, b?: WalletAccount) => {
  try {
    if (!b) {
      return false
    }
    return (
      isEqualAddress(a.address, b.address) &&
      a.network.chainId === b.network.chainId
    )
  } catch (e) {
    console.error("~ accountsEqualByChainId", e)
    return false
  }
}
