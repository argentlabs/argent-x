import { ethers } from "ethers"
import React, { FC, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { Alert } from "../../components/Alert"
import { Button, ButtonGroup } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { InputText } from "../../components/InputText"
import { routes } from "../../routes"
import { isValidAddress } from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"
import { useTokensWithBalance } from "./tokens.state"

export const TokenScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 24px;
  }
`

export const TokenTitle = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`

export const TokenName = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: #ffffff;
`

export const BalanceAlert = styled(Alert)`
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 20px;
`

const BalanceTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
`

const BalanceAmount = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 34px;
  line-height: 41px;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const BalanceSymbol = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 25px;
`

export const TokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const { tokenDetails } = useTokensWithBalance()
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  if (!token) {
    return <></>
  }

  const { address, name, symbol, balance, decimals, image } = toTokenView(token)

  const formattedBalance = parseFloat(balance).toPrecision(8)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!amount || !recipient || !isValidAddress(recipient)) {
        throw new Error("Invalid input")
      }
      sendTransaction({
        to: address,
        method: "transfer",
        calldata: {
          recipient,
          amount: getUint256CalldataFromBN(
            ethers.utils.parseUnits(amount, decimals),
          ),
        },
      })
      navigate(routes.accountTokens())
    } catch {
      // do nothing
    }
  }

  return (
    <>
      <IconBar back />
      <TokenScreenWrapper>
        <TokenTitle>
          <TokenIcon url={image} name={name} large />
          <TokenName>{name}</TokenName>
        </TokenTitle>
        <BalanceAlert>
          <BalanceTitle>Your balance</BalanceTitle>
          <CopyToClipboard text={balance}>
            <BalanceAmount>
              {balance.length > 8 ? formattedBalance : balance}
            </BalanceAmount>
          </CopyToClipboard>
          <BalanceSymbol>{symbol}</BalanceSymbol>
        </BalanceAlert>

        <ButtonGroup as="form" onSubmit={handleSubmit}>
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
          <Button onClick={() => navigate(routes.hideToken(token.address))}>
            Hide
          </Button>
        </ButtonGroup>
      </TokenScreenWrapper>
    </>
  )
}
