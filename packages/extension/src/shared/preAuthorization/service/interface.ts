import type { BaseWalletAccount } from "../../wallet.model"
import type { PreAuthorization } from "../schema"

export interface IPreAuthorizationService {
  isPreAuthorized(
    maybePreAuthorization: Partial<PreAuthorization>,
  ): Promise<boolean>
  getAll(): Promise<PreAuthorization[]>
  add(preAuthorization: PreAuthorization): Promise<void>
  remove(preAuthorization: PreAuthorization): Promise<void>
  removeAll(account: BaseWalletAccount): Promise<void>
}
