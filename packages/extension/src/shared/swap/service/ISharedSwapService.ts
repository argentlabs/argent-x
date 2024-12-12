import type { SwapOrderResponse } from "../model/order.model"
import type { SwapQuoteResponse } from "../model/quote.model"
import type { Trade } from "../model/trade.model"

export interface ISharedSwapService {
  getSwapQuoteForPay: (
    payTokenAddress: string,
    receiveTokenAddress: string,
    accountAddress: string,
    sellAmount?: string,
    buyAmount?: string,
  ) => Promise<SwapQuoteResponse>
  getSwapTradeFromQuote: (
    quote: SwapQuoteResponse,
    networkId: string,
  ) => Promise<Trade>
  getSwapOrderFromTrade: (
    accountAddress: string,
    trade: Trade,
    userSlippage: number,
  ) => Promise<SwapOrderResponse>
}
