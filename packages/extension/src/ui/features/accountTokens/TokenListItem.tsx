import { FC } from "react"
import styled, { css, keyframes } from "styled-components"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../shared/token/price"
import { TokenIcon } from "./TokenIcon"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { toTokenView } from "./tokens.service"
import { TokenDetailsWithBalance } from "./tokens.state"

export const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.05);
  }
`

export const TokenDetailsWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow: hidden;
`

export const TokenTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const TokenTitle = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  margin: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
`

const TokenSymbol = styled.div`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  text-transform: uppercase;
`

export interface IIsLoading {
  isLoading?: boolean
}

export const isLoadingPulse = ({ isLoading }: IIsLoading) => {
  if (isLoading) {
    return css`
      animation: ${PulseAnimation} 1s ease-in-out infinite;
    `
  }
}

const PulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`

const TokenBalance = styled.div<IIsLoading>`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  ${isLoadingPulse}
`

const TokenCurrencyValue = styled.div<IIsLoading>`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 1;
  ${isLoadingPulse}
`

interface ITokenListItemContainer {
  token: TokenDetailsWithBalance
  // ...rest
  [x: string]: any
}

export const TokenListItemContainer: FC<ITokenListItemContainer> = ({
  token,
  ...rest
}) => {
  const currencyValue = useTokenBalanceToCurrencyValue(token)
  return <TokenListItem token={token} currencyValue={currencyValue} {...rest} />
}

export type TokenListItemVariant = "default" | "no-currency"

interface ITokenListItem {
  token: TokenDetailsWithBalance
  variant?: TokenListItemVariant
  isLoading?: boolean
  currencyValue: string | undefined
  showTokenSymbol?: boolean
  // ...rest
  [x: string]: any
}

export const TokenListItem: FC<ITokenListItem> = ({
  token,
  variant,
  isLoading = false,
  showTokenSymbol = false,
  currencyValue,
  ...rest
}) => {
  const { name, image, symbol } = toTokenView(token)
  const displayBalance = prettifyTokenBalance(token)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)
  const isNoCurrencyVariant = variant === "no-currency"
  return (
    <TokenWrapper {...rest}>
      <TokenIcon url={image} name={name} />
      <TokenDetailsWrapper>
        <TokenTextGroup>
          <TokenTitle>{name === "Ether" ? "Ethereum" : name}</TokenTitle>
          {!isNoCurrencyVariant && (
            <TokenBalance isLoading={isLoading}>{displayBalance}</TokenBalance>
          )}
          {showTokenSymbol && <TokenSymbol>{symbol}</TokenSymbol>}
        </TokenTextGroup>
        <TokenTextGroup>
          <TokenCurrencyValue isLoading={isLoading}>
            {isNoCurrencyVariant ? displayBalance : displayCurrencyValue}
          </TokenCurrencyValue>
        </TokenTextGroup>
      </TokenDetailsWrapper>
    </TokenWrapper>
  )
}
