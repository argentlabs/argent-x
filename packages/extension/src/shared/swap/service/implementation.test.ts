import { SwapOrderResponseSchema } from "./../model/order.model"
import { sampleQuoteJson } from "./quote.mock"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { SharedSwapService } from "./implementation"
import { ISharedSwapService } from "./interface"
import { getMockTrade } from "../../../../test/trade.mock"
import { getMockToken } from "../../../../test/token.mock"
import { SwapError } from "../../errors/swap"
import { SwapQuoteResponseSchema } from "../model/quote.model"
import { stark } from "starknet"
import { addressSchema } from "@argent/x-shared"
import { sampleOrderResponse } from "./order.mock"
import { httpService } from "../../http/singleton"
import { TradeType } from "../model/trade.model"
import { calculateTotalFee } from "../utils"

const mockPayTokenAddress = addressSchema.parse(stark.randomAddress())
const mockReceiveTokenAddress = addressSchema.parse(stark.randomAddress())
const mockAccountAddress = addressSchema.parse(stark.randomAddress())

/**
 * @vitest-environment happy-dom
 */

const server = setupServer(
  rest.get("*/quote", (req, res, ctx) => {
    return res(ctx.json(sampleQuoteJson))
  }),
  rest.post("*/order", (req, res, ctx) => {
    return res(ctx.json(sampleOrderResponse))
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("SharedSwapService", () => {
  const tokenServiceMock = {
    getTokens: vi.fn(),
  } as any

  const networkServiceMock = {
    getById: vi.fn(),
  } as any

  const swapBaseUrl = "https://www.mock-api.com"
  let sharedSwapService: ISharedSwapService

  beforeEach(() => {
    sharedSwapService = new SharedSwapService(
      tokenServiceMock,
      networkServiceMock,
      httpService,
      swapBaseUrl,
    )
  })

  describe("getSwapQuoteForPay", () => {
    it("fetches and returns a swap quote", async () => {
      const quote = await sharedSwapService.getSwapQuoteForPay(
        "0xpayTokenAddress",
        "0xreceiveTokenAddress",
        "1000",
        "0xaccountAddress",
      )
      expect(quote).toEqual(SwapQuoteResponseSchema.parse(sampleQuoteJson))
    })

    it("throws an error if the quote response is invalid", async () => {
      server.use(
        rest.get("*/quote", (req, res, ctx) => {
          return res(ctx.json({}))
        }),
      )

      await expect(
        sharedSwapService.getSwapQuoteForPay(
          "payTokenAddress",
          "receiveTokenAddress",
          "payAmount",
          "accountAddress",
        ),
      ).rejects.toThrowError(new SwapError({ code: "INVALID_QUOTE_RESPONSE" }))
    })
  })

  describe("getSwapTradeFromQuote", () => {
    // Mock successful network and token service responses
    beforeEach(() => {
      networkServiceMock.getById = vi
        .fn()
        .mockResolvedValue({ id: "networkId" })
      tokenServiceMock.getTokens = vi
        .fn()
        .mockResolvedValueOnce([getMockToken({ address: mockPayTokenAddress })])
        .mockResolvedValueOnce([
          getMockToken({ address: mockReceiveTokenAddress }),
        ])
    })

    it("returns a trade from a quote", async () => {
      const quote = SwapQuoteResponseSchema.parse(sampleQuoteJson)
      const trade = await sharedSwapService.getSwapTradeFromQuote(
        quote,
        "networkId",
      )

      tokenServiceMock.getTokens = vi
        .fn()
        .mockResolvedValueOnce([getMockToken({ address: mockPayTokenAddress })])
        .mockResolvedValueOnce([
          getMockToken({ address: mockReceiveTokenAddress }),
        ])

      const { totalFee, totalFeeInCurrency, totalFeePercentage } =
        calculateTotalFee(quote)

      expect(trade).toEqual({
        payToken: getMockToken({ address: mockPayTokenAddress }),
        receiveToken: getMockToken({ address: mockReceiveTokenAddress }),
        tradeType: TradeType.EXACT_PAY,
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
    })

    it("throws an error if no network is found for the swap", async () => {
      networkServiceMock.getById = vi.fn().mockResolvedValue(null)
      const quote = SwapQuoteResponseSchema.parse(sampleQuoteJson)

      await expect(
        sharedSwapService.getSwapTradeFromQuote(quote, "networkId"),
      ).rejects.toThrow(new SwapError({ code: "NO_NETWORK_FOR_SWAP" }))
    })
  })

  describe("getSwapOrderFromTrade", () => {
    it("submits a swap order and returns the response", async () => {
      const trade = getMockTrade()

      const orderResponse = await sharedSwapService.getSwapOrderFromTrade(
        mockAccountAddress,
        trade,
        100,
      )
      expect(orderResponse).toEqual(
        SwapOrderResponseSchema.parse(sampleOrderResponse),
      )
    })

    it("throws an error if the order response is invalid", async () => {
      server.use(
        rest.post("*/order", (req, res, ctx) => {
          return res(ctx.json({}))
        }),
      )

      const trade = getMockTrade()

      await expect(
        sharedSwapService.getSwapOrderFromTrade(mockAccountAddress, trade, 100),
      ).rejects.toThrow(new SwapError({ code: "INVALID_SWAP_ORDER_RESPONSE" }))
    })
  })
})
