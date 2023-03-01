import { BigNumberish, formatUnits } from "ethers"
import React, { ReactElement } from "react"

export const TextWithAmount = ({
  amount,
  decimals = 0,
  children,
}: {
  amount: BigNumberish
  children: ReactElement
  decimals?: number
}) => {
  const convertedAmount = BigInt(amount)
  const element = React.Children.only(children)

  return React.cloneElement(element, {
    "data-value": formatUnits(convertedAmount, decimals),
  })
}

export default TextWithAmount
