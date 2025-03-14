import { accountsEqual } from "../utils/accountsEqual"
import {
  baseWalletAccountSchema,
  type BaseWalletAccount,
} from "../wallet.model"
import {
  isEqualPreAuthorization,
  preAuthorizationHostSchema,
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
    if (
      preAuthorizationSchema.safeParse(preAuthorization).success || // Check if its fully valid
      // Check if the host is valid but the account doesn't have an id.
      // This case will be handled by the accountsEqual function
      (preAuthorizationHostSchema.safeParse(preAuthorization.host).success &&
        !("id" in preAuthorization.account))
    ) {
      await this.preAuthorizationRepo.remove(preAuthorization)
      return
    }

    throw new Error("Invalid preAuthorization")
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
