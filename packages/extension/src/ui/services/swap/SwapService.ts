import type { Address } from "@argent/x-shared"
import type { messageClient } from "../trpc"
import type { ISwapService } from "./ISwapService"
import type { SwapQuoteResponse } from "../../../shared/swap/model/quote.model"
import type {
  SwapReviewTrade,
  Trade,
} from "../../../shared/swap/model/trade.model"
import type { SwapOrderResponse } from "../../../shared/swap/model/order.model"
import type { Call } from "starknet"

export class SwapService implements ISwapService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getSwapQuoteForPay(
    payTokenAddress: Address,
    receiveTokenAddress: Address,
    accountAddress: Address,
    sellAmount?: string,
    buyAmount?: string,
  ): Promise<SwapQuoteResponse> {
    return this.trpcMessageClient.swap.getSwapQuoteForPay.query({
      payTokenAddress,
      receiveTokenAddress,
      accountAddress,
      sellAmount,
      buyAmount,
    })
  }

  getSwapTradeFromQuote(
    quote: SwapQuoteResponse,
    networkId: string,
  ): Promise<Trade> {
    return this.trpcMessageClient.swap.getSwapTradeFromQuote.query({
      quote,
      networkId,
    })
  }

  getSwapOrderFromTrade(
    accountAddress: Address,
    trade: Trade,
    userSlippageTolerance: number,
  ): Promise<SwapOrderResponse> {
    return this.trpcMessageClient.swap.getSwapOrderFromTrade.mutate({
      accountAddress,
      trade,
      userSlippageTolerance,
    })
  }

  async makeSwap(
    transactions: Call[],
    title: string,
    tokenAddresses: [Address, Address],
    reviewTrade: SwapReviewTrade,
  ) {
    await this.trpcMessageClient.swap.makeSwap.mutate({
      transactions,
      title,
      tokenAddresses,
      reviewTrade,
    })
  }
}
