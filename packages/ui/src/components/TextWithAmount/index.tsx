import React, { ReactElement } from "react"

export const TextWithAmount = ({
  amount,
  children,
}: {
  amount: string | number
  children: ReactElement
}) => {
  const element = React.Children.only(children)

  return React.cloneElement(element, {
    alt: amount,
  })
}

export default TextWithAmount
