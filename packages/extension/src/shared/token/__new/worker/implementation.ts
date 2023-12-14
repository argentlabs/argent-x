import { IScheduleService } from "../../../schedule/interface"
import { ITokenService } from "../service/interface"
import { ITokenWorker } from "./interface"
import { INetworkService } from "../../../network/service/interface"
import { WalletStorageProps } from "../../../wallet/walletStore"
import { BaseWalletAccount, WalletAccount } from "../../../wallet.model"
import { defaultNetwork } from "../../../network"
import { IAccountService } from "../../../account/service/interface"
import { Token } from "../types/token.model"
import { IBackgroundUIService } from "../../../../background/__new/services/ui/interface"
import { Transaction } from "../../../transactions"
import { transactionSucceeded } from "../../../utils/transactionSucceeded"
import { IRepository } from "../../../storage/__new/interface"
import { WalletRecoverySharedService } from "../../../../background/wallet/recovery/shared.service"
import { Recovered } from "../../../../background/wallet/recovery/interface"
import { KeyValueStorage } from "../../../storage"
import { RefreshInterval } from "../../../config"
import {
  every,
  everyWhenOpen,
  onInstallAndUpgrade,
  onStartup,
} from "../../../../background/__new/services/worker/schedule/decorators"
import { pipe } from "../../../../background/__new/services/worker/schedule/pipe"
import { IDebounceService } from "../../../debounce"
import { IActivityService } from "../../../../background/__new/services/activity/interface"
import { IActivityStorage } from "../../../activity/types"

const NETWORKS_WITH_BACKEND_SUPPORT = ["goerli-alpha", "mainnet-alpha"]
/**
 * Refresh periods for updates
 */
// const THIRTY_SECOND_REFRESH = 30 // thirty seconds in seconds
// const ONE_MINUTE_REFRESH = 60 // one minute in seconds
// const TWO_MINUTE_REFRESH = 2 * 60 // two minutes in seconds
// const ONE_DAY_REFRESH = 24 * 60 * 60 // one day in seconds
/**
 * TokenWorker class implementing ITokenWorker interface
 * This class is responsible for managing token updates, including token balances and prices.
 */
export class TokenWorker implements ITokenWorker {
  /**
   * Constructor for TokenWorker class
   * @param {IWalletStore} walletStore - The wallet store
   * @param {IRepository<Transaction>} transactionsRepo - The transactions store
   * @param {IRepository<Token>} tokenRepo - The token repository
   * @param {ITokenService} tokenService - The token service
   * @param {IAccountService} accountService - The account service
   * @param {INetworkService} networkService - The network service
   * @param {WalletRecoverySharedService} recoverySharedService - The wallet recovery service
   * @param {IBackgroundUIService} backgroundUIService - The background UI service
   * @param {IScheduleService} scheduleService - The schedule service
   * @param {IDebounceService} debounceService - The debounce service
   * @param {IActivityService} activityService - The activity service
   * @param {KeyValueStorage<IActivityStorage>} activityStore - The activity store
   */
  constructor(
    private readonly walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly transactionsRepo: IRepository<Transaction>, // Transactions store
    private readonly tokenRepo: IRepository<Token>, // Tokens store
    private readonly tokenService: ITokenService, // Token service
    private readonly accountService: IAccountService, // Account service
    private readonly networkService: INetworkService, // Network service
    private readonly recoverySharedService: WalletRecoverySharedService, // Recovery shared service
    private readonly backgroundUIService: IBackgroundUIService, // Background UI service
    private readonly scheduleService: IScheduleService, // Schedule service
    private readonly debounceService: IDebounceService, // Debounce service
    private readonly activityService: IActivityService, // Activity service
  ) {
    // Run once on startup
    void this.initialize()
  }

  /**
   * Initialize the TokenWorker
   * Registers the schedules and event listeners
   */
  initialize(): void {
    // Listen for account changes
    this.walletStore.subscribe("selected", async (account) => {
      if (account) {
        await this.checkAndUpdateTokens(account) // Check if tokens have priceId and update if needed
        await this.updateTokenBalancesForAccount(account) // Update token balances on account changenge
      }
    })

    // Listen for recovery event
    this.recoverySharedService.emitter.on(
      Recovered,
      this.onRecovered.bind(this),
    )

    // Listen for transaction success
    this.transactionsRepo.subscribe((changeSet) => {
      if (!changeSet?.newValue) {
        return
      }
      const hasSuccessTx = transactionSucceeded(
        changeSet.newValue,
        changeSet?.oldValue,
      )
      if (hasSuccessTx) {
        const isOnBackendSupportedNetwork = changeSet.newValue.every((tx) =>
          NETWORKS_WITH_BACKEND_SUPPORT.includes(tx.account.networkId),
        )
        void this.updateTokenBalancesCallback({
          hasBackendSupport: isOnBackendSupportedNetwork,
        }) // Update token balances on transaction success
      }
    })

    this.tokenRepo.subscribe((changeSet) => {
      const isOnBackendSupportedNetwork = changeSet?.newValue?.every((token) =>
        NETWORKS_WITH_BACKEND_SUPPORT.includes(token.networkId),
      )
      void this.updateTokenBalancesCallback({
        hasBackendSupport: Boolean(isOnBackendSupportedNetwork),
      }) // Update token balances on token change
      void this.updateTokenPricesCallback() // Update token prices on token change
    })
  }

  updateTokensCallback = async (): Promise<void> => {
    const networks = await this.networkService.get() // Get all networks

    // // Fetch tokens for all networks in parallel
    const tokensFromAllNetworks = await Promise.allSettled(
      networks.map((network) =>
        this.tokenService.fetchTokensFromBackend(network.id),
      ),
    )
    const tokens = tokensFromAllNetworks
      .map((result) => result.status === "fulfilled" && result.value)
      .filter((t): t is Token[] => Boolean(t))
      .flat()

    await this.tokenService.updateTokens(tokens) // Update tokens in the token service
  }

