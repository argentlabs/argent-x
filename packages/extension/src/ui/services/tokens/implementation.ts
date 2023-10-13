import { Address } from "@argent/shared"

import { Network } from "../../../shared/network"
import { TokenView } from "../../features/accountTokens/tokens.service"
import { getNetworkFeeToken } from "../../features/accountTokens/tokens.state"
import { messageClient } from "../messaging/trpc"
import { ITokensService } from "./interface"
import { formatTokenBalance } from "./utils"
import { BalancesMap, PricesMap } from "./types"
import {
  BaseTokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../../../shared/token/__new/types/tokenBalance.model"
import { TokenError } from "../../../shared/errors/token"
import { BaseToken, Token } from "../../../shared/token/__new/types/token.model"

export const DEFAULT_TOKEN_LENGTH = 9

export class TokenService implements ITokensService {
  private length: number = DEFAULT_TOKEN_LENGTH
  constructor(private trpcMessageClient: typeof messageClient) {}

  async addToken(token: Token) {
    return await this.trpcMessageClient.tokens.addToken.mutate(token)
  }

  async removeToken(baseToken: BaseToken) {
    return await this.trpcMessageClient.tokens.removeToken.mutate(baseToken)
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

  async fetchTokenBalance(
    tokenAddress: Address,
    accountAddress: Address,
    networkId: string,
  ) {
    const balance =
      await this.trpcMessageClient.tokens.fetchTokenBalance.mutate({
        tokenAddress,
        accountAddress,
        networkId,
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
    const decimalsNumber = decimals ?? 18
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

  async fetchFeeTokenBalance(accountAddress: Address, networkId: string) {
    // todo move to constructor
    const token = await getNetworkFeeToken(networkId)
    if (!token) {
      return "0x0"
    }

    const { balance } = await this.getAccountBalance(
      token.address,
      accountAddress,
      networkId,
    )

    return balance
  }

  async fetchFeeTokenBalanceForAllAccounts(
    accountAddresses: Address[],
    network: Network,
  ) {
    const token = await getNetworkFeeToken(network.id)
    if (!token) {
      throw new TokenError({
        code: "FEE_TOKEN_NOT_FOUND",
      })
    }

    const balances = (
      await Promise.all(
        accountAddresses.map((accountAddress) =>
          this.trpcMessageClient.tokens.getAccountBalance.query({
            tokenAddress: token.address,
            accountAddress,
            networkId: network.id,
          }),
        ),
      )
    ).map(({ balance }) => balance)

    return accountAddresses.reduce<Record<string, string>>((acc, addr, i) => {
      return {
        ...acc,
        [addr]: balances[i],
      }
    }, {})
  }
}
