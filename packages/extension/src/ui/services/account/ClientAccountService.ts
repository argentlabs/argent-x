import { CallData, num } from "starknet"
import { IAccountRepo } from "../../../shared/account/store"
import { IMultisigService } from "../../../shared/multisig/service/messaging/IMultisigService"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  NetworkOnlyPlaceholderAccount,
  SignerType,
  WalletAccount,
  baseWalletAccountSchema,
  networkOnlyPlaceholderAccountSchema,
} from "../../../shared/wallet.model"
import { ZERO_MULTISIG } from "../../features/multisig/constants"

import { messageClient } from "../trpc"
import { IClientAccountService } from "./IClientAccountService"
import { ISettingsStorage } from "../../../shared/settings/types"
import { KeyValueStorage } from "../../../shared/storage"

import { ampli } from "../../../shared/analytics"
import { hexSchema } from "@argent/x-shared"
import { IMultisigBaseWalletRepositary } from "../../../shared/multisig/types"
import { OnboardingCohort } from "../onboarding/useOnboardingExperiment"

export class ClientAccountService implements IClientAccountService {
  constructor(
    private readonly accountRepo: IAccountRepo,
    private readonly multisigBaseRepo: IMultisigBaseWalletRepositary,
    private readonly multisigService: IMultisigService,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {
    // TBD: Does it make sense to somehow inject the trpc client? I'm not sure, as that service would need to match the expected endpoints 1:1
  }

  async select(
    baseAccount: BaseWalletAccount | NetworkOnlyPlaceholderAccount,
  ): Promise<void> {
    let parsedAccount = baseAccount

    if (parsedAccount) {
      parsedAccount = baseWalletAccountSchema
        .or(networkOnlyPlaceholderAccountSchema)
        .parse(baseAccount)
    }

    return messageClient.account.select.mutate(parsedAccount)
  }

  async create(
    type: CreateAccountType,
    signerType: SignerType,
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
        signerType,
      })
      newAccount = account
    } else {
      newAccount = await messageClient.account.create.mutate({
        networkId,
        type,
        signerType,
      })
    }

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

  async remove(baseAccount: BaseWalletAccount): Promise<void> {
    const [account] = await this.accountRepo.get((a) =>
      accountsEqual(a, baseAccount),
    )
    if (!account) {
      throw new Error("Account not found")
    }
    if (
      account.type !== "multisig" ||
      account.signer.type !== SignerType.LEDGER
    ) {
      throw new Error("Only multisig accounts with ledger can be removed")
    }
    await this.accountRepo.remove((a) => accountsEqual(a, baseAccount))
    await this.multisigBaseRepo.remove((a) => accountsEqual(a, baseAccount))
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

  async acceptTerms({
    onboardingExperimentCohort,
  }: {
    onboardingExperimentCohort: OnboardingCohort
  }) {
    await this.settingsStore.set("privacyShareAnalyticsData", true)
    ampli.onboardingAnalyticsDecided({
      "analytics activated": true,
      "wallet platform": "browser extension",
      "onboarding experiment": onboardingExperimentCohort,
    })
    ampli.client.setOptOut(false)
  }
  async refuseTerms({
    onboardingExperimentCohort,
  }: {
    onboardingExperimentCohort: OnboardingCohort
  }) {
    ampli.onboardingAnalyticsDecided({
      "analytics activated": false,
      "wallet platform": "browser extension",
      "onboarding experiment": onboardingExperimentCohort,
    })
    await this.settingsStore.set("privacyShareAnalyticsData", false)
    ampli.client.setOptOut(true)
  }

  async getLastUsedAccountOnNetwork(
    networkId: string,
  ): Promise<BaseWalletAccount | undefined> {
    return messageClient.account.getLastUsedOnNetwork.query({ networkId })
  }
}
