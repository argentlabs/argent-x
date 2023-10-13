import { getAccountIdentifier } from "@argent/shared"
import { IScheduleService } from "../../schedule/interface"
import { WalletAccount } from "../../wallet.model"
import { getAccountClassHashFromChain } from "../details/getAccountClassHashFromChain"
import { getAccountCairoVersionFromChain } from "../details/getAccountCairoVersionFromChain"
import { IAccountService } from "../service/interface"
import { isUndefined, keyBy } from "lodash-es"
import { RefreshInterval } from "../../config"

type TaskId = "accountUpdate"

export class AccountWorker {
  constructor(
    private readonly accountService: IAccountService,
    private readonly scheduleService: IScheduleService<TaskId>,
  ) {
    void this.scheduleService.registerImplementation({
      id: "accountUpdate",
      callback: this.updateAll.bind(this),
    })

    void this.scheduleService.every(
      RefreshInterval.SLOW, // 5 minutes
      {
        id: "accountUpdate",
      },
    )

    // required for the initial update and to prevent tests from failing
    setTimeout(() => {
      void this.updateImmediately()
    }, 100)
  }

  async updateAll(): Promise<void> {
    // Keeping the promises sequential here as both the functions use upsert
    // Using upsert in parallel can cause unexpected results
    await this.updateDeployed()
    await this.updateAccountClassHash()
    await this.updateAccountCairoVersion()
  }

  async updateImmediately(): Promise<void> {
    await this.updateAccountClassHashImmediately()
    await this.updateAccountCairoVersionImmediately()
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
}
