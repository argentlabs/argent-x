import { Address } from "@argent/x-shared"
import { messageClient } from "../messaging/trpc"
import { ISwapService } from "./interface"
import { SwapQuoteResponse } from "../../../shared/swap/model/quote.model"
import { Trade } from "../../../shared/swap/model/trade.model"
import { SwapOrderResponse } from "../../../shared/swap/model/order.model"
import { Call } from "starknet"

export class SwapService implements ISwapService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getSwapQuoteForPay(
    payTokenAddress: Address,
    receiveTokenAddress: Address,
    payAmount: string,
    accountAddress: Address,
  ): Promise<SwapQuoteResponse> {
    return this.trpcMessageClient.swap.getSwapQuoteForPay.query({
      payTokenAddress,
      receiveTokenAddress,
      payAmount,
      accountAddress,
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

  async makeSwap(transactions: Call[], title: string) {
    await this.trpcMessageClient.swap.makeSwap.mutate({
      transactions,
      title,
    })
  }
}
