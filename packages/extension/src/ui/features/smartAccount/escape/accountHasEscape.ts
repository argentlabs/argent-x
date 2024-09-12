import { WalletAccount } from "../../../../shared/wallet.model"

export const accountHasEscape = (account?: WalletAccount) =>
  Boolean(account?.escape)
