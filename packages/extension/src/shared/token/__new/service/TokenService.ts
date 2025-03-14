import type {
  ApiAccountTokenBalances,
  ApiTokenInfo,
  ApiTokensInfoResponse,
  IHttpService,
} from "@argent/x-shared"
import {
  apiAccountTokenBalancesSchema,
  apiPriceDataResponseSchema,
  apiTokensInfoResponseSchema,
  bigDecimal,
  convertTokenAmountToCurrencyValue,
  ensureArray,
  isEqualAddress,
  retryUntilInitialised,
  stripAddressZeroPadding,
} from "@argent/x-shared"
import type retry from "async-retry"
import { groupBy, isEmpty, uniq } from "lodash-es"
import type { AllowArray } from "starknet"
import { uint256 } from "starknet"
import urlJoin from "url-join"
import { ARGENT_API_BASE_URL } from "../../../api/constants"
import { argentApiNetworkForNetwork } from "../../../api/headers"
import { RefreshIntervalInSeconds } from "../../../config"
import { TokenError } from "../../../errors/token"
import type { ArgentDatabase } from "../../../idb/db"
import { chunkedBulkPut } from "../../../idb/utils/chunkedBulkPut"
import { getMulticallForNetwork } from "../../../multicall"
import type { Network } from "../../../network"
import { defaultNetwork } from "../../../network"
import { getProvider } from "../../../network/provider"
import type { INetworkService } from "../../../network/service/INetworkService"
import { getDefaultNetworkId } from "../../../network/utils"
import type { SelectorFn } from "../../../storage/__new/interface"
import type { BaseWalletAccount } from "../../../wallet.model"
import type { BaseToken, Token } from "../types/token.model"
import { BaseTokenSchema } from "../types/token.model"
import type { BaseTokenWithBalance } from "../types/tokenBalance.model"
import type {
  TokenPriceDetails,
  TokenWithBalanceAndPrice,
} from "../types/tokenPrice.model"
import { equalToken } from "../utils"
import { decodeShortStringArray } from "../utils/decodeShortStringArray"
import type { FetchedTokenDetails, ITokenService } from "./ITokenService"

/**
 * TokenService class implements ITokenService interface.
 * It provides methods to interact with the token repository, token balance repository and token price repository.
 */
export class TokenService implements ITokenService {
  private readonly TOKENS_INFO_URL: string
  private readonly TOKENS_PRICES_URL: string
  private readonly ARGENT_API_TOKENS_REPORT_SPAM_URL: string

  constructor(
    private readonly networkService: INetworkService,
    private readonly db: ArgentDatabase,
    private readonly httpService: IHttpService,
    TOKENS_INFO_URL: string | undefined,
    TOKENS_PRICES_URL: string | undefined,
    ARGENT_API_TOKENS_REPORT_SPAM_URL: string | undefined,
  ) {
    if (!TOKENS_INFO_URL) {
      throw new TokenError({ code: "NO_TOKEN_API_URL" })
    }
    if (!TOKENS_PRICES_URL) {
      throw new TokenError({ code: "NO_TOKEN_PRICE_API_URL" })
    }
    if (!ARGENT_API_TOKENS_REPORT_SPAM_URL) {
      throw new TokenError({ code: "NO_TOKEN_REPORT_SPAM_API_URL" })
    }
    this.TOKENS_INFO_URL = TOKENS_INFO_URL
    this.TOKENS_PRICES_URL = TOKENS_PRICES_URL
    this.ARGENT_API_TOKENS_REPORT_SPAM_URL = ARGENT_API_TOKENS_REPORT_SPAM_URL
  }

  /**
   * Update tokens in the token repository.
   * @param {AllowArray<Token>} token - The tokens to update.
   */
  async updateTokens(token: AllowArray<Token>): Promise<void> {
    await this.db.tokens.bulkPut(ensureArray(token))
  }

  /**
   * Add a token to the token repository.
   * @param {AllowArray<Token>} token - The token to add.
   */
  async addToken(token: AllowArray<Token>): Promise<void> {
    await this.updateTokens(token)
  }

