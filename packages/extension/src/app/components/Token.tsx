import { BigNumber } from "@ethersproject/bignumber"
import { ethers } from "ethers"
import { FC, useState } from "react"
import styled, { css } from "styled-components"

import { makeClickable } from "../utils/a11y"
import { getAccountColor } from "../utils/wallet"
import { Button, ButtonGroup } from "./Button"
import { IconButton } from "./IconButton"
import { InputText } from "./Input"

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

const TokenIcon = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 40px;
  flex: 0;
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

const TokenExtensionWrapper = styled.div<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  transition: all 200ms ease-in-out;
  margin: 0;
  height: auto;
  padding: 16px 8px;
  overflow: hidden;

  ${({ show }) =>
    show
      ? css`
          max-height: 400px;
        `
      : css`
          padding: 0 8px;
          max-height: 0px;
        `}
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
  mintable?: boolean
  onClick?: () => void
  onAction?: (action: TokenAction) => Promise<void> | void
}

export const TokenListItem: FC<TokenListItemProps> = ({
  balance,
  name,
  symbol,
  index = 0,
  decimals,
  onClick,
  onAction,
  mintable = false,
  ...props
}) => {
  const [expanded, setExpanded] = useState(false)
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  return (
    <div
      {...props}
      style={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid transparent",
        borderColor: expanded ? "rgba(255, 255, 255, 0.25)" : "transparent",
      }}
    >
      <TokenWrapper
        {...makeClickable(() => {
          setExpanded((x) => !x)
          onClick?.()
        })}
      >
        <TokenIcon
          src={`https://eu.ui-avatars.com/api/?name=${name}&background=${getAccountColor(
            index + 3,
            false,
          )}&color=fff`}
        />
        <TokenDetailsWrapper>
          <TokenTextGroup>
            <TokenTitle>{symbol}</TokenTitle>
            <TokenMeta>{name}</TokenMeta>
          </TokenTextGroup>
          <TokenBalance>{balance}</TokenBalance>
        </TokenDetailsWrapper>
      </TokenWrapper>

      <TokenExtensionWrapper show={expanded}>
        <ButtonGroup>
          {mintable && (
            <Button
              {...makeClickable(() => {
                onAction?.({
                  type: "MINT",
                  amount: ethers.utils.parseUnits("1000", decimals),
                })
              })}
            >
              Mint
            </Button>
          )}
          <ButtonGroup
            as="form"
            onSubmit={() => {
              onAction?.({
                type: "TRANSFER",
                to: recipient,
                amount: ethers.utils.parseUnits(amount, decimals),
              })
            }}
          >
            <InputText
              placeholder="Amount"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
            />
            <InputText
              placeholder="Recipient"
              value={recipient}
              onChange={(e: any) => setRecipient(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </ButtonGroup>
        </ButtonGroup>
      </TokenExtensionWrapper>
    </div>
  )
}
