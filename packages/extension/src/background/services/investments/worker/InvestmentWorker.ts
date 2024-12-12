import type { AllowArray } from "starknet"
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import { AccountAddedEvent } from "../../../../shared/account/service/accountService/IAccountService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import type { IDebounceService } from "../../../../shared/debounce"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { KeyValueStorage } from "../../../../shared/storage"
import type {
  BaseWalletAccount,
  NetworkOnlyPlaceholderAccount,
} from "../../../../shared/wallet.model"
import { isNetworkOnlyPlaceholderAccount } from "../../../../shared/wallet.model"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import { Recovered } from "../../../wallet/recovery/IWalletRecoveryService"
import type { WalletRecoverySharedService } from "../../../wallet/recovery/WalletRecoverySharedService"
import type { IActivityService } from "../../activity/IActivityService"
import { Activities } from "../../activity/IActivityService"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"
import type { IBackgroundInvestmentService } from "../IBackgroundInvestmentService"
import {
  addressSchema,
  bigDecimal,
  ensureArray,
  prettifyCurrencyNumber,
} from "@argent/x-shared"
import { parseDefiDecomposition } from "../../../../shared/defiDecomposition/helpers/parseDefiDecomposition"
import { defaultNetwork } from "../../../../shared/network"
import type { ITokenService } from "../../../../shared/token/__new/service/ITokenService"
import type { ActivitiesPayload } from "../../../../shared/activity/types"

export class InvestmentWorker {
  constructor(
    private readonly walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly investmentService: IBackgroundInvestmentService,
    private readonly accountService: IAccountService,
    private readonly tokensService: ITokenService,
    private readonly activityService: IActivityService,
    private readonly recoverySharedService: WalletRecoverySharedService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly scheduleService: IScheduleService,
    private readonly debounceService: IDebounceService,
  ) {
    // Listen for account changes
    this.walletStore.subscribe(
      "selected",
      this.onSelectedAccountChange.bind(this),
    )
    // Listen for recovery event
    this.recoverySharedService.emitter.on(
      Recovered,
      this.onRecovered.bind(this),
    )

    // Listen for new account added event
    this.accountService.emitter.on(
      AccountAddedEvent,
      this.runUpdatesForAccount.bind(this),
    )

    // Listen for  activities
    this.activityService.emitter.on(Activities, this.onActivity.bind(this))
  }

  runOnOpenAndUnlocked = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshIntervalInSeconds.FAST,
      "InvestmentsWorker.onOpenAndUnlocked",
    ), // This will run the function when the wallet is opened and unlocked, debounced to 20s
  )(async () => {
    const selectedAccount = await this.getSelectedAccount()
    if (!selectedAccount || isNetworkOnlyPlaceholderAccount(selectedAccount)) {
      return
    }
    this.runUpdatesForAccount(selectedAccount)
  })

  async getSelectedAccount() {
    const selectedAccount = await this.walletStore.get("selected")
    return selectedAccount
  }

  async onSelectedAccountChange(
    account?: BaseWalletAccount | NetworkOnlyPlaceholderAccount | null,
  ) {
    if (!account || isNetworkOnlyPlaceholderAccount(account)) {
      return
    }
    this.runUpdatesForAccount(account)
  }

  async onRecovered(accounts: BaseWalletAccount[]) {
    await this.fetchAndUpdateInvestmentsForAccount(accounts)
  }

  runUpdatesForAccount(account: BaseWalletAccount) {
    void this.fetchAndUpdateInvestmentsForAccount(account)
  }

  // After detecting new successful activity, DeFi positions are fetched 5 times at 1-second intervals
  async onActivity({ account }: ActivitiesPayload) {
    await this.pollInvestments(account)
  }

  async fetchAndUpdateInvestmentsForAccount(
    accounts: AllowArray<BaseWalletAccount>,
  ) {
    // Run only for default network
    const defaultNetworkAccounts = ensureArray(accounts).filter(
      (a) => a.networkId === defaultNetwork.id,
    )

    const tokens = await this.tokensService.getTokens(
      (t) => t.networkId === defaultNetwork.id,
    )

    const investments = await Promise.all(
      defaultNetworkAccounts.map(async (acc) => {
        const investments =
          await this.investmentService.fetchInvestmentsForAccount(acc.address)
        const parsedInvestments = parseDefiDecomposition(
          investments,
          acc,
          tokens,
        )
        return {
          address: addressSchema.parse(acc.address),
          networkId: acc.networkId,
          defiDecomposition: parsedInvestments,
        }
      }),
    )

    await this.investmentService.updateInvestmentsForAccounts(investments)
  }

  async pollInvestments(
    accounts: AllowArray<BaseWalletAccount>,
    attempts = 5,
    interval = 1000,
  ) {
    for (let i = 0; i < attempts; i++) {
      // Implement ETag caching when available
      await this.fetchAndUpdateInvestmentsForAccount(accounts)

      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    }
  }

  runOnOpenAndUnlockedStakingEnabled = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshIntervalInSeconds.MEDIUM,
      "InvestmentsWorker.onOpenAndUnlockedStakingEnabled",
    ), // This will run the function when the wallet is opened and unlocked, debounced to 1m
  )(async () => {
    const stakingInvestments =
      await this.investmentService.getStrkDelegatedStakingInvestments()
    const stakingEnabled = stakingInvestments.some(
      (investment) => investment.buyEnabled || investment.sellEnabled,
    )

    const apyPercentage =
      prettifyCurrencyNumber(
        bigDecimal.formatUnits(
          bigDecimal.mul(
            bigDecimal.parseUnits(
              stakingInvestments[0].metrics.totalApy ?? "0",
            ),
            bigDecimal.toBigDecimal(100, 0),
          ),
        ),
      ) || "0"

    void this.investmentService.updateStakingEnabled(stakingEnabled)
    void this.investmentService.updateStakingApyPercentage(apyPercentage)
  })
}
