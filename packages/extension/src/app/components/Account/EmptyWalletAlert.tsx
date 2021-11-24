import { ethers } from "ethers"
import { FC } from "react"
import styled from "styled-components"

import { makeClickable } from "../../utils/a11y"
import { Button } from "../Button"
import { TokenAction } from "../Token"

const PLAYGROUND_TEST_TOKEN =
  "0x4e3920043b272975b32dfc0121817d6e6a943dc266d7ead1e6152e472201f97"

const Alert = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin: 40px 20px;
`

const Title = styled.h2`
  font-style: normal;
  font-weight: bold;
  font-size: 22px;
  line-height: 28px;
`

const Paragraph = styled.p`
  font-size: 15px;
  line-height: 20px;
`

const Buttons = styled.div`
  display: flex;
  gap: 16px;
`

const AlertButton = styled(Button)`
  width: 100px;
`

export const EmptyWalletAlert: FC<{
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}> = ({ onAction }) => (
  <Alert>
    <Title>Deposit Funds</Title>
    <Paragraph>
      Or learn how to deploy a contract and mint some tokens
    </Paragraph>
    <Buttons>
      <AlertButton>Receive</AlertButton>
      <AlertButton
        {...makeClickable(() => {
          onAction?.(PLAYGROUND_TEST_TOKEN, {
            type: "MINT",
            amount: ethers.utils.parseUnits("1000", 18),
          })
        })}
      >
        Mint
      </AlertButton>
    </Buttons>
  </Alert>
)
