import { getAccountIdentifier } from "@argent/x-shared"
import { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import {
  ArgentAccountType,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { getAccountClassHashFromChain } from "../../../../shared/account/details/getAccountClassHashFromChain"
import { getAccountCairoVersionFromChain } from "../../../../shared/account/details/getAccountCairoVersionFromChain"
import { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import { keyBy } from "lodash-es"
import { onInstallAndUpgrade } from "../../worker/schedule/decorators"

import { AllowArray } from "../../../../shared/storage/__new/interface"
import { pipe } from "../../worker/schedule/pipe"
import { getOwnerForAccount } from "../../../../shared/account/details/getOwner"
import {
  GuardianChangedActivity,
  IActivityService,
  AccountActivityPayload,
  SignerChangedActivity,
  AccountDeployActivity,
} from "../../activity/IActivityService"
import { getGuardianForAccount } from "../../../../shared/account/details/getGuardian"

export enum AccountUpdaterTaskId {
  UPDATE_DEPLOYED = "accountUpdateDeployed",
  ACCOUNT_UPDATE_ON_STARTUP = "accountUpdateOnStartup",
  ACCOUNT_UPDATE_ON_INSTALL_AND_UPGRADE = "accountUpdateOnInstallAndUpgrade",
}

enum AccountUpdaterTask {
  UPDATE_DEPLOYED,
  UPDATE_ACCOUNT_CLASS_HASH,
  UPDATE_ACCOUNT_CAIRO_VERSION,
  UPDATE_ACCOUNT_GUARDIAN,
}

export class AccountWorker {
  constructor(
    private readonly accountService: IAccountService,
    private readonly activityService: IActivityService,
    private readonly scheduleService: IScheduleService<AccountUpdaterTaskId>,
  ) {
    this.activityService.emitter.on(
      SignerChangedActivity,
      this.onSignerChanged.bind(this),
    )
    this.activityService.emitter.on(
      AccountDeployActivity,
      this.updateDeployed.bind(this),
    )
    this.activityService.emitter.on(
      GuardianChangedActivity,
      this.onGuardianChanged.bind(this),
    )
  }

  runUpdaterForAllTasks = pipe(
    onInstallAndUpgrade(this.scheduleService), // This will run the function on install and upgrade
  )(async (): Promise<void> => {
    await this.runUpdaterTask([
      AccountUpdaterTask.UPDATE_DEPLOYED,
      AccountUpdaterTask.UPDATE_ACCOUNT_CLASS_HASH,
      AccountUpdaterTask.UPDATE_ACCOUNT_CAIRO_VERSION,
      AccountUpdaterTask.UPDATE_ACCOUNT_GUARDIAN,
    ])
  })

  /** @internal just exposed for testing */
  async runUpdaterTask(tasks: AllowArray<AccountUpdaterTask>): Promise<void> {
    const updaterTasks = Array.isArray(tasks) ? tasks : [tasks]
    for (const task of updaterTasks) {
      switch (task) {
        case AccountUpdaterTask.UPDATE_DEPLOYED:
          await this.updateDeployed()
          break
        case AccountUpdaterTask.UPDATE_ACCOUNT_CLASS_HASH:
          await this.updateAccountClassHash()
          break
        case AccountUpdaterTask.UPDATE_ACCOUNT_CAIRO_VERSION:
          await this.updateAccountCairoVersion()
          break
        case AccountUpdaterTask.UPDATE_ACCOUNT_GUARDIAN:
          await this.updateAccountGuardian()
      }
    }
  }

  /** @internal just exposed for testing */
  async updateDeployed(): Promise<void> {
    const accounts = await this.accountService.get(
      (account) => account.needsDeploy !== false,
    )

    const deployStatuses = await Promise.allSettled(
      accounts.map((account) =>
        this.accountService.getDeployed(account).then((deployed) => ({
          deployed,
          account,
        })),
      ),
    )

    const newlyDeployedAccounts = deployStatuses.reduce<WalletAccount[]>(
      (acc, status) => {
        if (status.status === "fulfilled" && status.value.deployed) {
          acc.push({ ...status.value.account, needsDeploy: false })
        }
        return acc
      },
      [],
    )

    await this.accountService.upsert(newlyDeployedAccounts)
  }

  /** @internal just exposed for testing */
  async updateAccountClassHash(): Promise<void> {
    const accounts = await this.accountService.get()

    const accountsWithClassHash = await getAccountClassHashFromChain(accounts)

    // Create a map to store accountWithClassHash with key as unique account id.
    const accountsWithClassHashMap = keyBy(
      accountsWithClassHash,
      getAccountIdentifier,
    )

    const updated = accounts.map((account) => {
      const id = getAccountIdentifier(account)
      return accountsWithClassHashMap[id]
        ? { ...account, ...accountsWithClassHashMap[id] }
        : account
    })

    await this.accountService.upsert(updated)
  }

  /** @internal just exposed for testing */
  async updateAccountCairoVersion(): Promise<void> {
    const accounts = await this.accountService.get()

    const accountsWithCairoVersion =
      await getAccountCairoVersionFromChain(accounts)

    // Create a map to store accountWithCairoVersion with key as unique account id.
    const accountsWithCairoVersionMap = keyBy(
      accountsWithCairoVersion,
      getAccountIdentifier,
    )

    const updated = accounts.map((account) => {
      const id = getAccountIdentifier(account)
      return accountsWithCairoVersionMap[id]
        ? { ...account, ...accountsWithCairoVersionMap[id] }
        : account
    })

    await this.accountService.upsert(updated)
  }

  async updateAccountGuardian() {
    const accounts = await this.accountService.get()

    await this.updateGuardianForAccounts(accounts)
  }

  async onSignerChanged(payload: AccountActivityPayload) {
    const accounts =
      await this.accountService.getFromBaseWalletAccounts(payload)
    const results = await Promise.allSettled(
      accounts.map((account) => {
        return getOwnerForAccount(account)
      }),
    )
    const updated = accounts.map((account, index) => {
      const result = results[index]
      const owner = result.status === "fulfilled" ? result.value : undefined
      return {
        ...account,
        owner,
      }
    })
    await this.accountService.upsert(updated)
  }

  async onGuardianChanged(payload: AccountActivityPayload) {
    const accounts =
      await this.accountService.getFromBaseWalletAccounts(payload)
    await this.updateGuardianForAccounts(accounts)
  }

  private async updateGuardianForAccounts(accounts: WalletAccount[]) {
    const results = await Promise.allSettled(
      accounts
        .filter((account) => !account.needsDeploy)
        .map((account) => {
          return getGuardianForAccount(account)
        }),
    )

    const updated = accounts.map((account, index) => {
      const result = results[index]
      const onChainGuardian =
        result?.status === "fulfilled" ? result?.value : undefined
      const guardian =
        account.needsDeploy && account.guardian
          ? account.guardian
          : onChainGuardian

      // we need to update the type to smart if guardian is enabled, or to standard if the guardian is disabled
      let updatedType: ArgentAccountType | undefined
      if (guardian) {
        updatedType = "smart"
      } else if (account.type === "smart") {
        updatedType = "standard"
      }

      return {
        ...account,
        guardian,
        ...(updatedType ? { type: updatedType } : {}),
      }
    })
    await this.accountService.upsert(updated)
  }
}
