import { RefreshInterval } from "../../../../../shared/config"
import type { IDebounceService } from "../../../../../shared/debounce"
import { defaultNetwork } from "../../../../../shared/network"
import type { INetworkService } from "../../../../../shared/network/service/interface"
import type { IScheduleService } from "../../../../../shared/schedule/interface"
import type { KeyValueStorage } from "../../../../../shared/storage"
import type {
  AllowArray,
  IRepository,
  StorageChange,
} from "../../../../../shared/storage/__new/interface"
import type { ITokenService } from "../../../../../shared/token/__new/service/interface"
import type { Token } from "../../../../../shared/token/__new/types/token.model"
import type { Transaction } from "../../../../../shared/transactions"
import { accountsEqual } from "../../../../../shared/utils/accountsEqual"
import { getSuccessfulTransactions } from "../../../../../shared/utils/transactionSucceeded"
import { BaseWalletAccount } from "../../../../../shared/wallet.model"
import type { WalletStorageProps } from "../../../../../shared/wallet/walletStore"
import { Recovered } from "../../../../wallet/recovery/interface"
import { WalletRecoverySharedService } from "../../../../wallet/recovery/shared.service"
import {
  TokenActivity,
  type IActivityService,
  type TokenActivityPayload,
} from "../../activity/interface"
import type { IBackgroundUIService } from "../../ui/interface"
import {
  every,
  everyWhenOpen,
  onInstallAndUpgrade,
  onStartup,
} from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"

const NETWORKS_WITH_BACKEND_SUPPORT = ["goerli-alpha", "mainnet-alpha"]

/**
 * This class is responsible for managing token updates, including token balances and prices.
 */
export class TokenWorker {
  constructor(
    private readonly walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly transactionsRepo: IRepository<Transaction>,
    private readonly tokenRepo: IRepository<Token>,
    private readonly tokenService: ITokenService,
    private readonly networkService: INetworkService,
    private readonly recoverySharedService: WalletRecoverySharedService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly scheduleService: IScheduleService,
    private readonly debounceService: IDebounceService,
    private readonly activityService: IActivityService,
  ) {
    // Listen for account changes
    this.walletStore.subscribe(
      "selected",
      this.onSelectedAccountChange.bind(this),
    )

    // Listen for transaction success
    this.transactionsRepo.subscribe(this.onTransactionRepoChange.bind(this))

    // Listen for token add / remove
    this.tokenRepo.subscribe(this.onTokenRepoChange.bind(this))

    // Listen for recovery event
    this.recoverySharedService.emitter.on(
      Recovered,
      this.onRecovered.bind(this),
    )

    // Listen for token activities
    this.activityService.emitter.on(
      TokenActivity,
      this.onTokenActivity.bind(this),
    )
  }

  async getSelectedAccount() {
    const selectedAccount = await this.walletStore.get("selected")
    return selectedAccount
  }

  /**
   * Update tokens
   * Fetches tokens for all networks and updates the token service
   */
  runFetchAndUpdateTokensFromBackend = pipe(
    onInstallAndUpgrade(this.scheduleService), // This will run the function on update
    every(
      this.scheduleService,
      RefreshInterval.VERY_SLOW,
      "TokenWorker.updateTokens",
    ), // This will run the function every 24 hours
  )(async (): Promise<void> => {
    await this.fetchAndUpdateTokensFromBackend()
  })

