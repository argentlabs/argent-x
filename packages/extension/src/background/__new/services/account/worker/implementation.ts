import { getAccountIdentifier } from "@argent/shared"
import { IScheduleService } from "../../../../../shared/schedule/interface"
import { WalletAccount } from "../../../../../shared/wallet.model"
import { getAccountClassHashFromChain } from "../../../../../shared/account/details/getAccountClassHashFromChain"
import { getAccountCairoVersionFromChain } from "../../../../../shared/account/details/getAccountCairoVersionFromChain"
import { IAccountService } from "../../../../../shared/account/service/interface"
import { isUndefined, keyBy } from "lodash-es"
import {
  onInstallAndUpgrade,
  onStartup,
} from "../../worker/schedule/decorators"

import { AllowArray } from "../../../../../shared/storage/__new/interface"
import { pipe } from "../../worker/schedule/pipe"
import { IBackgroundUIService } from "../../ui/interface"
import { IDebounceService } from "../../../../../shared/debounce"
import { getOwnerForAccount } from "../../../../../shared/account/details/getOwner"
import {
  IActivityService,
  SecurityActivityPayload,
  SignerChangedActivity,
} from "../../activity/interface"

export enum AccountUpdaterTaskId {
  UPDATE_DEPLOYED = "accountUpdateDeployed",
  ACCOUNT_UPDATE_ON_STARTUP = "accountUpdateOnStartup",
  ACCOUNT_UPDATE_ON_INSTALL_AND_UPGRADE = "accountUpdateOnInstallAndUpgrade",
}

enum AccountUpdaterTask {
  UPDATE_DEPLOYED,
  UPDATE_ACCOUNT_CLASS_HASH,
  UPDATE_ACCOUNT_CAIRO_VERSION,
}

export class AccountWorker {
  constructor(
    private readonly accountService: IAccountService,
    private readonly activityService: IActivityService,
    private readonly scheduleService: IScheduleService<AccountUpdaterTaskId>,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly debounceService: IDebounceService,
  ) {
    this.activityService.emitter.on(
      SignerChangedActivity,
      this.onSignerChanged.bind(this),
    )
  }

  runUpdaterForAllTasks = pipe(
    onInstallAndUpgrade(this.scheduleService), // This will run the function on install and upgrade
  )(async (): Promise<void> => {
    await this.runUpdaterTask([
      AccountUpdaterTask.UPDATE_DEPLOYED,
      AccountUpdaterTask.UPDATE_ACCOUNT_CLASS_HASH,
      AccountUpdaterTask.UPDATE_ACCOUNT_CAIRO_VERSION,
    ])
  })

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
      }
    }
  }

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

  async updateAccountCairoVersion(): Promise<void> {
    const accounts = await this.accountService.get()

    const accountsWithCairoVersion = await getAccountCairoVersionFromChain(
      accounts,
    )

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

  async updateAccountClassHashImmediately(): Promise<void> {
    const accounts = await this.accountService.get()
    const needsImmediateUpdate = accounts.some((account) =>
      isUndefined(account.classHash),
    )
    if (needsImmediateUpdate) {
      // Let's keep console.log here for now, as it's a critical path.
      // It will be removed in Prod.
      console.log("Updating account class hash immediately")
      await this.updateAccountClassHash()
    } else {
      console.log("Account class hash up to date")
    }
  }

  async updateAccountCairoVersionImmediately(): Promise<void> {
    const accounts = await this.accountService.get()
    // Using every here, because we don't want to fetch the cairo version for undeployed accounts
    const needsImmediateUpdate = accounts.every((account) =>
      isUndefined(account.cairoVersion),
    )
    if (needsImmediateUpdate) {
      // Let's keep console.log here for now, as it's a critical path.
      // It will be removed in Prod.
      console.log("Updating account cairo version immediately")
      await this.updateAccountCairoVersion()
    } else {
      console.log("Account cairo version up to date")
    }
  }

  async onSignerChanged(payload: SecurityActivityPayload) {
    const accounts = await this.accountService.getFromBaseWalletAccounts(
      payload,
    )
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
}
