import { map } from "rxjs/operators"
import {
  getAccountIdentifier,
  includesAddress,
  stripAddressZeroPadding,
  type Address,
  type IHttpService,
} from "@argent/x-shared"
import type Emittery from "emittery"

import type { IAccountService } from "../../../shared/account/service/accountService/IAccountService"
import type {
  ActivitiesPayload,
  IActivityStorage,
} from "../../../shared/activity/types"
import { ARGENT_API_BASE_URL } from "../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../shared/api/headers"
import { RefreshIntervalInSeconds } from "../../../shared/config"
import type { IDebounceService } from "../../../shared/debounce"
import { ActivityError } from "../../../shared/errors/activity"
import type { IScheduleService } from "../../../shared/schedule/IScheduleService"
import type { IObjectStore } from "../../../shared/storage/__new/interface"
import type { INftsContractsRepository } from "../../../shared/nft/store"
import type { ITokenService } from "../../../shared/token/__new/service/ITokenService"
import { urlWithQuery } from "../../../shared/utils/url"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import type { Wallet } from "../../wallet"
import type { IBackgroundUIService } from "../ui/IBackgroundUIService"
import { everyWhenOpen, onAccountChanged } from "../worker/schedule/decorators"
import { pipe } from "../worker/schedule/pipe"
import {
  AccountUpgradedActivity,
  Activities,
  CancelEscapeActivity,
  EscapeGuardianActivity,
  EscapeSignerActivity,
  GuardianBackupChangedActivity,
  GuardianChangedActivity,
  MultisigConfigurationUpdatedActivity,
  NftActivity,
  SignerChangedActivity,
  TokenActivity,
  TriggerEscapeGuardianActivity,
  TriggerEscapeSignerActivity,
  type Events,
  type IActivityService,
  AccountDeployActivity,
  NewTokenActivity,
} from "./IActivityService"
import {
  isActivityDetailsAction,
  type ActivityDetailsAction,
  type ActivityResponse,
  getOverallLastModified,
  parseFinanceActivities,
  parseAccountActivities,
} from "@argent/x-shared/simulation"
import type { IKeyValueStorage } from "../../../shared/storage"
import type { WalletStorageProps } from "../../wallet/backup/WalletBackupService"
import { BaseToken } from "../../../shared/token/__new/types/token.model"

/** maps activity details action to an equivalent Event to emit */

const eventByActivityDetailsAction = {
  triggerEscapeGuardian: TriggerEscapeGuardianActivity,
  triggerEscapeSigner: TriggerEscapeSignerActivity,
  escapeGuardian: EscapeGuardianActivity,
  escapeSigner: EscapeSignerActivity,
  guardianChanged: GuardianChangedActivity,
  guardianBackupChanged: GuardianBackupChangedActivity,
  signerChanged: SignerChangedActivity,
  cancelEscape: CancelEscapeActivity,
  accountUpgraded: AccountUpgradedActivity,
  multisigConfigurationUpdated: MultisigConfigurationUpdatedActivity,
} as const satisfies Record<ActivityDetailsAction, keyof Events>

export class ActivityService implements IActivityService {
  constructor(
    readonly emitter: Emittery<Events>,
    private readonly activityStore: IObjectStore<IActivityStorage>,
    private readonly walletSingleton: Wallet,
    private readonly accountService: IAccountService,
    private readonly tokenService: ITokenService,
    private readonly nftsContractsRepository: INftsContractsRepository,
    private readonly httpService: IHttpService,
    private readonly scheduleService: IScheduleService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly debounceService: IDebounceService,
    private readonly old_walletStore: IKeyValueStorage<WalletStorageProps>,
  ) {}

