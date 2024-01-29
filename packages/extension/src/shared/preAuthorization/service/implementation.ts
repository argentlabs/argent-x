import { accountsEqual } from "../../utils/accountsEqual"
import {
  baseWalletAccountSchema,
  type BaseWalletAccount,
} from "../../wallet.model"
import {
  isEqualPreAuthorization,
  preAuthorizationSchema,
  type PreAuthorization,
} from "../schema"
import type { IPreAuthorizationRepo } from "../store"
import type { IPreAuthorizationService } from "./interface"

export class PreAuthorizationService implements IPreAuthorizationService {
  constructor(private readonly preAuthorizationRepo: IPreAuthorizationRepo) {}

  async isPreAuthorized(maybePreAuthorization: Partial<PreAuthorization>) {
    const hits = await this.preAuthorizationRepo.get((preAuthorization) =>
      isEqualPreAuthorization(preAuthorization, maybePreAuthorization),
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
    await this.preAuthorizationRepo.remove((preAuthorization) =>
      accountsEqual(preAuthorization.account, account),
    )
  }
}
