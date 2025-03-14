import type Emittery from "emittery"
import type { AllowArray, SelectorFn } from "../../../storage/__new/interface"
import type {
  AccountId,
  ArgentWalletAccount,
  AvatarMeta,
  BaseWalletAccount,
  WalletAccount,
} from "../../../wallet.model"

export const AccountAddedEvent = Symbol("AccountAddedEvent")

export type Events = {
  [AccountAddedEvent]: WalletAccount
}

export interface IAccountService {
  readonly emitter: Emittery<Events>

  // Repo methods
  getArgentWalletAccounts(): Promise<ArgentWalletAccount[]>
  get(selector?: SelectorFn<WalletAccount>): Promise<WalletAccount[]>
  getFromBaseWalletAccounts(
    baseWalletAccounts: BaseWalletAccount[],
  ): Promise<WalletAccount[]>
  upsert(account: AllowArray<WalletAccount>): Promise<void>
  remove(
    selector?: SelectorFn<WalletAccount> | AllowArray<WalletAccount>,
  ): Promise<WalletAccount[]>

  removeById(accountId: AccountId): Promise<void>

  // mutations/updates
  setHide(hidden: boolean, accountId: AccountId): Promise<void>
  setName(name: string, accountId: AccountId): Promise<void>

  setAvatarMeta(
    avatarMeta: AvatarMeta | undefined,
    accountId: AccountId,
  ): Promise<void>

  // getters
  getDeployed(baseAccount: BaseWalletAccount): Promise<boolean>
}
