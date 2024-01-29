import { SwapOrderResponse } from "../model/order.model"
import { SwapQuoteResponse } from "../model/quote.model"
import { Trade } from "../model/trade.model"

export interface ISharedSwapService {
  getSwapQuoteForPay: (
    payTokenAddress: string,
    receiveTokenAddress: string,
    payAmount: string,
    accountAddress: string,
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
