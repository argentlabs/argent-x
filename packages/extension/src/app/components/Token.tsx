import { BigNumber } from "@ethersproject/bignumber"
import { FC } from "react"
import styled from "styled-components"

import { makeClickable } from "../utils/a11y"
import { IconButton } from "./IconButton"
import { TokenIcon } from "./TokenIcon"

export const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  cursor: pointer;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.25);
  }
`

const TokenDetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const TokenTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`

export const TokenTitle = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  margin: 0;
`

const TokenMeta = styled.p`
  font-size: 13px;
  line-height: 18px;
  color: #8f8e8c;
  margin: 0;
`

const TokenBalance = styled.p`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: right;
  max-width: 64px;
  overflow: hidden;
  white-space: nowrap;
`

export const AddTokenIconButton = styled(IconButton)`
  &:hover,
  &:focus {
    background-color: rgba(255, 255, 255, 0.15);
    outline: 0;
  }
`

export type TokenAction =
  | { type: "MINT"; amount: BigNumber }
  | { type: "TRANSFER"; to: string; amount: BigNumber }

interface TokenListItemProps {
  symbol: string
  name: string
  balance: string
  decimals?: number
  index?: number
  onClick?: () => void
}

export const TokenListItem: FC<TokenListItemProps> = ({
  balance,
  name,
  symbol,
  index = 0,
  decimals,
  onClick,
  ...props
}) => {
  return (
    <div {...props} style={{ borderRadius: 4, overflow: "hidden" }}>
      <TokenWrapper {...makeClickable(onClick)}>
        <TokenIcon name={name} />
        <TokenDetailsWrapper>
          <TokenTextGroup>
            <TokenTitle>{symbol}</TokenTitle>
            <TokenMeta>{name}</TokenMeta>
          </TokenTextGroup>
          <TokenBalance>{balance}</TokenBalance>
        </TokenDetailsWrapper>
      </TokenWrapper>
    </div>
  )
}
