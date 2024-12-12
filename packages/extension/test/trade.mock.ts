import type { Trade } from "../src/shared/swap/model/trade.model"
import { TradeType } from "../src/shared/swap/model/trade.model"

const defaultTrade: Trade = {
  receiveAmount: "2480805239052254504",
  receiveToken: {
    address: "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
    decimals: 18,
    symbol: "DAI",
    name: "Dai Stablecoin",
    networkId: "mainnet-alpha",
  },
  tradeType: TradeType.EXACT_PAY,
  receiveAmountInCurrency: "2.4753275",
  payAmount: "2480805239052254504",
  payToken: {
    address:
      "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
    symbol: "ETH",
    name: "Ether",
    networkId: "mainnet-alpha",
  },
  payAmountInCurrency: "2.477736",
  totalFee: "485264460032841",
  totalFeeInCurrency: "0.0004839",
  totalFeePercentage: 0.0002,
  expiresAt: 1700717256144,
  expiresIn: 120000,
  route: {
    name: "10kSwap",
    percent: 1.0,
    sellToken:
      "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    buyToken:
      "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
    routes: [],
  },
  data: {
    quoteId: "691cae98-4aad-486d-a135-6ebcad8a42ac",
  },
}

export const getMockTrade = (trade: Partial<Trade> = {}): Trade => {
  return {
    ...defaultTrade,
    ...trade,
  }
}
