import urlJoin from "url-join"
import type { IHttpService } from "@argent/x-shared"
import type { INetworkService } from "../../network/service/INetworkService"
import type { ITokenService } from "../../token/__new/service/ITokenService"
import { urlWithQuery } from "../../utils/url"
import type { SwapOrderResponse } from "../model/order.model"
import {
  SwapOrderRequestSchema,
  SwapOrderResponseSchema,
} from "../model/order.model"
import type { SwapQuoteResponse } from "../model/quote.model"
import { SwapQuoteResponseSchema } from "../model/quote.model"
import type { Trade } from "../model/trade.model"
import { TradeSchema } from "../model/trade.model"
import type { ISharedSwapService } from "./ISharedSwapService"
import { SwapError } from "../../errors/swap"
import { calculateTotalFee } from "../utils"
import { ampli } from "../../analytics"

export class SharedSwapService implements ISharedSwapService {
  swapQuoteUrl: string
  swapOrderUrl: string

  constructor(
    private readonly tokenService: ITokenService,
    private readonly networkService: INetworkService,
    private readonly httpService: IHttpService,
    swapBaseUrl?: string,
  ) {
    if (!swapBaseUrl) {
      throw new SwapError({ code: "NO_SWAP_URL" })
    }

    this.swapQuoteUrl = urlJoin(swapBaseUrl, "/quote")
    this.swapOrderUrl = urlJoin(swapBaseUrl, "/order")
  }

  async getSwapQuoteForPay(
    payTokenAddress: string,
    receiveTokenAddress: string,
    accountAddress: string,
    sellAmount?: string,
    buyAmount?: string,
  ): Promise<SwapQuoteResponse> {
    const queryParams: Record<string, string | number | undefined> = {
      chain: "starknet",
      currency: "USD",
      sellToken: payTokenAddress,
      buyToken: receiveTokenAddress,
      accountAddress,
    }

    if (sellAmount) {
      queryParams.sellAmount = sellAmount
    } else {
      queryParams.buyAmount = buyAmount
    }

    const quoteUrl = urlWithQuery(this.swapQuoteUrl, queryParams)
    try {
      const response = await this.httpService.get(quoteUrl)
      const quoteResult = await SwapQuoteResponseSchema.parseAsync(response)
      return quoteResult
    } catch (error) {
      ampli.swapQuoteFailed({
        "error type": `${error}` as any,
        "wallet platform": "browser extension",
      })
      throw new SwapError({ code: "INVALID_QUOTE_RESPONSE" })
    }
  }

  async getSwapTradeFromQuote(
    quote: SwapQuoteResponse,
    networkId: string,
  ): Promise<Trade> {
    const currentNetwork = await this.networkService.getById(networkId)

    if (!currentNetwork) {
      throw new SwapError({ code: "NO_NETWORK_FOR_SWAP" })
    }

    const [payToken] = await this.tokenService.getTokens(
      (t) => t.address === quote.sellToken && t.networkId === currentNetwork.id,
    )

    const [receiveToken] = await this.tokenService.getTokens(
      (t) => t.address === quote.buyToken && t.networkId === currentNetwork.id,
    )

    if (!payToken || !receiveToken) {
      throw new SwapError({ code: "INVALID_SWAP_TOKENS" })
    }

    const { totalFee, totalFeeInCurrency, totalFeePercentage } =
      calculateTotalFee(quote)

    const trade = TradeSchema.parse({
      payToken,
      receiveToken,
      payAmount: quote.sellAmount,
      receiveAmount: quote.buyAmount,
      payAmountInCurrency: quote.sellAmountInCurrency,
      receiveAmountInCurrency: quote.buyAmountInCurrency,
      totalFee,
      totalFeeInCurrency,
      totalFeePercentage,
      expiresAt: quote.expiresAt,
      expiresIn: quote.expiresIn,
      route: quote.routes[0],
      data: quote.data,
    })

    return trade
  }

  async getSwapOrderFromTrade(
    accountAddress: string,
    trade: Trade,
    userSlippageTolerance: number,
  ): Promise<SwapOrderResponse> {
    const body = SwapOrderRequestSchema.parse({
      chain: "starknet",
      sellToken: trade.payToken.address,
      buyToken: trade.receiveToken.address,
      sellAmount: trade.payAmount,
      buyAmount: trade.receiveAmount,
      accountAddress,
      slippage: userSlippageTolerance / 10000,
      data: trade.data,
    })

    try {
      const response = await this.httpService.post(this.swapOrderUrl, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const parsedResponse = await SwapOrderResponseSchema.parseAsync(response)
      return parsedResponse
    } catch {
      throw new SwapError({ code: "INVALID_SWAP_ORDER_RESPONSE" })
    }
  }
}