  /**
   * Remove a token from the token repository.
   * @param {BaseToken} baseToken - The base token to remove.
   */
  async removeToken(baseToken: BaseToken): Promise<void> {
    await this.db.tokens.filter((t) => equalToken(t, baseToken)).delete()
  }

  /**
   * Hide a token in the token repository.
   * @param {BaseToken} baseToken - The base token to remove.
   */
  async toggleHideToken(baseToken: BaseToken, hidden: boolean): Promise<void> {
    const allTokens = await this.db.tokens.toArray()
    const token = allTokens.find((t) => equalToken(t, baseToken))
    if (!token) {
      return
    }
    token.hidden = hidden
    await this.updateTokens(token)
  }

  /**
   * Update token balances in the token balance repository.
   * @param {AllowArray<BaseTokenWithBalance>} tokensWithBalance - The tokens with balance to update.
   */
  async updateTokenBalances(
    tokensWithBalance: AllowArray<BaseTokenWithBalance>,
  ): Promise<void> {
    /** this is a potentially large table - use bulkPut to prevent blocking UI */
    await chunkedBulkPut(this.db.tokenBalances, ensureArray(tokensWithBalance))
  }

  /**
   * Update token prices in the token price repository.
   * @param {AllowArray<TokenPriceDetails>} tokenPrices - The token prices to update.
   */
  async updateTokenPrices(
    tokenPrices: AllowArray<TokenPriceDetails>,
  ): Promise<void> {
    const cachedTokenPrices = await this.db.tokenPrices.toArray()
    const newTokenPrices = ensureArray(tokenPrices)
    const tokenPricesToRemove = cachedTokenPrices.filter(
      (tp) => !newTokenPrices.some((ntp) => equalToken(tp, ntp)),
    )

    // remove token prices that are not in the new token prices
    // this is to prevent stale token prices from being stored
    await this.db.tokenPrices.bulkDelete(
      tokenPricesToRemove.map((t) => [t.address, t.networkId]),
    )

    await this.db.tokenPrices.bulkPut(ensureArray(tokenPrices))
  }

  /**
   * Lazy fetch tokens info from local storage or backend max RefreshInterval.SLOW
   * @param {string} networkId - The network id.
   * @returns {Promise<ApiTokenInfo[]>} - The fetched tokens or undefined if there was an error or not default network
   */
  async getTokensInfoFromBackendForNetwork(
    networkId: string,
  ): Promise<ApiTokenInfo[] | undefined> {
    /** the backend currently only returns token info for its specific network */
    const isDefaultNetwork = defaultNetwork.id === networkId
    if (!isDefaultNetwork) {
      return
    }

    const allTokensInfo = await this.db.tokensInfo.toArray()
    const tokenInfoByNetwork = allTokensInfo
      .filter((tokenInfo) => {
        if (tokenInfo.updatedAt === undefined) {
          return false
        }
        if (tokenInfo.networkId !== networkId) {
          return false
        }
        /** allow some additional seconds for server round trip */
        const ROUND_TRIP_TIME_ALLOWANCE = 10
        const isValid =
          Date.now() - tokenInfo.updatedAt <
          (RefreshIntervalInSeconds.SLOW - ROUND_TRIP_TIME_ALLOWANCE) * 1000
        return isValid
      })
      .sort((a, b) => a.id - b.id)

    if (!isEmpty(tokenInfoByNetwork)) {
      return tokenInfoByNetwork
    }

    /** fetch data and check it's valid format */
    const response = await this.httpService.get<ApiTokensInfoResponse>(
      this.TOKENS_INFO_URL,
    )
    const parsedResponse = apiTokensInfoResponseSchema.safeParse(response)
    if (!parsedResponse.success) {
      return
    }

    /** store and update the updatedAt timestamp */
    const data = parsedResponse.data.tokens
    const tokens = data.map((token) => ({
      ...token,
      networkId,
      updatedAt: Date.now(),
    }))

    /** this is a potentially large table - use bulkPut to prevent blocking UI */
    await chunkedBulkPut(this.db.tokensInfo, tokens)

    return tokens
  }

