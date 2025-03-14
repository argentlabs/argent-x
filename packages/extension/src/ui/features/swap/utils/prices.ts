import { bipsToPercent } from "."
import type { Trade } from "../../../../shared/swap/model/trade.model"
import { TradeType } from "../../../../shared/swap/model/trade.model"
import type { BigDecimal } from "@argent/x-shared"
import {
  abbreviateNumber,
  bigDecimal,
  prettifyTokenAmount,
} from "@argent/x-shared"
import { Field } from "../state/fields"

/**
 * Calculates the execution price given a numerator and denominator.
 * @param numerator - The numerator amount in BigDecimal.
 * @param denominator - The denominator amount in BigDecimal.
 * @returns The execution price as a BigDecimal.
 */
export function getExecutionPrice(
  numerator: BigDecimal,
  denominator: BigDecimal,
) {
  return bigDecimal.div(numerator, denominator)
}

/**
 * Helper function to format the execution price from BigDecimal amounts.
 * @param a - The numerator amount in BigDecimal.
 * @param b - The denominator amount in BigDecimal.
 * @returns The formatted execution price or null if not calculable.
 */
function formattedExecutionPrice(a: BigDecimal, b: BigDecimal): string | null {
  const executionPrice = getExecutionPrice(a, b)
  return prettifyTokenAmount({
    amount: executionPrice.value,
    decimals: executionPrice.decimals,
  })
}

/**
 * Options for formatting the execution price of a trade.
 */
interface FormatExecutionPriceOptions {
  /**
   * The trade to format the execution price for.
   */
  trade?: Trade
  /**
   * Whether to invert the price in the formatting.
   */
  inverted?: boolean
  /**
   * Whether to include fees in the execution price.
   */
  includeFee?: boolean
  /**
   * The separator to use between the tokens in the formatted price.
   */
  separator?: string
}

/**
 * Formats the execution price of a trade including or excluding fees.
 * @param options - The FormatExecutionPriceOptions object.
 * @returns The formatted execution price with or without fees.
 */
export function formatExecutionPrice({
  trade,
  includeFee = true,
  inverted = false,
  separator = "≈",
}: FormatExecutionPriceOptions) {
  if (!trade) {
    return ""
  }

  let payTokenAmount = bigDecimal.toBigDecimal(
    trade.payAmount,
    trade.payToken.decimals,
  )

  const feeTokenAmount = bigDecimal.toBigDecimal(
    trade.totalFee,
    trade.payToken.decimals,
  )

  if (includeFee) {
    // Actual Execution price will be (payAmount - feeAmount) / receiveAmount
    payTokenAmount = bigDecimal.sub(payTokenAmount, feeTokenAmount)
  }

  const receiveTokenAmount = bigDecimal.toBigDecimal(
    trade.receiveAmount,
    trade.receiveToken.decimals,
  )

  const formattedPrice = inverted
    ? formattedExecutionPrice(payTokenAmount, receiveTokenAmount)
    : formattedExecutionPrice(receiveTokenAmount, payTokenAmount)

  const abbreviatedValue = abbreviateNumber(formattedPrice ?? undefined)

  return inverted
    ? `1 ${trade.receiveToken.symbol} ${separator} ${abbreviatedValue} ${trade.payToken.symbol}`
    : `1 ${trade.payToken.symbol} ${separator} ${abbreviatedValue} ${trade.receiveToken.symbol}`
}

/**
 * Computes the slippage-adjusted amounts for a trade.
 * @param trade - The trade to compute the amounts for.
 * @param allowedSlippage - The user-specified allowed slippage in bips.
 * @returns An object containing the maximum amount in and minimum amount out for the trade.
 */
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): { [field in Field]?: BigDecimal } {
  if (!trade)
    return {
      [Field.PAY]: undefined,
      [Field.RECEIVE]: undefined,
    }
  return {
    [Field.PAY]: maximumAmountInForTrade(trade, allowedSlippage),
    [Field.RECEIVE]: minimumAmountOutFromTrade(trade, allowedSlippage),
  }
}

/**
 * Calculates the minimum amount that should be received from a trade after accounting for slippage.
 * @param trade - The trade to calculate for.
 * @param slippage - The slippage percentage in basis points.
 * @returns The minimum amount that should be received as a BigDecimal.
 */
export function minimumAmountOutFromTrade(
  trade: Trade,
  slippage: number,
): BigDecimal {
  const slippageInPercent = bipsToPercent(slippage)

  const outputAmount: BigDecimal = {
    value: BigInt(trade.receiveAmount),
    decimals: trade.receiveToken.decimals,
  }

  if (trade.tradeType === TradeType.EXACT_RECEIVE) {
    return outputAmount
  }

  // Calculate the minimum amount out using the slippage
  // slippageAdjustedAmountOut = outputAmount / (1 + slippageInPercent)

  const denominator = bigDecimal.add(bigDecimal.ONE, slippageInPercent)

  return bigDecimal.div(outputAmount, denominator)
}

/**
 * Calculates the maximum amount that should be paid for a trade after accounting for slippage.
 * @param trade - The trade to calculate for.
 * @param slippage - The slippage percentage in basis points.
 * @returns The maximum amount that should be paid as a BigDecimal.
 */
export function maximumAmountInForTrade(
  trade: Trade,
  slippage: number,
): BigDecimal {
  const slippageInPercent = bipsToPercent(slippage)
  const inputAmount: BigDecimal = {
    value: BigInt(trade.payAmount),
    decimals: trade.payToken.decimals,
  }

  if (trade.tradeType === TradeType.EXACT_PAY) {
    return inputAmount
  }

  if (slippageInPercent.value <= 0n) {
    return inputAmount
  }

  // Calculate the maximum amount in using the slippage
  // slippageAdjustedAmountIn = inputAmount * (1 + slippageInPercent)
  const multiplier = bigDecimal.add(bigDecimal.ONE, slippageInPercent)
  return bigDecimal.mul(inputAmount, multiplier)
}
