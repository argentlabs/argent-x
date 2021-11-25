import { BigNumber, ethers } from "ethers"
import { FC, useState } from "react"
import styled from "styled-components"

import { Alert } from "../components/Alert"
import { BackButton } from "../components/BackButton"
import { Button, ButtonGroup } from "../components/Button"
import { InputText } from "../components/Input"
import { TokenIcon } from "../components/TokenIcon"
import { TokenDetails, toDisplayToken } from "../utils/tokens"

const TokenScreen = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;

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

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`

const TokenName = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: #ffffff;
`

const BalanceAlert = styled(Alert)`
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
`

const BalanceSymbol = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 25px;
`

interface TokenProps {
  token: TokenDetails
  onBack: () => void
  onTransfer: (
    token: string,
    recipient: string,
    amount: BigNumber,
  ) => Promise<void> | void
}

export const Token: FC<TokenProps> = ({ token, onBack, onTransfer }) => {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")

  const { address, name, symbol, balance, decimals } = toDisplayToken(token)

  const handleSubmit = () =>
    onTransfer(address, recipient, ethers.utils.parseUnits(amount, decimals))

  return (
    <TokenScreen>
      <BackButton onClick={onBack} />

      <Header>
        <TokenIcon name={name} large />
        <TokenName>{name}</TokenName>
      </Header>

      <BalanceAlert>
        <BalanceTitle>Your balance</BalanceTitle>
        <BalanceAmount>{balance}</BalanceAmount>
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
      </ButtonGroup>
    </TokenScreen>
  )
}