  /**
   * Fetches token balances from the blockchain.
   * @param {BaseWalletAccount[]} accounts - The accounts for which to fetch token balances.
   * @param {Token[]} tokens - The tokens for which to fetch balances. If not provided, finds all relevant tokens for the accounts
   * @returns {Promise<BaseTokenWithBalance[]>} - The fetched token balances.
   */
  async fetchTokenBalancesFromOnChain(
    accounts: AllowArray<BaseWalletAccount>,
    tokens?: AllowArray<Token>,
  ): Promise<BaseTokenWithBalance[]> {
    const accountsArray = ensureArray(accounts)
    // by default, find all the relevant tokens for all the accounts
    if (!tokens) {
      // create an array of all networks covered by accounts
      const networkIds = uniq(accountsArray.map((account) => account.networkId))
      // create an array of all tokens covered by the networks
      tokens = await this.getTokens((token) =>
        networkIds.includes(token.networkId),
      )
    }
    const tokensArray = ensureArray(tokens)

    const accountsGroupedByNetwork = groupBy(accountsArray, "networkId")
    const tokensGroupedByNetwork = groupBy(tokensArray, "networkId")
    const tokenBalances: BaseTokenWithBalance[] = []

    for (const networkId in accountsGroupedByNetwork) {
      try {
        const tokensOnCurrentNetwork = tokensGroupedByNetwork[networkId] // filter tokens based on networkId
        const network = await this.networkService.getById(networkId)
        if (network.multicallAddress) {
          const balances = await this.fetchTokenBalancesWithMulticall(
            network,
            accountsGroupedByNetwork,
            tokensOnCurrentNetwork,
          )
          tokenBalances.push(...balances)
        } else {
          const balances = await this.fetchTokenBalancesWithoutMulticall(
            network,
            accountsGroupedByNetwork,
            tokensOnCurrentNetwork,
          )
          tokenBalances.push(...balances)
        }
      } catch (e) {
        /** Catch error to be resilient to individual network failure */
        console.error(`fetchTokenBalancesFromOnChain error on ${networkId}`, e)
      }
    }
    return tokenBalances
  }

