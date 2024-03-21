import {
  isArgentNetworkId,
  includesAddress,
  isEqualAddress,
} from "@argent/x-shared"
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
import { WalletSessionService } from "../../../../wallet/session/session.service"
import {
  TokenActivity,
  type IActivityService,
  type TokenActivityPayload,
  ProvisionActivity,
} from "../../activity/interface"
import type { IBackgroundUIService } from "../../ui/interface"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"
import { mergeTokensWithDefaults } from "../../../../../shared/token/__new/repository/mergeTokens"
import { ProvisionActivityPayload } from "../../../../../shared/activity/types"

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
    private readonly sessionService: WalletSessionService,
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

    // Listen to provision
    this.activityService.emitter.on(
      ProvisionActivity,
      this.onProvisionActivity.bind(this),
    )
  }

  async getSelectedAccount() {
    const selectedAccount = await this.walletStore.get("selected")
    return selectedAccount
  }

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
   * Fetches tokens for all networks and updates the token service
   * Fetches token prices for the default network and updates the token service
   */
  runFetchAndUpdateTokensAndTokenPricesFromBackend = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.FAST,
      "TokenWorker.fetchAndUpdateTokenPricesFromBackend",
    ), // This will run the function every minute when the UI is open
  )(async (): Promise<void> => {
    await this.refreshTokenRepoWithTokensInfoFromBackend()
    await this.fetchAndUpdateTokenPricesFromBackend()
  })

  runOnOpenAndUnlocked = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.MEDIUM,
      "TokenWorker.onOpenAndUnlocked",
    ), // This will run the function when the wallet is opened and unlocked, debounced to one minute
  )(async () => {
    const selectedAccount = await this.getSelectedAccount()
    if (!selectedAccount) {
      return
    }
    await this.runUpdatesForAccount(selectedAccount)
  })

  async onSelectedAccountChange(account?: BaseWalletAccount | null) {
    if (!account) {
      return
    }
    await this.runUpdatesForAccount(account)
  }

  async runUpdatesForAccount(account: BaseWalletAccount) {
    void this.maybeUpdateTokensFromBackendForAccount(account)
    void this.updateTokenBalancesFromOnChain(account)
    void this.discoverTokensFromBackendForAccount(account)
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

  async refreshTokenRepoWithTokensInfoFromBackend() {
    const networks = await this.networkService.get()
    await Promise.allSettled(
      networks.map((network) =>
        this.refreshTokenRepoWithTokensInfoFromBackendForNetwork(network.id),
      ),
    )
  }

  async refreshTokenRepoWithTokensInfoFromBackendForNetwork(networkId: string) {
    const tokensInfoOnNetwork =
      await this.tokenService.getTokensInfoFromBackendForNetwork(networkId)
    if (!tokensInfoOnNetwork) {
      return
    }
    const tokensOnNetwork = await this.tokenService.getTokens(
      (token) => token.networkId === networkId,
    )
    // refresh the local tokens with tokens info
    const updatedTokens = tokensOnNetwork.map((tokenOnNetwork) => {
      const tokenInfoOnNetwork = tokensInfoOnNetwork.find(
        (tokenInfoOnNetwork) =>
          isEqualAddress(tokenInfoOnNetwork.address, tokenOnNetwork.address),
      )
      return tokenInfoOnNetwork
        ? { ...tokenOnNetwork, ...tokenInfoOnNetwork }
        : tokenOnNetwork
    })

    // explicitly filter out tokens that are not tradable
    const tradableTokens = tokensInfoOnNetwork
      .filter((token) => token.tradable)
      .map((t) => ({ ...t, networkId }))

    await this.tokenService.updateTokens(
      mergeTokensWithDefaults(tradableTokens, updatedTokens),
    )
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

    return await this.tokenService.updateTokenBalances(tokensWithBalance) // Update token balances in the token service
  }

  async maybeUpdateTokensFromBackendForAccount(account: BaseWalletAccount) {
    const tokens = await this.tokenService.getTokens(
      (t) => t.networkId === account.networkId && t.pricingId !== undefined,
    )

    if (!tokens.length) {
      await this.refreshTokenRepoWithTokensInfoFromBackend()
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
    if (isArgentNetworkId(selectedAccount.networkId)) {
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
      await this.refreshTokenRepoWithTokensInfoFromBackend()
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

  async discoverTokensFromBackendForAccount(account: BaseWalletAccount) {
    const accountTokenBalancesFromBackend =
      await this.tokenService.fetchAccountTokenBalancesFromBackend(account)

    const tokensOnNetwork = await this.tokenService.getTokens(
      (token) => account.networkId === token.networkId,
    )

    const knownTokenAddresses = tokensOnNetwork.map((token) => token.address)

    const discoveredTokens = accountTokenBalancesFromBackend.filter(
      (accountTokenBalance) => {
        return !includesAddress(
          accountTokenBalance.address,
          knownTokenAddresses,
        )
      },
    )
    if (!discoveredTokens.length) {
      return
    }

    const tokensInfoOnNetwork =
      await this.tokenService.getTokensInfoFromBackendForNetwork(
        account.networkId,
      )
    if (!tokensInfoOnNetwork) {
      return
    }
    /** both sets of tokens are already on the same network */
    const discoveredTokensInfo: Token[] = []
    discoveredTokens.forEach((discoveredToken) => {
      const tokenInfo = tokensInfoOnNetwork.find((tokenInfo) =>
        isEqualAddress(discoveredToken.address, tokenInfo.address),
      )
      if (tokenInfo) {
        discoveredTokensInfo.push({
          ...tokenInfo,
          networkId: account.networkId,
        })
      }
    })
    await this.tokenService.addToken(discoveredTokensInfo)
  }

  async onProvisionActivity(payload: ProvisionActivityPayload) {
    await this.tokenService.handleProvisionTokens(payload)
    await this.refreshTokenRepoWithTokensInfoFromBackend()
  }
}
