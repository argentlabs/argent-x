import { number } from "starknet"

import { EstimateFeeResponse } from "../../shared/messages/TransactionMessage"
import { Network } from "../../shared/networks"
import { getFeeToken } from "../../shared/token"
import { TokenPriceService } from "../price"
import { Storage } from "../storage"
import { createStaleWhileRevalidateCache } from "../swr"

const tokenPriceService = new TokenPriceService(
  createStaleWhileRevalidateCache({
    storage: new Storage({}, "token-price-swr"),
    minTimeToStale: 1 * 60e3, // 1 minute
    maxTimeToLive: 5 * 60e3, // 5 minutes
  }),
)

export const determineFeePrice = async (
  network: Network,
  amount: number.BigNumberish,
  suggestedMaxFee: number.BigNumberish,
): Promise<undefined | EstimateFeeResponse["usd"]> => {
  const feeToken = getFeeToken(network.id)

  if (!feeToken) {
    return
  }

  const [amountUsd, suggestedMaxFeeUsd] = await Promise.all([
    tokenPriceService.getPriceForTokenExact(feeToken, amount, "usd"),
    tokenPriceService.getPriceForTokenExact(feeToken, suggestedMaxFee, "usd"),
  ])

  return {
    amount: amountUsd.toFixed(2),
    suggestedMaxFee: suggestedMaxFeeUsd.toFixed(2),
  }
}
