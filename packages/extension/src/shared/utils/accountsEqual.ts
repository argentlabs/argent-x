import { isEqualAddress } from "@argent/x-shared"
import type {
  AccountId,
  BaseWalletAccount,
  WalletAccount,
} from "../wallet.model"
import { getAccountIdentifier } from "./accountIdentifier"

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

export const accountsEqual = (a?: BaseWalletAccount, b?: BaseWalletAccount) => {
  try {
    if (!a || !b) {
      return false
    }

    // for accounts that have an id
    if (a.id && b.id) {
      return isEqualAccountIds(a.id, b.id)
    }

    // where there is not yet an id but one can be determined
    if ("signer" in a && "signer" in b) {
      const aId = getAccountIdentifier(a.address, a.networkId, a.signer as any)
      const bId = getAccountIdentifier(b.address, b.networkId, b.signer as any)
      return isEqualAccountIds(aId, bId)
    }

    // fallback to basic comparison
    return isEqualAddress(a.address, b.address) && a.networkId === b.networkId
  } catch (e) {
    console.error("~ accountsEqualById", e)
    return false
  }
}

export const isEqualAccountIds = (a?: AccountId, b?: AccountId) => {
  try {
    if (!a || !b) {
      return false
    }

    return a === b
  } catch (e) {
    console.error("~ accountsEqualById", e)
    return false
  }
}

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

export const atomFamilyIsEqualAccountIds = (a?: AccountId, b?: AccountId) => {
  if (!a && !b) {
    return true
  }
  return isEqualAccountIds(a, b)
}

export const accountsEqualByAddress = (
  a: Omit<BaseWalletAccount, "id">,
  b?: Omit<BaseWalletAccount, "id">,
) => {
  try {
    if (!b) {
      return false
    }
    return isEqualAddress(a.address, b.address) && a.networkId === b.networkId
  } catch (e) {
    console.error("~ accountsEqualByAddress", e)
    return false
  }
}
