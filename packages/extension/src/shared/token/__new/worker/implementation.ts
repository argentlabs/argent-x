import { IScheduleService } from "../../../schedule/interface"
import { ITokenService } from "../service/interface"
import { ITokenWorker } from "./interface"
import { INetworkService } from "../../../network/service/interface"
import { WalletStorageProps } from "../../../wallet/walletStore"
import { BaseWalletAccount } from "../../../wallet.model"
import { defaultNetwork } from "../../../network"
import { IAccountService } from "../../../account/service/interface"
import { Token } from "../types/token.model"
import { WalletSessionService } from "../../../../background/wallet/session/session.service"
import { Locked } from "../../../../background/wallet/session/interface"
import {
  IBackgroundUIService,
  Opened,
} from "../../../../background/__new/services/ui/interface"
import { Transaction } from "../../../transactions"
import { transactionSucceeded } from "../../../utils/transactionSucceeded"
import { IRepository } from "../../../storage/__new/interface"
import { WalletRecoverySharedService } from "../../../../background/wallet/recovery/shared.service"
import { Recovered } from "../../../../background/wallet/recovery/interface"
import { KeyValueStorage } from "../../../storage"
import { RefreshInterval } from "../../../config"

/**
 * Enum for scheduling token updates
 */
const enum TokenWorkerSchedule {
  updateTokens = "updateTokens", // Schedule for updating tokens
  updateTokenBalances = "updateTokenBalances", // Schedule for updating token balances
  updateTokenPrices = "updateTokenPrices", // Schedule for updating token prices
}

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
  private isUpdating = false // Flag to check if update is in progress
  private lastUpdatedTimestamp = 0 // Timestamp of the last update

  /**
   * Constructor for TokenWorker class
   * @param {IWalletStore} walletStore - The wallet store
   * @param {IRepository<Transaction>} transactionsRepo - The transactions store
   * @param {ITokenService} tokenService - The token service
   * @param {IAccountService} accountService - The account service
   * @param {INetworkService} networkService - The network service
   * @param {WalletSessionService} sessionService - The session service
   * @param {IBackgroundUIService} backgroundUIService - The background UI service
   * @param {IScheduleService<TokenWorkerSchedule>} scheduleService - The schedule service
   */
  constructor(
    private readonly walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly transactionsRepo: IRepository<Transaction>, // Transactions store
    private readonly tokenRepo: IRepository<Token>, // Tokens store
    private readonly tokenService: ITokenService, // Token service
    private readonly accountService: IAccountService, // Account service
    private readonly networkService: INetworkService, // Network service
    private readonly sessionService: WalletSessionService, // Session service
    private readonly recoverySharedService: WalletRecoverySharedService, // Recovery shared service
    private readonly backgroundUIService: IBackgroundUIService, // Background UI service
    private readonly scheduleService: IScheduleService<TokenWorkerSchedule>, // Schedule service
  ) {
    // Run once on startup
    void this.initialize()
  }

  /**
   * Initialize the TokenWorker
   * Registers the schedules and event listeners
   */
  initialize(): void {
    // Register schedules
    void this.scheduleService.registerImplementation({
      id: TokenWorkerSchedule.updateTokens,
      callback: this.updateTokens.bind(this),
    })
    void this.scheduleService.registerImplementation({
      id: TokenWorkerSchedule.updateTokenBalances,
      callback: this.updateTokenBalances.bind(this),
    })
    void this.scheduleService.registerImplementation({
      id: TokenWorkerSchedule.updateTokenPrices,
      callback: this.updateTokenPrices.bind(this),
    })
    // Schedule token updates every day
    void this.scheduleService.every(RefreshInterval.VERY_SLOW, {
      id: TokenWorkerSchedule.updateTokens,
    })

    // Listen for UI opened event
    this.backgroundUIService.emitter.on(Opened, this.onOpened.bind(this))

    // Listen for account changes
    this.walletStore.subscribe("selected", (account) => {
      void this.updateTokenBalances(account) // Update token balances on account changenge
    })

    // Listen for session locked event
    this.sessionService.emitter.on(Locked, this.onLocked.bind(this))

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
        void this.updateTokenBalances() // Update token balances on transaction success
      }
    })

    this.tokenRepo.subscribe(() => {
      void this.updateTokenBalances() // Update token balances on token change
      void this.updateTokenPrices() // Update token prices on token change
    })

    setTimeout(() => {
      void this.updateTokens() // Update tokens on startup
    }, 100)
  }

  /**
   * Update tokens
   * Fetches tokens for all networks and updates the token service
   */
  async updateTokens(): Promise<void> {
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

  /**
   * Update token balances
   * Fetches token balances for the provided account or all accounts on the current network
   * @param baseWalletAccount - Base Wallet Account
   */
  async updateTokenBalances(
    baseWalletAccount?: BaseWalletAccount | null,
  ): Promise<void> {
    if (this.isUpdating) {
      return
    }

    this.isUpdating = true // Set updating flag
    this.lastUpdatedTimestamp = Date.now() // Update timestamp

    if (baseWalletAccount) {
      const tokens = await this.tokenService.getTokens(
        (t) => t.networkId === baseWalletAccount.networkId,
      )
      const tokensWithBalance =
        await this.tokenService.fetchTokenBalancesFromOnChain(
          [baseWalletAccount],
          tokens,
        )

      this.isUpdating = false // Reset updating flag
      return await this.tokenService.updateTokenBalances(tokensWithBalance) // Update token balances in the token service
    }

    // If no account is provided, fetch for all accounts on the current network
    const selectedAccount = await this.walletStore.get("selected")
    if (selectedAccount) {
      const accounts = await this.accountService.get(
        (a) => a.networkId === selectedAccount.networkId,
      )
      const tokens = await this.tokenService.getTokens(
        (t) => t.networkId === selectedAccount.networkId,
      )

      const tokensWithBalances =
        await this.tokenService.fetchTokenBalancesFromOnChain(accounts, tokens)

      await this.tokenService.updateTokenBalances(tokensWithBalances) // Update token balances in the token service
    }

    this.isUpdating = false // Reset updating flag
  }

  /**
   * Update token prices
   * Fetches token prices for the default network and updates the token service
   */
  async updateTokenPrices(): Promise<void> {
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
   * Handle locked state
   * Updates token balances when the session is unlocked
   * @param locked - Locked state
   */
  async onLocked(locked: boolean) {
    if (!locked) {
      await Promise.all([
        this.updateTokenBalances(), // Update token balances when session is unlocked
        this.updateTokenPrices(), // Update token prices when session is unlocked
      ])
    }
  }

  /**
   * Handle Recovery
   * Updates everything on recovery
   * @param recoveredAccounts -BaseWalletAccount[]
   */
  async onRecovered(recoveredAccounts: BaseWalletAccount[]) {
    if (recoveredAccounts.length > 0) {
      await this.updateTokens() // Update tokens when wallet is recovered
      await this.updateTokenPrices() // Update token prices when wallet is recovered

      // On Recovery, we need to fetch the token balances for the recovered accounts
      const tokensWithBalances =
        await this.tokenService.fetchTokenBalancesFromOnChain(recoveredAccounts)

      await this.tokenService.updateTokenBalances(tokensWithBalances)
    }
  }

  /**
   * Handle opened state
   * Updates token balances and schedules updates when the UI is opened
   * @param opened - Opened state
   */
  onOpened(opened: boolean) {
    if (opened) {
      const currentTimestamp = Date.now()
      const differenceInMilliseconds =
        currentTimestamp - this.lastUpdatedTimestamp
      const differenceInMinutes = differenceInMilliseconds / (1000 * 60) // Convert milliseconds to minutes

      // If we haven't done an update in the past 1 minute, do one on the spot when opening the extension
      if (differenceInMinutes > RefreshInterval.MEDIUM) {
        void this.updateTokenBalances() // Update token balances
      }

      // Schedule token balance and price updates
      void this.scheduleService.every(RefreshInterval.FAST, {
        id: TokenWorkerSchedule.updateTokenBalances,
      })
      void this.scheduleService.every(RefreshInterval.MEDIUM, {
        id: TokenWorkerSchedule.updateTokenPrices,
      })
    } else {
      // Delete scheduled updates when the UI is closed
      void this.scheduleService.delete({
        id: TokenWorkerSchedule.updateTokenBalances,
      })

      void this.scheduleService.delete({
        id: TokenWorkerSchedule.updateTokenPrices,
      })
    }
  }
}
