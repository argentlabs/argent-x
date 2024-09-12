import { Address } from "@argent/x-shared"

import { TokenView } from "../../features/accountTokens/tokens.service"
import { RawArgs } from "starknet"
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

export interface IClientTokenService {
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
  send({
    to,
    method,
    calldata,
    title,
    shortTitle,
    subtitle,
  }: {
    to: Address
    method: string
    calldata: RawArgs
    title: string
    shortTitle: string
    subtitle: string
  }): Promise<void>
}