  runUpdateSelectedAccountActivities = pipe(
    onAccountChanged(this.old_walletStore),
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshIntervalInSeconds.FAST,
      "ActivityService.updateSelectedAccountActivities",
    ),
  )(async () => {
    await this.updateSelectedAccountActivities()
  })

  async updateSelectedAccountActivities() {
    const account = await this.walletSingleton.getSelectedAccount()
    if (!account) {
      return
    }
    return this.updateAccountActivities(account)
  }

  async updateAccountActivities(account: BaseWalletAccount) {
    const activities = await this.fetchAccountActivities(account)
    if (activities === undefined) {
      return
    }
    await this.processAndEmitActivities({
      account,
      activities,
    })
    return activities
  }

  async fetchAccountActivities(
    account?: BaseWalletAccount,
    updateModifiedAfter = true,
  ) {
    const apiBaseUrl = ARGENT_API_BASE_URL
    if (!account || !apiBaseUrl) {
      return
    }
    const argentApiNetwork = argentApiNetworkForNetwork(account.networkId)
    if (!argentApiNetwork) {
      return
    }
    const modifiedAfter = (await this.getModifiedAfter(account)) ?? 0
    const url = urlWithQuery(
      [
        apiBaseUrl,
        "activity",
        "starknet",
        argentApiNetwork,
        "account",
        stripAddressZeroPadding(account.address),
        "activities",
      ],
      {
        modifiedAfter,
      },
    )
    const response = await this.httpService.get<ActivityResponse>(url)
    if (!response) {
      throw new ActivityError({ code: "FETCH_FAILED" })
    }

    const { activities } = response
    if (updateModifiedAfter) {
      const overallLastModified = getOverallLastModified(activities)
      if (overallLastModified) {
        await this.setModifiedAfter(account, overallLastModified)
      }
    }
    return activities
  }

  async processAndEmitActivities({
    account: activityAccount,
    activities,
  }: ActivitiesPayload) {
    /** emit raw activities first */
    void this.emitter.emit(Activities, {
      account: activityAccount,
      activities,
    })

    const accountsOnNetwork = await this.accountService.get(
      (a) => a.networkId === activityAccount.networkId,
    )
    const tokensOnNetwork = await this.tokenService.getTokens(
      (a) => a.networkId === activityAccount.networkId,
    )
    const nftsOnNetwork = await this.nftsContractsRepository.get(
      (contract) => contract.networkId === activityAccount.networkId,
    )

    /**
     * activities payload is always for a single network,
     * so we use only addresses for simplicity
     * then rehydrate back to instances before emitting
     */

    const accountAddressesOnNetwork = accountsOnNetwork.map(
      (account) => account.address as Address,
    )
    const tokenAddressesOnNetwork = tokensOnNetwork.map(
      (token) => token.address,
    )
    const nftAddressesOnNetwork = nftsOnNetwork.map(
      (nft) => nft.contractAddress as Address,
    )

    /** ignore any "failure" */

    const filteredActivities = activities.filter(
      (activity) => activity.status !== "failure",
    )
    if (!filteredActivities.length) {
      return
    }

    /** finance events */

    const { nftActivity, tokenActivity } = parseFinanceActivities({
      activities: filteredActivities,
      accountAddressesOnNetwork,
      tokenAddressesOnNetwork,
      nftAddressesOnNetwork,
    })

    /** rehydrate the assets and accounts - these are already filtered to same network */

    const tokenAccounts = accountsOnNetwork.filter((account) =>
      includesAddress(account.address, tokenActivity.accountAddresses),
    )
    const tokens = tokensOnNetwork.filter((token) =>
      includesAddress(token.address, tokenActivity.tokenAddresses),
    )

    const nftAccounts = accountsOnNetwork.filter((account) =>
      includesAddress(account.address, nftActivity.accountAddresses),
    )
    const nfts = nftsOnNetwork.filter((token) =>
      includesAddress(token.contractAddress, nftActivity.tokenAddresses),
    )

    const newTokens: BaseToken[] = tokenActivity.newTokenAddresses.map(
      (address: Address) => ({
        address,
        networkId: activityAccount.networkId,
      }),
    )

    if (tokenAccounts.length && tokens.length) {
      void this.emitter.emit(TokenActivity, {
        accounts: tokenAccounts,
        tokens,
      })
    }

    if (nftAccounts.length && nfts.length) {
      void this.emitter.emit(NftActivity, {
        accounts: nftAccounts,
        nfts,
      })
    }

    if (newTokens.length) {
      void this.emitter.emit(NewTokenActivity, {
        tokens: newTokens,
      })
    }

    /** security */

    const accountAddressesByAction = parseAccountActivities({
      activities: filteredActivities,
      accountAddressesOnNetwork,
    })
    Object.entries(accountAddressesByAction).forEach(([action, addresses]) => {
      if (isActivityDetailsAction(action)) {
        const event = eventByActivityDetailsAction[action]
        /** rehydrate accounts */
        const accounts = accountsOnNetwork.filter((account) =>
          includesAddress(account.address, addresses),
        )
        if (accounts.length) {
          void this.emitter.emit(event, accounts)
        }
      } else if (action === "deploy") {
        const accounts = accountsOnNetwork.filter((account) =>
          includesAddress(account.address, addresses),
        )
        if (accounts.length) {
          void this.emitter.emit(AccountDeployActivity, accounts)
        }
      }
    })
  }

  async getModifiedAfter(
    account: BaseWalletAccount,
  ): Promise<number | undefined> {
    const { modifiedAfter } = await this.activityStore.get()
    const key = getAccountIdentifier(account)
    return modifiedAfter[key]
  }

  async setModifiedAfter(account: BaseWalletAccount, value: number) {
    const { modifiedAfter } = await this.activityStore.get()
    const key = getAccountIdentifier(account)
    modifiedAfter[key] = value
    await this.activityStore.set({ modifiedAfter })
  }
}
