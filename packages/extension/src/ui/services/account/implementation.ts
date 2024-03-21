import { CallData, num } from "starknet"
import { IAccountRepo } from "../../../shared/account/store"
import { IMultisigService } from "../../../shared/multisig/service/messaging/interface"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  WalletAccount,
  baseWalletAccountSchema,
} from "../../../shared/wallet.model"
import { ZERO_MULTISIG } from "../../features/multisig/constants"

import { messageClient } from "../messaging/trpc"
import { IAccountService } from "./interface"
import { ISettingsStorage } from "../../../shared/settings/types"
import { KeyValueStorage } from "../../../shared/storage"

import { analyticsService } from "../../../shared/analytics"
import { hexSchema } from "@argent/x-shared"

export class ClientAccountService implements IAccountService {
  constructor(
    private readonly accountRepo: IAccountRepo,
    private readonly multisigService: IMultisigService,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {
    // TBD: Does it make sense to somehow inject the trpc client? I'm not sure, as that service would need to match the expected endpoints 1:1
  }

  async select(baseAccount: BaseWalletAccount | null): Promise<void> {
    let parsedAccount = baseAccount

    if (parsedAccount) {
      parsedAccount = baseWalletAccountSchema.parse(baseAccount)
    }

    return messageClient.account.select.mutate(parsedAccount)
  }

  async create(
    type: CreateAccountType,
    networkId: string,
    multisigPayload: MultisigData = ZERO_MULTISIG,
  ): Promise<WalletAccount> {
    if (type === "multisig" && !multisigPayload) {
      throw new Error("Multisig payload is required")
    }

    let newAccount: CreateWalletAccount | WalletAccount
    if (type === "multisig") {
      const { account } = await this.multisigService.addAccount({
        ...multisigPayload,
        networkId,
      })
      newAccount = account
    } else {
      newAccount = await messageClient.account.create.mutate({
        networkId,
        type,
      })
    }
    analyticsService.accountCreated({
      "account type": type,
      "account index": newAccount.index?.toString() || "0",
    })
    // get WalletAccount format
    const [hit] = await this.accountRepo.get((account) =>
      accountsEqual(account, newAccount),
    )

    if (!hit) {
      throw new Error("Something went wrong")
    }

    // switch background wallet to the account that was selected
    await this.select(newAccount)

    return hit
  }

  async deploy(baseAccount: BaseWalletAccount): Promise<void> {
    const [account] = await this.accountRepo.get((account) =>
      accountsEqual(account, baseAccount),
    )

    if (!account) {
      throw new Error("Account not found")
    }

    if (account.needsDeploy === false) {
      throw new Error("Account already deployed")
    }

    if (account.type === "multisig") {
      await this.multisigService.deploy(account)
    } else {
      await messageClient.account.deploy.mutate(account)
    }
  }

  async upgrade(
    baseWalletAccount: BaseWalletAccount,
    targetImplementationType?: ArgentAccountType | undefined,
  ): Promise<void> {
    const baseAccount = baseWalletAccountSchema.parse(baseWalletAccount)
    const [account] = await this.accountRepo.get((a) =>
      accountsEqual(a, baseAccount),
    )
    const [upgradeNeeded, correctAcc] =
      await messageClient.account.upgrade.mutate({
        account,
        targetImplementationType,
      })

    if (!upgradeNeeded) {
      // This means we have incorrect state locally, and we should update it with onchain state
      await this.accountRepo.upsert(correctAcc)
    }
  }

  async getAccountDeploymentPayload(account: BaseWalletAccount) {
    const accountDeployPayload =
      await messageClient.accountMessaging.getAccountDeploymentPayload.query({
        account,
      })

    if (accountDeployPayload === null) {
      // This code should be unreachable, as the extension will always get the deployment data back. The method above only returns null if the account is not deployed and the sender is not the extension, aka if it's an external dapp
      throw new Error("This should never happen")
    }

    return {
      type: "DEPLOY_ACCOUNT" as const,
      calldata: CallData.toCalldata(accountDeployPayload.constructorCalldata),
      classHash: hexSchema.parse(num.toHex(accountDeployPayload.classHash)),
      salt: hexSchema.parse(num.toHex(accountDeployPayload.addressSalt || 0)),
      signature: [],
    }
  }

  async acceptTerms() {
    analyticsService.onboardingAnalyticsDecided({ "analytics activated": true })
    void this.settingsStore.set("privacyShareAnalyticsData", true)
  }
  async refuseTerms() {
    analyticsService.onboardingAnalyticsDecided({
      "analytics activated": false,
    })
    void this.settingsStore.set("privacyShareAnalyticsData", false)
    analyticsService.client.setOptOut(true)
  }
}