  public async fetchTokenBalancesWithMulticall(
    network: Network,
    accountsGroupedByNetwork: Record<string, BaseWalletAccount[]>,
    tokensOnCurrentNetwork: Token[],
  ): Promise<BaseTokenWithBalance[]> {
    const multicall = getMulticallForNetwork(network)
    const accounts = accountsGroupedByNetwork[network.id]
    const calls = ensureArray(tokensOnCurrentNetwork)
      .map((token) =>
        accounts.map((account) =>
          multicall.callContract({
            contractAddress: token.address,
            entrypoint: "balanceOf",
            calldata: [account.address],
          }),
        ),
      )
      .flat()
    const results = await Promise.allSettled(calls)
    const tokenBalances: BaseTokenWithBalance[] = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const token = tokensOnCurrentNetwork[Math.floor(i / accounts.length)]
      const account = accounts[i % accounts.length]
      if (result.status === "fulfilled") {
        const [low, high] = ensureArray(result.value)
        const balance = uint256
          .uint256ToBN({ low: low || "0", high: high || "0" })
          .toString()
        tokenBalances.push({
          account: account.address,
          ...token,
          balance,
        })
      } else {
        console.error(result.reason)
      }
    }
    return tokenBalances
  }

  async fetchTokenBalancesWithoutMulticall(
    network: Network,
    accountsGroupedByNetwork: Record<string, BaseWalletAccount[]>,
    tokensOnCurrentNetwork: Token[],
  ): Promise<BaseTokenWithBalance[]> {
    const provider = getProvider(network)
    const tokenBalances: BaseTokenWithBalance[] = []
    const accounts = accountsGroupedByNetwork[network.id]

    for (const account of accounts) {
      for (const token of tokensOnCurrentNetwork) {
        const response = await provider.callContract({
          contractAddress: token.address,
          entrypoint: "balanceOf",
          calldata: [account.address],
        })
        const [low, high] = response
        const balance = uint256.uint256ToBN({ low, high }).toString()
        tokenBalances.push({
          account: account.address,
          ...token,
          balance,
        })
      }
    }
    return tokenBalances
  }

  /**
   * Fetch token prices from the backend.
   * @param {Token[]} tokens - The tokens.
   * @param {string} networkId - The network id.
   * @returns {Promise<TokenPriceDetails[]>} - The fetched token prices.
   */
  async fetchTokenPricesFromBackend(
    tokens: Token[],
    networkId: string,
  ): Promise<TokenPriceDetails[]> {
    const isDefaultNetwork = defaultNetwork.id === networkId
    const allTokenPrices = await this.db.tokenPrices.toArray()
    const tokenPrices = allTokenPrices.filter(
      (tokenPrice) => tokenPrice.networkId === networkId,
    )

    if (!isDefaultNetwork) {
      console.warn("Token prices are only available on default network")
      return tokenPrices
    }

    try {
      const response = await this.httpService.get(this.TOKENS_PRICES_URL)
      const parsedResponse = apiPriceDataResponseSchema.parse(response)

      const tokenPriceDetails = tokens
        .map((token) => {
          const tokenPrice = parsedResponse.prices.find(
            (tokenPrice) =>
              tokenPrice.pricingId && tokenPrice.pricingId === token.pricingId,
          )

          if (!tokenPrice) {
            return
          }
          return {
            ...tokenPrice,
            networkId,
            address: token.address,
          }
        })
        .filter((tp): tp is TokenPriceDetails => tp !== undefined)

      return tokenPriceDetails
    } catch (e) {
      console.error("Error fetching token prices", e)
    }
    return tokenPrices
  }

  /**
   * Fetch token details from the blockchain.
   * @param {AllowArray<RequestToken>} baseToken - The request token.
   * @returns {Promise<Token[]>} - The fetched tokens.
   */

  async fetchTokenDetails(baseToken: BaseToken): Promise<Token> {
    const token = await this.db.tokens
      .filter((t) => equalToken(t, baseToken))
      .first()

    // Only return cached token if it's not a custom token
    // Otherwise fetch token details from blockchain
    if (token && !token.custom) {
      return token
    }

    const network = await this.networkService.getById(baseToken.networkId)
    let name: string, symbol: string, decimals: number

    try {
      if (network.multicallAddress) {
        ;({ name, symbol, decimals } =
          await this.fetchTokenDetailsWithMulticall(baseToken, network))
      } else {
        ;({ name, symbol, decimals } =
          await this.fetchTokenDetailsWithoutMulticall(baseToken, network))
      }
    } catch (error) {
      console.error(error)
      throw new TokenError({
        code: "TOKEN_DETAILS_NOT_FOUND",
        message: `Token details not found for token ${baseToken.address}`,
      })
    }

    if (decimals > Number.MAX_SAFE_INTEGER) {
      throw new TokenError({
        code: "UNSAFE_DECIMALS",
        options: { context: { decimals } },
      })
    }

    const fetchedToken = {
      address: baseToken.address,
      networkId: baseToken.networkId,
      name,
      symbol,
      decimals,
      custom: true,
    }

    return fetchedToken
  }

  decodeFetchedTokenDetailsResponse(response: string[][]): FetchedTokenDetails {
    const res = {
      name: decodeShortStringArray(response[0]),
      symbol: decodeShortStringArray(response[1]),
      decimals: Number.parseInt(response[2][0]),
    }
    return res
  }

  async fetchTokenDetailsWithMulticall(
    baseToken: BaseToken,
    network: Network,
    tokenEntryPoints = ["name", "symbol", "decimals"],
  ): Promise<FetchedTokenDetails> {
    const multicall = getMulticallForNetwork(network)
    const responses = await Promise.all(
      tokenEntryPoints.map((entrypoint) =>
        multicall.callContract({
          contractAddress: baseToken.address,
          entrypoint,
        }),
      ),
    )
    return this.decodeFetchedTokenDetailsResponse(responses)
  }

  async fetchTokenDetailsWithoutMulticall(
    baseToken: BaseToken,
    network: Network,
    tokenEntryPoints = ["name", "symbol", "decimals"],
  ): Promise<FetchedTokenDetails> {
    const provider = getProvider(network)
    const responses = await Promise.all(
      tokenEntryPoints.map((entrypoint) =>
        provider.callContract({
          contractAddress: baseToken.address,
          entrypoint,
        }),
      ),
    )
    return this.decodeFetchedTokenDetailsResponse(responses)
  }

  async getToken(baseToken: BaseToken): Promise<Token | undefined> {
    const parsedToken = BaseTokenSchema.parse(baseToken)
    const token = await this.db.tokens
      .filter((t) => equalToken(t, parsedToken))
      .first()
    return token
  }

  /**
   * Get tokens from the token repository.
   * @param {SelectorFn<Token>} selector - The selector function.
   * @returns {Promise<Token[]>} - The fetched tokens.
   */
  async getTokens(selector?: SelectorFn<Token>): Promise<Token[]> {
    if (selector) {
      const tokens = await this.db.tokens.toArray()
      return tokens.filter(selector)
    }
    return this.db.tokens.toArray()
  }

  /**
   * Get token balances for an account from the token balance repository.
   * @param {BaseWalletAccount} account - The account.
   * @param {Token[]} tokens - The tokens.
   * @returns {Promise<BaseTokenWithBalance[]>} - The fetched token balances.
   */
  async getAllTokenBalancesForAccount(
    account: Omit<BaseWalletAccount, "id">,
    tokens: Token[],
  ): Promise<BaseTokenWithBalance[]> {
    const allTokenBalances = await this.db.tokenBalances.toArray()
    const tokenBalances = allTokenBalances.filter(
      (token) =>
        token.networkId === account.networkId &&
        isEqualAddress(token.account, account.address) &&
        tokens.some((t) => equalToken(t, token)),
    )

    return tokenBalances
  }

  async getTokenBalanceForAccount(
    account: Omit<BaseWalletAccount, "id">, // token balances are unique by address and network
    token: Token,
  ): Promise<BaseTokenWithBalance | undefined> {
    const allTokenBalances = await this.db.tokenBalances.toArray()
    const tokenBalance = allTokenBalances.find(
      (t) =>
        t.networkId === account.networkId &&
        isEqualAddress(t.account, account.address) &&
        equalToken(t, token),
    )
    return tokenBalance
  }
  /**
   * Get currency value for tokens.
   * @param {BaseTokenWithBalance[]} tokensWithBalances - The tokens with balances.
   * @returns {Promise<TokenWithBalanceAndPrice[]>} - The tokens with balance and price.
   */
  async getCurrencyValueForTokens(
    tokensWithBalances: BaseTokenWithBalance[],
  ): Promise<TokenWithBalanceAndPrice[]> {
    const currencyValues = await this.db.tokenPrices.toArray()
    const tokens = await this.getTokens((t) =>
      tokensWithBalances.some((tb) => equalToken(tb, t)),
    )

    const tokenWithPrices = tokensWithBalances.map((tb) => {
      const tokenPrice = currencyValues.find((cv) => equalToken(cv, tb))

      if (!tokenPrice) {
        throw new TokenError({
          code: "TOKEN_PRICE_NOT_FOUND",
          message: `Token price for ${tb.address} not found`,
        })
      }

      const token = tokens.find((t) => equalToken(t, tb))

      if (!token) {
        throw new TokenError({
          code: "TOKEN_NOT_FOUND",
          message: `Token ${tb.address} not found`,
        })
      }

      const usdValue = convertTokenAmountToCurrencyValue({
        amount: tb.balance,
        decimals: token.decimals,
        unitCurrencyValue: tokenPrice.ccyValue,
      })

      if (!usdValue) {
        throw new TokenError({
          code: "UNABLE_TO_CALCULATE_CURRENCY_VALUE",
          message: `Unable to calculate currency value for token ${tb.address}`,
        })
      }

      return {
        ...tb,
        ...token,
        balance: BigInt(tb.balance),
        usdValue,
      }
    })

    return tokenWithPrices
  }

  async getTotalCurrencyBalance(
    tokensWithBalances: BaseTokenWithBalance[],
  ): Promise<string> {
    const tokenBalances =
      await this.getCurrencyValueForTokens(tokensWithBalances)
    const totalBalance = tokenBalances.reduce(
      (total, token) =>
        total + bigDecimal.parseCurrency(token.usdValue || "0").value,
      0n,
    )
    return bigDecimal.formatCurrency(totalBalance)
  }

  /**
   * Get total currency balance for accounts.
   * @param {BaseWalletAccount[]} accounts - The accounts.
   * @returns {Promise<{ [key: string]: string }>} - The total currency balance for accounts.
   */
  async getTotalCurrencyBalanceForAccounts(
    accounts: BaseWalletAccount[],
  ): Promise<{ [key: string]: string }> {
    const allTokenBalances = await this.db.tokenBalances.toArray()
    const tokenBalances = allTokenBalances.filter((tb) =>
      accounts.some(
        (a) => a.address === tb.account && a.networkId === tb.networkId,
      ),
    )

    const tokensWithBalanceAndPrice =
      await this.getCurrencyValueForTokens(tokenBalances)

    const groupedBalances = groupBy(
      tokensWithBalanceAndPrice,
      (tokenBalances) => `${tokenBalances.account}:${tokenBalances.networkId}`,
    )
    const totalCurrencyBalanceForAccounts: { [key: string]: string } = {}

    for (const account in groupedBalances) {
      const totalBalance = groupedBalances[account].reduce(
        (total, token) =>
          total + bigDecimal.parseCurrency(token.usdValue || "0").value,
        0n,
      )
      totalCurrencyBalanceForAccounts[account] =
        bigDecimal.formatCurrency(totalBalance)
    }

    return totalCurrencyBalanceForAccounts
  }

  async fetchAccountTokenBalancesFromBackend(
    account: BaseWalletAccount,
    opts?: retry.Options,
  ): Promise<BaseTokenWithBalance[]> {
    const defaultNetworkId = getDefaultNetworkId()
    /** This service only works for the default network */
    if (account.networkId !== defaultNetworkId) {
      return []
    }
    const apiBaseUrl = ARGENT_API_BASE_URL
    const argentApiNetwork = argentApiNetworkForNetwork(account.networkId)
    if (!argentApiNetwork) {
      return []
    }

    const url = urlJoin(
      apiBaseUrl,
      "activity",
      "starknet",
      argentApiNetwork,
      "account",
      stripAddressZeroPadding(account.address),
      "balance",
    )

    /** retry until status is "initialised" */
    const accountTokenBalancesResult =
      await retryUntilInitialised<ApiAccountTokenBalances>(
        () => this.httpService.get(url),
        apiAccountTokenBalancesSchema,
        opts,
      )

    const accountTokenBalances =
      accountTokenBalancesResult?.status === "initialised"
        ? accountTokenBalancesResult.balances
        : []

    const baseTokenWithBalances: BaseTokenWithBalance[] =
      accountTokenBalances.map((accountTokenBalance) => {
        return {
          address: accountTokenBalance.tokenAddress,
          balance: accountTokenBalance.tokenBalance,
          networkId: account.networkId,
          account: account.address,
        }
      })

    return baseTokenWithBalances
  }

  async reportSpamToken(
    token: BaseToken,
    account: BaseWalletAccount,
  ): Promise<void> {
    try {
      await this.httpService.post(this.ARGENT_API_TOKENS_REPORT_SPAM_URL, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenAddress: token.address,
          reporterAddress: account.address,
        }),
      })
    } catch {
      console.error("Error while reporting spam token")
    }
  }

  async getTokenInfo(token: BaseToken): Promise<Token | undefined> {
    const allTokensInfo = await this.db.tokensInfo.toArray()
    return allTokensInfo.find((t) => equalToken(t, token))
  }
}