  /**
   * Update token balances for custom networks
   */
  runUpdateTokenBalancesForCustomNetworks = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.MEDIUM,
      "TokenWorker.updateCustomNetworksTokenBalances",
    ), // This will run the function every 60 seconds when the UI is open
  )(async () => {
    await this.updateTokenBalancesForCustomNetworks()
  })

  /**
   * Update token prices
   * Fetches token prices for the default network and updates the token service
   */
  runFetchAndUpdateTokenPricesFromBackend = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.MEDIUM,
      "TokenWorker.fetchAndUpdateTokenPricesFromBackend",
    ), // This will run the function every minute when the UI is open
  )(async (): Promise<void> => {
    await this.fetchAndUpdateTokenPricesFromBackend()
  })

  async onSelectedAccountChange(account?: BaseWalletAccount | null) {
    if (!account) {
      return
    }
    void this.maybeUpdateTokensFromBackendForAccount(account)
    void this.updateTokenBalancesFromOnChain(account)
  }

  async onTransactionRepoChange(changeSet: StorageChange<Transaction[]>) {
    if (!changeSet?.newValue) {
      return
    }
    const selectedAccount = await this.getSelectedAccount()
    if (!selectedAccount) {
      return
    }
    const successfulTransactions = getSuccessfulTransactions(
      changeSet.newValue,
      changeSet?.oldValue,
    )
    if (!successfulTransactions) {
      return
    }
    const successfulTransactionAccounts: BaseWalletAccount[] = []
    successfulTransactions.forEach((successfulTransaction) => {
      if (
        !successfulTransactionAccounts.some((account) =>
          accountsEqual(account, successfulTransaction.account),
        )
      ) {
        successfulTransactionAccounts.push(successfulTransaction.account)
      }
    })
    void this.updateTokenBalancesFromOnChain(successfulTransactionAccounts)
  }

  async onTokenRepoChange(_changeSet: StorageChange<Token[]>) {
    const selectedAccount = await this.getSelectedAccount()
    if (!selectedAccount) {
      return
    }
    await this.fetchAndUpdateTokenBalancesFromOnChain(selectedAccount)
    void this.fetchAndUpdateTokenPricesFromBackend()
  }

  async fetchAndUpdateTokensFromBackend() {
    const networks = await this.networkService.get()
    // Fetch tokens for all networks in parallel
    const tokensFromAllNetworks = await Promise.allSettled(
      networks.map((network) =>
        this.tokenService.fetchTokensFromBackend(network.id),
      ),
    )
    const tokens = tokensFromAllNetworks
      .map((result) => result.status === "fulfilled" && result.value)
      .filter((t): t is Token[] => Boolean(t))
      .flat()

    await this.tokenService.updateTokens(tokens)
  }

  async updateTokenBalancesFromOnChain(
    accounts?: AllowArray<BaseWalletAccount>,
  ) {
    if (!accounts) {
      const selectedAccount = await this.getSelectedAccount()
      if (!selectedAccount) {
        return
      }
      accounts = selectedAccount
    }

    const tokensWithBalance =
      await this.tokenService.fetchTokenBalancesFromOnChain(accounts)

    return await this.tokenService.updateTokenBalances(tokensWithBalance)
  }

  async maybeUpdateTokensFromBackendForAccount(account: BaseWalletAccount) {
    const tokens = await this.tokenService.getTokens(
      (t) => t.networkId === account.networkId && t.pricingId !== undefined,
    )

    if (!tokens.length) {
      await this.fetchAndUpdateTokensFromBackend()
    }
  }

  async fetchAndUpdateTokenBalancesFromOnChain(
    accounts: AllowArray<BaseWalletAccount>,
    tokens?: AllowArray<Token>,
  ) {
    const tokensWithBalances =
      await this.tokenService.fetchTokenBalancesFromOnChain(accounts, tokens)
    await this.tokenService.updateTokenBalances(tokensWithBalances)
  }

  async updateTokenBalancesForCustomNetworks() {
    const selectedAccount = await this.getSelectedAccount()
    if (!selectedAccount) {
      return
    }
    if (NETWORKS_WITH_BACKEND_SUPPORT.includes(selectedAccount.networkId)) {
      return
    }
    await this.fetchAndUpdateTokenBalancesFromOnChain(selectedAccount)
  }

  async fetchAndUpdateTokenPricesFromBackend() {
    // Token prices are only available for the default network
    const defaultNetworkId = defaultNetwork.id
    const tokens = await this.tokenService.getTokens(
      (t) => t.networkId === defaultNetworkId,
    )
    const tokenPrices = await this.tokenService.fetchTokenPricesFromBackend(
      tokens,
      defaultNetworkId,
    )
    await this.tokenService.updateTokenPrices(tokenPrices)
  }

  /**
   * Handle Recovery
   * Updates everything on recovery
   * @param recoveredAccounts -BaseWalletAccount[]
   */
  async onRecovered(recoveredAccounts: BaseWalletAccount[]) {
    if (recoveredAccounts.length > 0) {
      await this.fetchAndUpdateTokensFromBackend()
      await this.fetchAndUpdateTokenPricesFromBackend()
      await this.fetchAndUpdateTokenBalancesFromOnChain(recoveredAccounts)
    }
  }

  /**
   * Handle Token Activity
   * Updates balance for accounts and tokens with activity
   */
  async onTokenActivity({ accounts, tokens }: TokenActivityPayload) {
    await this.fetchAndUpdateTokenBalancesFromOnChain(accounts, tokens)
  }
}
