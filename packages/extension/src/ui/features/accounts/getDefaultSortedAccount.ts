import { WalletAccount } from "../../../shared/wallet.model"

export const getDefaultSortedAccounts = (accounts: WalletAccount[]) => {
  return accounts.sort((a, b) => {
    // Prioritize by account type first: "standard" types come before others.
    if (a.type === "multisig" && b.type !== "multisig") {
      return 1 // a is multisig and b is not, a should come after b
    } else if (a.type !== "multisig" && b.type === "multisig") {
      return -1 // a is not multisig and b is, a should come before b
    }

    // If both have the same type, then sort by index, considering undefined as the highest value.
    const aIndex = typeof a.index === "undefined" ? Infinity : a.index
    const bIndex = typeof b.index === "undefined" ? Infinity : b.index

    return aIndex - bIndex
  })
}
