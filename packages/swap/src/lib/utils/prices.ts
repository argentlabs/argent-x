import {
  CurrencyAmount,
  Fraction,
  JSBI,
  Percent,
  TokenAmount,
  Trade,
} from "../../sdk"
import { Field } from "../state/swap"
import { basisPointsToPercent } from "./index"

const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: Trade): {
  priceImpactWithoutFee?: Percent
  realizedLPFee?: CurrencyAmount
} {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction =>
            currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
          ONE_HUNDRED_PERCENT,
        ),
      )

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
    trade && realizedLPFee
      ? trade.priceImpact.subtract(realizedLPFee)
      : undefined

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(
        priceImpactWithoutFeeFraction?.numerator,
        priceImpactWithoutFeeFraction?.denominator,
      )
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(
          trade.inputAmount.token,
          realizedLPFee.multiply(trade.inputAmount.raw).quotient,
        )
      : CurrencyAmount.ether(
          realizedLPFee.multiply(trade.inputAmount.raw).quotient,
        ))

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  }
}

export function formatExecutionPrice(
  trade?: Trade,
  inverted?: boolean,
  separator = "~",
): string {
  if (!trade) {
    return ""
  }

  return inverted
    ? `1 ${
        trade.outputAmount.currency.symbol
      } ${separator} ${trade.executionPrice.invert().toSignificant(5)} ${
        trade.inputAmount.currency.symbol
      }`
    : `1 ${
        trade.inputAmount.currency.symbol
      } ${separator} ${trade.executionPrice.toSignificant(5)} ${
        trade.outputAmount.currency.symbol
      } `
}

export function formatExecutionPriceWithFee(
  trade?: Trade,
  inverted?: boolean,
  separator = "~",
): string {
  if (!trade) {
    return ""
  }

  return inverted
    ? `1 ${
        trade.outputAmount.currency.symbol
      } ${separator} ${trade.executionPriceWithFee.invert().toSignificant(5)} ${
        trade.inputAmount.currency.symbol
      }`
    : `1 ${
        trade.inputAmount.currency.symbol
      } ${separator} ${trade.executionPriceWithFee.toSignificant(5)} ${
        trade.outputAmount.currency.symbol
      } `
}
