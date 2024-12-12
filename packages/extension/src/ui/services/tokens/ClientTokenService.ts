import type { Address } from "@argent/x-shared"
import { ensureDecimals } from "@argent/x-shared"

import type { TokenView } from "../../features/accountTokens/tokens.service"
import type { messageClient } from "../trpc"
import type { IClientTokenService } from "./IClientTokenService"
import { formatTokenBalance } from "./utils"
import type { RawArgs } from "starknet"
import { CallData } from "starknet"
import type { BalancesMap, PricesMap } from "./types"
import type {
  BaseTokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../../../shared/token/__new/types/tokenBalance.model"
import type {
  BaseToken,
  Token,
} from "../../../shared/token/__new/types/token.model"
import type { BaseWalletAccount } from "../../../shared/wallet.model"

export const DEFAULT_TOKEN_LENGTH = 9

export class ClientTokenService implements IClientTokenService {
  private length: number = DEFAULT_TOKEN_LENGTH
  constructor(private trpcMessageClient: typeof messageClient) {}

  async addToken(token: Token) {
    return await this.trpcMessageClient.tokens.addToken.mutate(token)
  }

  async removeToken(baseToken: BaseToken) {
    return await this.trpcMessageClient.tokens.removeToken.mutate(baseToken)
  }

  async toggleHideToken(token: BaseToken, hidden: boolean) {
    return await this.trpcMessageClient.tokens.toggleHideToken.mutate({
      token,
      hidden,
    })
  }

  async reportSpamToken(token: BaseToken, account: BaseWalletAccount) {
    return await this.trpcMessageClient.tokens.reportSpamToken.mutate({
      token,
      account,
    })
  }

  async fetchDetails(address?: Address, networkId?: string) {
    if (!address || !networkId) {
      return null
    }
    const { decimals, name, symbol } =
      await this.trpcMessageClient.tokens.fetchDetails.query({
        address,
        networkId,
      })
    const mergedDetails = {
      address: address,
      decimals,
      name,
      symbol,
    }
    return mergedDetails
  }

  async fetchTokenBalance(tokenAddress: Address, account: BaseWalletAccount) {
    const balance =
      await this.trpcMessageClient.tokens.fetchTokenBalance.mutate({
        tokenAddress,
        account,
      })
    return balance
  }

  toTokenView({
    name,
    symbol,
    decimals,
    balance,
    ...rest
  }: TokenWithOptionalBigIntBalance): TokenView {
    const decimalsNumber = ensureDecimals(decimals)
    return {
      name,
      symbol,
      decimals: decimalsNumber,
      balance: formatTokenBalance(this.length, balance, decimalsNumber),
      ...rest,
    }
  }

  async getAccountBalance(
    tokenAddress: Address,
    accountAddress: Address,
    networkId: string,
  ) {
    return await this.trpcMessageClient.tokens.getAccountBalance.query({
      tokenAddress,
      accountAddress,
      networkId,
    })
  }

  async getAllTokenBalances(
    tokenAddresses: Address[],
    accountAddress: Address,
    networkId: string,
  ) {
    const tokenBalances =
      await this.trpcMessageClient.tokens.getAllTokenBalances.query({
        networkId,
        accountAddress,
        tokenAddresses,
      })

    return tokenBalances.reduce<BalancesMap>((acc, tokenBalance) => {
      acc[tokenBalance.address] = tokenBalance.balance
      return acc
    }, {})
  }

  async getTokenBalance(
    tokenAddress: Address,
    accountAddress: Address,
    networkId: string,
  ) {
    const tokenBalance =
      await this.trpcMessageClient.tokens.getTokenBalance.query({
        tokenAddress,
        accountAddress,
        networkId,
      })
    return tokenBalance?.balance
  }

  async getTokenPricesForTokenBalances(
    tokensWithBalance: BaseTokenWithBalance[],
  ) {
    const prices =
      await this.trpcMessageClient.tokens.getCurrencyValueForTokens.query(
        tokensWithBalance,
      )

    return prices.reduce<PricesMap>((acc, price) => {
      acc[price.address] = price.usdValue
      return acc
    }, {})
  }

  async fetchCurrencyBalanceForAccountsFromBackend(
    accounts: BaseWalletAccount[],
  ) {
    return this.trpcMessageClient.tokens.fetchCurrencyBalanceForAccountsFromBackend.query(
      accounts,
    )
  }

  async send({
    to,
    method,
    calldata,
    title,
    shortTitle,
    subtitle,
    isMaxSend,
  }: {
    to: Address
    method: string
    calldata: RawArgs
    title: string
    shortTitle: string
    subtitle: string
    isMaxSend?: boolean
  }) {
    await this.trpcMessageClient.transfer.send.mutate({
      transactions: {
        contractAddress: to,
        entrypoint: method,
        calldata: CallData.toCalldata(calldata),
      },
      title,
      shortTitle,
      subtitle,
      isMaxSend,
    })
  }
}
