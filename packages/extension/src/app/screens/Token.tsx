import { BigNumber, ethers } from "ethers"
import { FC, useState } from "react"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button, ButtonGroup } from "../components/Button"
import { InputText } from "../components/Input"
import { TokenDetails } from "../utils/tokens"

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

  const handleSubmit = () =>
    onTransfer(
      token.address,
      recipient,
      ethers.utils.parseUnits(amount, token.decimals),
    )

  return (
    <TokenScreen>
      <BackButton onClick={onBack} />
      <p>Name: {token.name}</p>
      <p>Symbol: {token.symbol}</p>
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
