import type { Address } from "@argent/x-shared"
import type { SwapOrderResponse } from "../../../shared/swap/model/order.model"
import type { SwapQuoteResponse } from "../../../shared/swap/model/quote.model"
import type { Trade } from "../../../shared/swap/model/trade.model"
import type { Call } from "starknet"

export interface ISwapService {
  getSwapQuoteForPay: (
    payTokenAddress: Address,
    receiveTokenAddress: Address,
    accountAddress: Address,
    sellAmount?: string,
    buyAmount?: string,
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
  makeSwap(
    transaction: Call[],
    title: string,
    tokenAddresses: [Address, Address],
  ): Promise<void>
}
