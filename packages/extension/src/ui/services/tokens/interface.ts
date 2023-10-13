import { Address } from "@argent/shared"

import { Network } from "../../../shared/network"
import { TokenView } from "../../features/accountTokens/tokens.service"
import { BigNumberish } from "starknet"
import { BalancesMap } from "./types"
import {
  BaseTokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../../../shared/token/__new/types/tokenBalance.model"
import {
  BaseToken,
  RequestToken,
  Token,
} from "../../../shared/token/__new/types/token.model"

export interface ITokensService {
  addToken: (token: Token) => Promise<void>
  removeToken: (baseToken: BaseToken) => Promise<void>
  fetchDetails: (
    address: Address,
    networkId: string,
  ) => Promise<RequestToken | null>

  fetchTokenBalance: (
    tokenAddress: Address,
    accountAddress: Address,
    networkId: string,
  ) => Promise<string>

  toTokenView: (token: TokenWithOptionalBigIntBalance) => TokenView
  getAccountBalance: (
    tokenAddress: Address,
    accountAddress: Address,
    networkId: string,
  ) => Promise<BaseTokenWithBalance>
  getAllTokenBalances: (
    tokenAddresses: Address[],
    accountAddress: Address,
    networkId: string,
  ) => Promise<BalancesMap>
  fetchFeeTokenBalance: (
    accountAddress: Address,
    networkId: Address,
  ) => Promise<BigNumberish>
  fetchFeeTokenBalanceForAllAccounts(
    accountAddresses: Address[],
    network: Network,
  ): Promise<Record<string, string>>
}
