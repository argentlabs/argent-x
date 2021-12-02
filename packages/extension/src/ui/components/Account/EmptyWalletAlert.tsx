import { ethers } from "ethers"
import { FC } from "react"
import styled from "styled-components"

import { makeClickable } from "../../utils/a11y"
import { playgroundToken } from "../../utils/tokens"
import { Alert } from "../Alert"
import { Button } from "../Button"
import { CopyTooltip } from "../CopyTooltip"
import { TokenAction } from "../Token"

const AlertWrapper = styled(Alert)`
  gap: 16px;
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
  text-align: center;
`

const Buttons = styled.div`
  display: flex;
  gap: 16px;
`

const AlertButton = styled(Button)`
  width: 100px;
`

interface EmptyWalletAlertProps {
  mintableAddress?: string
  walletAddress: string
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}

export const EmptyWalletAlert: FC<EmptyWalletAlertProps> = ({
  mintableAddress,
  walletAddress,
  onAction,
}) => (
  <AlertWrapper>
    <Title>Deposit Funds</Title>
    <Paragraph>
      Or learn how to deploy a contract and mint some tokens
    </Paragraph>
    <Buttons>
      <CopyTooltip
        copyValue={`starknet:${walletAddress}`}
        message="Wallet address copied!"
      >
        <AlertButton>Receive</AlertButton>
      </CopyTooltip>
      {mintableAddress && (
        <AlertButton
          {...makeClickable(() => {
            onAction?.(mintableAddress, {
              type: "MINT",
              amount: ethers.utils.parseUnits("1000", 18),
            })
          })}
        >
          Mint
        </AlertButton>
      )}
    </Buttons>
  </AlertWrapper>
)