  async updateTokenBalancesForAccount(
    baseWalletAccount: BaseWalletAccount,
  ): Promise<void> {
    const tokens = await this.tokenService.getTokens(
      (t) => t.networkId === baseWalletAccount.networkId,
    )
    const tokensWithBalance =
      await this.tokenService.fetchTokenBalancesFromOnChain(
        [baseWalletAccount],
        tokens,
      )

    return await this.tokenService.updateTokenBalances(tokensWithBalance) // Update token balances in the token service
  }

  async checkAndUpdateTokens(
    baseWalletAccount: BaseWalletAccount,
  ): Promise<void> {
    const tokens = await this.tokenService.getTokens(
      (t) =>
        t.networkId === baseWalletAccount.networkId &&
        t.pricingId !== undefined,
    )

    if (!tokens.length) {
      await this.updateTokensCallback()
    }
  }

  /**
   * Update tokens
   * Fetches tokens for all networks and updates the token service
   */
  updateTokens = pipe(
    onStartup(this.scheduleService), // This will run the function on startup
    onInstallAndUpgrade(this.scheduleService), // This will run the function on update
    every(this.scheduleService, RefreshInterval.VERY_SLOW, "updateTokens"), // This will run the function every 24 hours
  )(async (): Promise<void> => {
    await this.updateTokensCallback()
  })

  private async updateBalance({
    tokens,
    accounts,
  }: {
    tokens: Token[]
    accounts: WalletAccount[]
  }) {
    const tokensWithBalances =
      await this.tokenService.fetchTokenBalancesFromOnChain(accounts, tokens)

    await this.tokenService.updateTokenBalances(tokensWithBalances) // Update token balances in the token service
  }

  updateTokenBalancesCallback = async ({
    hasBackendSupport,
  }: {
    hasBackendSupport: boolean
  }): Promise<void> => {
    const selectedAccount = await this.walletStore.get("selected")
    if (!selectedAccount) {
      return
    }
    const accounts = await this.accountService.get(
      (a) => a.networkId === selectedAccount.networkId,
    )
    const tokens = await this.tokenService.getTokens(
      (t) => t.networkId === selectedAccount.networkId,
    )
    if (!hasBackendSupport) {
      await this.updateBalance({ tokens, accounts })
    } else {
      const shouldUpdateBalance =
        await this.activityService.shouldUpdateBalance(selectedAccount)
      if (
        shouldUpdateBalance.shouldUpdate &&
        shouldUpdateBalance.id &&
        shouldUpdateBalance.lastModified
      ) {
        await this.updateBalance({ tokens, accounts })

        await this.activityService.addActivityToStore({
          address: selectedAccount.address,
          id: shouldUpdateBalance.id,
          lastModified: shouldUpdateBalance.lastModified,
        })
      }
    }
  }

  /**
   * Update token balances
   * Fetches token balances for the provided account or all accounts on the current network
   * @param baseWalletAccount - Base Wallet Account
   */
  updateTokenBalances = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.FAST,
      "updateTokenBalances",
    ), // This will run the function every 20 seconds when the UI is open
  )(async (): Promise<void> => {
    const selectedAccount = await this.walletStore.get("selected")
    if (
      selectedAccount?.networkId &&
      NETWORKS_WITH_BACKEND_SUPPORT.includes(selectedAccount.networkId)
    ) {
      await this.updateTokenBalancesCallback({ hasBackendSupport: true })
    }
  })

  /**
   * Update token balances for custom networks
   * Fetches token balances for the provided account or all accounts on the current network
   * @param baseWalletAccount - Base Wallet Account
   */
  updateCustomNetworksTokenBalances = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.MEDIUM,
      "updateCustomNetworksTokenBalances",
    ), // This will run the function every 60 seconds when the UI is open
  )(async (): Promise<void> => {
    const selectedAccount = await this.walletStore.get("selected")

    if (
      !selectedAccount?.networkId ||
      !NETWORKS_WITH_BACKEND_SUPPORT.includes(selectedAccount.networkId)
    ) {
      await this.updateTokenBalancesCallback({ hasBackendSupport: false })
    }
  })

  updateTokenPricesCallback = async (): Promise<void> => {
    // Token prices are only available for the default network
    const defaultNetworkId = defaultNetwork.id
    const tokens = await this.tokenService.getTokens(
      (t) => t.networkId === defaultNetworkId,
    )
    const tokenPrices = await this.tokenService.fetchTokenPricesFromBackend(
      tokens,
      defaultNetworkId,
    )
    await this.tokenService.updateTokenPrices(tokenPrices) // Update token prices in the token service
  }

  /**
   * Update token prices
   * Fetches token prices for the default network and updates the token service
   */
  updateTokenPrices = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.MEDIUM,
      "updateTokenPrices",
    ), // This will run the function every 2 minutes when the UI is open
  )(async (): Promise<void> => {
    await this.updateTokenPricesCallback()
  })

  /**
   * Handle Recovery
   * Updates everything on recovery
   * @param recoveredAccounts -BaseWalletAccount[]
   */
  async onRecovered(recoveredAccounts: BaseWalletAccount[]) {
    if (recoveredAccounts.length > 0) {
      await this.updateTokensCallback() // Update tokens when wallet is recovered
      await this.updateTokenPricesCallback() // Update token prices when wallet is recovered

      // On Recovery, we need to fetch the token balances for the recovered accounts
      const tokensWithBalances =
        await this.tokenService.fetchTokenBalancesFromOnChain(recoveredAccounts)

      await this.tokenService.updateTokenBalances(tokensWithBalances)
    }
  }
}
