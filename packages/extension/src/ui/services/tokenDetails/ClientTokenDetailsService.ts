import type { messageClient } from "../trpc"
import type {
  ITokensDetailsService,
  TokenGraphInput,
} from "../../../shared/tokenDetails/interface"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import type { Address } from "@argent/x-shared"

export class ClientTokenDetailsService implements ITokensDetailsService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async fetchTokenGraph({
    tokenAddress,
    currency,
    timeFrame,
    chain,
  }: TokenGraphInput) {
    return this.trpcClient.tokens.fetchTokenGraph.query({
      tokenAddress,
      currency,
      timeFrame,
      chain,
    })
  }

  async fetchTokenActivities({
    tokenAddress,
    account,
  }: {
    tokenAddress: Address
    account: BaseWalletAccount
  }) {
    return this.trpcClient.tokens.fetchTokenActivities.query({
      tokenAddress,
      account,
    })
  }
}
