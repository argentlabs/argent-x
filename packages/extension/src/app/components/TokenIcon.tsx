import { FC } from "react"
import { starknetKeccak } from "starknet/dist/utils/hash"
import styled from "styled-components"

import { getAccountColor } from "../utils/wallet"

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
  const index = parseInt(starknetKeccak(name).toString().slice(-2))
  const color = getAccountColor(index + 3, false)
  return (
    <Icon
      size={large ? 48 : 40}
      src={`https://eu.ui-avatars.com/api/?name=${name}&background=${color}&color=fff`}
    />
  )
}
