import { bigDecimal } from "@argent/x-shared"
import { SwapQuoteResponse } from "../model/quote.model"
import { Trade } from "../model/trade.model"

type TotalTradeFee = Pick<
  Trade,
  "totalFee" | "totalFeeInCurrency" | "totalFeePercentage"
>

type QuoteFee = Pick<
  SwapQuoteResponse,
  | "providerFee"
  | "argentFee"
  | "argentFeeInCurrency"
  | "providerFeeInCurrency"
  | "argentFeePercentage"
  | "providerFeePercentage"
>

export function calculateTotalFee(quote: QuoteFee): TotalTradeFee {
  // This can be done because backend returns a token formatted amount
  const totalFee = BigInt(quote.providerFee) + BigInt(quote.argentFee)

  const totalFeeInCurrencyBig = bigDecimal.add(
    bigDecimal.parseCurrency(quote.argentFeeInCurrency),
    bigDecimal.parseCurrency(quote.providerFeeInCurrency),
  )

  const totalFeeInCurrency = bigDecimal.formatCurrency(
    totalFeeInCurrencyBig.value,
  )
  const totalFeePercentage =
    quote.argentFeePercentage + quote.providerFeePercentage

  return {
    totalFee: totalFee.toString(),
    totalFeePercentage,
    totalFeeInCurrency,
  }
}
