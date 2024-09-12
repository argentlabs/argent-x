import { bigDecimal } from "@argent/x-shared"

export function sortByCurrencyValue(a: string, b: string) {
  const { value } = bigDecimal.sub(
    bigDecimal.parseCurrency(b),
    bigDecimal.parseCurrency(a),
  )

  return value < 0 ? -1 : value > 0 ? 1 : 0
}

export function sortByCurrencyBalance<T extends { currencyBalance: string }>(
  a: T,
  b: T,
) {
  return sortByCurrencyValue(a.currencyBalance, b.currencyBalance)
}
