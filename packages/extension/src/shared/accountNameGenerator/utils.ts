import type { AvatarMeta } from "../wallet.model"

export const isV1AccountLabel = (accountName: string) => {
  return /^(Account|Multisig|Imported Account) \d+$/.test(accountName)
}

export const getAccountLabelVersion = (
  accountName: string,
  avatarMeta?: AvatarMeta,
) => {
  switch (avatarMeta?.emoji) {
    case undefined:
      // If emoji is undefined, fall back to checking accountName
      // Useful in case of Recovered Wallets
      return isV1AccountLabel(accountName) ? "v1" : "v2"
    case null:
      // Null value is set when user customizes the avatar
      // and selects V1 Avatar
      return "v1"
    default:
      // If emoji is a string, return v2
      return "v2"
  }
}
