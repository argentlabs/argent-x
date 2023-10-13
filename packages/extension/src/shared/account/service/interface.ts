import { AllowArray, SelectorFn } from "../../storage/__new/interface"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  MultisigData,
  WalletAccount,
} from "../../wallet.model"

export interface IAccountService {
  // selected account
  select(baseAccount: BaseWalletAccount): Promise<void>

  // account methods
  create(
    type: CreateAccountType,
    networkId: string,
    multisigPayload?: MultisigData,
  ): Promise<WalletAccount>
  deploy(baseAccount: BaseWalletAccount): Promise<void>
  upgrade(
    baseAccount: BaseWalletAccount,
    targetImplementationType?: ArgentAccountType,
  ): Promise<void>

  // Repo methods
  get(selector?: SelectorFn<WalletAccount>): Promise<WalletAccount[]>
  upsert(account: AllowArray<WalletAccount>): Promise<void>
  remove(baseAccount: BaseWalletAccount): Promise<void>

  // mutations/updates
  setHide(hidden: boolean, baseAccount: BaseWalletAccount): Promise<void>
  setName(name: string, baseAccount: BaseWalletAccount): Promise<void>

  // getters
  getDeployed(baseAccount: BaseWalletAccount): Promise<boolean>
}
