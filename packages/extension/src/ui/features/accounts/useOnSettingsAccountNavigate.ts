import { WalletAccount } from "../../../shared/wallet.model"
import { useOnSettingsNavigate } from "./useOnSettingsNavigate"

export const useOnSettingsAccountNavigate = (account?: WalletAccount) => {
  return useOnSettingsNavigate(account, true)
}
