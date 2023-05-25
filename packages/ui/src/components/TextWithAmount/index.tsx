import { BigNumberish, formatUnits, toBigInt } from "ethers"
import { Children, ReactElement, cloneElement } from "react"

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
    const convertedAmount = toBigInt(amount)
    dataValue = formatUnits(convertedAmount, decimals)
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
