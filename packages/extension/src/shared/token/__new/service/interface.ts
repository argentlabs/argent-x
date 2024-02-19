import { ProvisionActivityPayload } from "../../../activity/types"
import { AllowArray, SelectorFn } from "../../../storage/__new/interface"
import { BaseWalletAccount } from "../../../wallet.model"
import { BaseToken, Token } from "../types/token.model"
import { BaseTokenWithBalance } from "../types/tokenBalance.model"
import { ApiTokenInfo } from "../types/tokenInfo.model"
import {
  TokenPriceDetails,
  TokenWithBalanceAndPrice,
} from "../types/tokenPrice.model"

/**
 * ITokenService interface provides methods for managing tokens, including storage methods, fetch methods, and get methods.
 */
export interface ITokenService {
  /**
   * Storage methods - These methods interact with the storage system
   * addToken: Used to add new tokens to the storage
   * removeToken: Remove existing tokens from the storage
   * updateTokens: Update values of existing tokens in the storage
   * updateTokenBalances: Update the balances of tokens in the storage
   * updateTokenPrices: Update the prices of tokens in the storage
   */
  addToken: (token: AllowArray<Token>) => Promise<void>
  removeToken: (token: BaseToken) => Promise<void>
  updateTokens: (token: AllowArray<Token>) => Promise<void>
  updateTokenBalances(
    tokensWithBalance: AllowArray<BaseTokenWithBalance>,
  ): Promise<void>
  updateTokenPrices(tokenPrices: AllowArray<TokenPriceDetails>): Promise<void>
  handleProvisionTokens: (payload: ProvisionActivityPayload) => Promise<void>
  /**
   * Fetch methods - These methods fetch data from backend or chain
   * fetchTokenBalancesFromOnChain: Fetch balances of specified tokens from on-chain for given accounts
   * fetchTokenPricesFromBackend: Fetch prices of specified tokens from the backend
   * fetchTokenDetails: Fetch details of specified tokens from on-chain
   * fetchAccountTokenBalancesFromBackend: Fetch list of tokens and balances for given account from backend
   * getTokensInfoFromBackendForNetwork: Lazy fetch tokens info from local storage or backend max RefreshInterval.VERY_SLOW
   */
  fetchTokenBalancesFromOnChain: (
    accounts: AllowArray<BaseWalletAccount>,
    tokens?: AllowArray<Token>,
  ) => Promise<BaseTokenWithBalance[]>
  fetchTokenPricesFromBackend: (
    tokens: Token[],
    networkId: string,
  ) => Promise<TokenPriceDetails[]>
  fetchTokenDetails: (baseToken: BaseToken) => Promise<Token>
  fetchAccountTokenBalancesFromBackend: (
    account: BaseWalletAccount,
  ) => Promise<BaseTokenWithBalance[]>
  getTokensInfoFromBackendForNetwork(
    networkId: string,
  ): Promise<ApiTokenInfo[] | undefined>

  /**
   * Get methods - These methods retrieve data from local storage or perform calculations
   * getToken: Retrieve a token from the storage
   * getTokens: If a selector is provided, only tokens for that satisfies the selector is returned.
   * Otherwise, all tokens are returned.
   * getTokenBalancesForAccount: Retrieve balances of specified tokens for a particular account
   * getCurrencyValueForTokens: Calculate value of tokens in a specific currency
   * getTotalCurrencyBalanceForAccounts: Calculate total balance, given a list of accounts, and return as string
   */
  getToken: (baseToken: BaseToken) => Promise<Token | undefined>
  getTokens: (selector?: SelectorFn<Token>) => Promise<Token[]>
  getTokenBalancesForAccount: (
    account: BaseWalletAccount,
    tokens: Token[],
  ) => Promise<BaseTokenWithBalance[]>
  getCurrencyValueForTokens: (
    tokensWithBalances: BaseTokenWithBalance[],
  ) => Promise<TokenWithBalanceAndPrice[]>
  getTotalCurrencyBalanceForAccounts: (
    accounts: BaseWalletAccount[],
  ) => Promise<{ [key: string]: string }>
}
