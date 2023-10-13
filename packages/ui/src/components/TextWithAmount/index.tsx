import { bigDecimal } from "@argent/shared"
import { Children, ReactElement, cloneElement } from "react"
import { BigNumberish } from "starknet"

export const TextWithAmount = ({
  amount,
  decimals = 0,
  children,
}: {
  amount: BigNumberish
  children: ReactElement
  decimals?: number
}) => {
  let dataValue
  const element = Children.only(children)

  try {
    const convertedAmount = BigInt(amount)
    dataValue = bigDecimal.formatUnits(convertedAmount, decimals)
  } catch (e) {
    // ignore parsing error
  }

  if (dataValue === undefined) {
    return <>{children}</>
  }

  return cloneElement(element, {
    "data-value": dataValue,
  })
}

export default TextWithAmount
