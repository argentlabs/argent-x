import { accountsEqual } from "../utils/accountsEqual"
import {
  baseWalletAccountSchema,
  type BaseWalletAccount,
} from "../wallet.model"
import {
  isEqualPreAuthorization,
  preAuthorizationSchema,
  type PreAuthorization,
} from "./schema"
import type { IPreAuthorizationRepo } from "./store"
import type { IPreAuthorizationService } from "./IPreAuthorizationService"

export class PreAuthorizationService implements IPreAuthorizationService {
  constructor(private readonly preAuthorizationRepo: IPreAuthorizationRepo) {}

  async isPreAuthorized(maybePreAuthorization: Partial<PreAuthorization>) {
    const hits = await this.preAuthorizationRepo.get((preAuthorization) =>
      isEqualPreAuthorization(preAuthorization, maybePreAuthorization),
    )
    return Boolean(hits.length)
  }

  async hasBeenPreAuthorizedOnce(host: string) {
    const hits = await this.preAuthorizationRepo.get(
      (preAuthorization) => preAuthorization.host === host,
    )
    return Boolean(hits.length)
  }

  async getAll() {
    return this.preAuthorizationRepo.get()
  }

  async add(preAuthorization: PreAuthorization) {
    preAuthorizationSchema.parse(preAuthorization)
    await this.preAuthorizationRepo.upsert(preAuthorization)
  }

  async remove(preAuthorization: PreAuthorization) {
    preAuthorizationSchema.parse(preAuthorization)
    await this.preAuthorizationRepo.remove(preAuthorization)
  }

  async removeAll(account: BaseWalletAccount) {
    baseWalletAccountSchema.parse(account)
    const preAuthorizationToRemove = await this.preAuthorizationRepo.get(
      (preAuthorization) => accountsEqual(preAuthorization.account, account),
    )
    await this.preAuthorizationRepo.remove(preAuthorizationToRemove)
    return preAuthorizationToRemove
  }
}
