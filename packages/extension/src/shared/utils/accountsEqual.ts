import { isEqualAddress } from "@argent/shared"
import type { BaseWalletAccount, WalletAccount } from "../wallet.model"

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
