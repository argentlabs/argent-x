import { FC } from "react"
import styled from "styled-components"

import { getColor } from "../accounts/accounts.service"

const Icon = styled.img<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex: 0;

  /* add min values so it reserves the space while loading */
  min-height: ${({ size }) => size}px;
  min-width: ${({ size }) => size}px;
`

export interface TokenIconProps {
  name: string
  url?: string
  large?: boolean
  small?: boolean
  size?: number
}

export const getTokenIconUrl = ({
  url,
  name,
}: Pick<TokenIconProps, "url" | "name">) => {
  if (url && url.length) {
    return url
  }
  const color = getColor(name)
  return `https://eu.ui-avatars.com/api/?name=${name}&background=${color}&color=fff`
}

export const TokenIcon: FC<TokenIconProps> = ({
  name,
  url,
  large = false,
  small = false,
  size,
}) => {
  const src = getTokenIconUrl({ url, name })
  return (
    <Icon
      size={size ? size : large ? 48 : small ? 24 : 40}
      alt={name}
      src={src}
    />
  )
}
