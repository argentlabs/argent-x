import {
  includesAddress,
  isArgentNetworkId,
  isEqualAddress,
} from "@argent/x-shared"
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import { AccountAddedEvent } from "../../../../shared/account/service/accountService/IAccountService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import type { IDebounceService } from "../../../../shared/debounce"
import { defaultNetwork } from "../../../../shared/network"
import type { INetworkService } from "../../../../shared/network/service/INetworkService"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { KeyValueStorage } from "../../../../shared/storage"
import type {
  AllowArray,
  IRepository,
  StorageChange,
} from "../../../../shared/storage/__new/interface"
import { mergeTokensWithDefaults } from "../../../../shared/token/__new/repository/mergeTokens"
import type { ITokenService } from "../../../../shared/token/__new/service/ITokenService"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import type { Transaction } from "../../../../shared/transactions"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { getSuccessfulTransactions } from "../../../../shared/utils/transactionSucceeded"
import type {
  BaseWalletAccount,
  NetworkOnlyPlaceholderAccount,
} from "../../../../shared/wallet.model"
import { isNetworkOnlyPlaceholderAccount } from "../../../../shared/wallet.model"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import { Recovered } from "../../../wallet/recovery/IWalletRecoveryService"
import type { WalletRecoverySharedService } from "../../../wallet/recovery/WalletRecoverySharedService"
import type { NewTokenActivityPayload } from "../../activity/IActivityService"
import {
  NewTokenActivity,
  TokenActivity,
  type IActivityService,
  type TokenActivityPayload,
} from "../../activity/IActivityService"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"

/**
 * This class is responsible for managing token updates, including token balances and prices.
 */
export class TokenWorker {
  constructor(
    private readonly walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly accountService: IAccountService,
    private readonly transactionsRepo: IRepository<Transaction>,
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

    // Listen for new tokens activities
    this.activityService.emitter.on(
      NewTokenActivity,
      this.onNewTokensDiscovered.bind(this),
    )

    // Listen for new account added event
    this.accountService.emitter.on(
      AccountAddedEvent,
      this.runUpdatesForAccount.bind(this),
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
      RefreshIntervalInSeconds.MEDIUM,
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
      RefreshIntervalInSeconds.MEDIUM,
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
      RefreshIntervalInSeconds.MEDIUM,
      "TokenWorker.onOpenAndUnlocked",
    ), // This will run the function when the wallet is opened and unlocked, debounced to one minute
  )(async () => {
    const selectedAccount = await this.getSelectedAccount()
    if (!selectedAccount || isNetworkOnlyPlaceholderAccount(selectedAccount)) {
      return
    }
    await this.runUpdatesForAccount(selectedAccount)
  })

  async onSelectedAccountChange(
    account?: BaseWalletAccount | NetworkOnlyPlaceholderAccount | null,
  ) {
    if (!account || isNetworkOnlyPlaceholderAccount(account)) {
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
      if (
        !selectedAccount ||
        isNetworkOnlyPlaceholderAccount(selectedAccount)
      ) {
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
    if (!selectedAccount || isNetworkOnlyPlaceholderAccount(selectedAccount)) {
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

  /**
   * Handle new tokens discovered
   * Adds new tokens to the token service and updates balances
   */
  async onNewTokensDiscovered({ tokens }: NewTokenActivityPayload) {
    const allAccounts = (await this.accountService.get()).map(
      (acc) => acc as BaseWalletAccount,
    )

    const networkIds = new Set(tokens.map((token) => token.networkId as string))

    const discoveredTokensInfo: Token[] = []

    for (const networkId of networkIds) {
      const tokensInfoOnNetwork =
        await this.tokenService.getTokensInfoFromBackendForNetwork(networkId)
      if (!tokensInfoOnNetwork) {
        return
      }

      tokens.forEach((discoveredToken) => {
        const tokenInfo = tokensInfoOnNetwork.find((tokenInfo) =>
          isEqualAddress(discoveredToken.address, tokenInfo.address),
        )
        if (tokenInfo) {
          discoveredTokensInfo.push({
            ...tokenInfo,
            networkId,
          })
        }
      })
    }

    await this.tokenService.addToken(discoveredTokensInfo)

    await this.fetchAndUpdateTokenPricesFromBackend()

    await this.fetchAndUpdateTokenBalancesFromOnChain(
      allAccounts,
      discoveredTokensInfo,
    )
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
}
