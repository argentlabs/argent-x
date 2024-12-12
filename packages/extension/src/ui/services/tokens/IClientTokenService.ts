import type { Address } from "@argent/x-shared"

import type { TokenView } from "../../features/accountTokens/tokens.service"
import type { RawArgs } from "starknet"
import type { BalancesMap } from "./types"
import type {
  BaseTokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../../../shared/token/__new/types/tokenBalance.model"
import type {
  BaseToken,
  RequestToken,
  Token,
} from "../../../shared/token/__new/types/token.model"
import type { BaseWalletAccount } from "../../../shared/wallet.model"

export interface IClientTokenService {
  addToken: (token: Token) => Promise<void>
  removeToken: (baseToken: BaseToken) => Promise<void>
  fetchDetails: (
    address: Address,
    networkId: string,
  ) => Promise<RequestToken | null>

  fetchTokenBalance: (
    tokenAddress: Address,
    account: BaseWalletAccount,
  ) => Promise<string>

  toTokenView: (token: TokenWithOptionalBigIntBalance) => TokenView
  toggleHideToken: (token: BaseToken, hidden: boolean) => Promise<void>
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
  getTokenBalance: (
    tokenAddress: Address,
    accountAddress: Address,
    networkId: string,
  ) => Promise<string | undefined>
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
