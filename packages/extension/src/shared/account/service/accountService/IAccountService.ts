import type { AllowArray, SelectorFn } from "../../../storage/__new/interface"
import type { BaseWalletAccount, WalletAccount } from "../../../wallet.model"

export interface IAccountService {
  // Repo methods
  get(selector?: SelectorFn<WalletAccount>): Promise<WalletAccount[]>
  getFromBaseWalletAccounts(
    baseWalletAccounts: BaseWalletAccount[],
  ): Promise<WalletAccount[]>
  upsert(account: AllowArray<WalletAccount>): Promise<void>
  remove(baseAccount: BaseWalletAccount): Promise<void>

  // mutations/updates
  setHide(hidden: boolean, baseAccount: BaseWalletAccount): Promise<void>
  setName(name: string, baseAccount: BaseWalletAccount): Promise<void>

  // getters
  getDeployed(baseAccount: BaseWalletAccount): Promise<boolean>
}
