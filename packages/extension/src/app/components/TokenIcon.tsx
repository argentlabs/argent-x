import { FC } from "react"
import { starknetKeccak } from "starknet/dist/utils/hash"
import styled from "styled-components"

import { getAccountColor } from "../utils/wallet"

const SmallIcon = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 40px;
  flex: 0;
`

const LargeIcon = styled.img`
  height: 48px;
  width: 48px;
  border-radius: 40px;
  flex: 0;
`

interface TokenIconProps {
  name: string
  large?: boolean
}

export const TokenIcon: FC<TokenIconProps> = ({ name, large = false }) => {
  const index = parseInt(starknetKeccak(name).toString().slice(-2))
  const color = getAccountColor(index + 3, false)
  const Icon = large ? LargeIcon : SmallIcon
  return (
    <Icon
      src={`https://eu.ui-avatars.com/api/?name=${name}&background=${color}&color=fff`}
    />
  )
}
