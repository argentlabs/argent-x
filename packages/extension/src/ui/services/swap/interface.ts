import { Address } from "@argent/shared"
import { SwapOrderResponse } from "../../../shared/swap/model/order.model"
import { SwapQuoteResponse } from "../../../shared/swap/model/quote.model"
import { Trade } from "../../../shared/swap/model/trade.model"
import { Call } from "starknet"

export interface ISwapService {
  getSwapQuoteForPay: (
    payTokenAddress: Address,
    receiveTokenAddress: Address,
    payAmount: string,
    accountAddress: Address,
  ) => Promise<SwapQuoteResponse>
  getSwapTradeFromQuote: (
    quote: SwapQuoteResponse,
    networkId: string,
  ) => Promise<Trade>
  getSwapOrderFromTrade: (
    accountAddress: Address,
    trade: Trade,
    userSlippage: number,
  ) => Promise<SwapOrderResponse>
  makeSwap(transaction: Call[], title: string): Promise<void>
}
