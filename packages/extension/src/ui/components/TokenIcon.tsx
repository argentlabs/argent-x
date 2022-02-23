import { FC } from "react"
import styled from "styled-components"

import { getColor } from "../utils/wallets"

const Icon = styled.img<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex: 0;
`

interface TokenIconProps {
  name: string
  large?: boolean
}

export const TokenIcon: FC<TokenIconProps> = ({ name, large = false }) => {
  const color = getColor(name)
  return (
    <Icon
      size={large ? 48 : 40}
      src={`https://eu.ui-avatars.com/api/?name=${name}&background=${color}&color=fff`}
    />
  )
}
