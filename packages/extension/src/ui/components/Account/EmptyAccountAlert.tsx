import { ethers } from "ethers"
import { FC } from "react"
import styled from "styled-components"

import { useAccount } from "../../states/account"
import { makeClickable } from "../../utils/a11y"
import { formatAddress } from "../../utils/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../utils/transactions"
import { Alert } from "../Alert"
import { Button } from "../Button"
import { CopyTooltip } from "../CopyTooltip"

const AlertWrapper = styled(Alert)`
  gap: 16px;
  padding: 18px 32px 26px;
  margin: 0 20px 8px;
`

const Title = styled.h2`
  font-style: normal;
  font-weight: bold;
  font-size: 22px;
  line-height: 28px;
`

const Paragraph = styled.p`
  font-size: 13px;
  line-height: 18px;
  text-align: center;
`

const Buttons = styled.div<{
  buttonsAmount: number
}>`
  margin-top: 8px;
  display: flex;
  width: 100%;
  gap: 16px;

  & > * {
    width: ${({ buttonsAmount }) => 100 / buttonsAmount}%;
  }
`

interface EmptyAccountAlertProps {
  mintableAddress?: string
  accountAddress: string
}

export const EmptyAccountAlert: FC<EmptyAccountAlertProps> = ({
  mintableAddress,
  accountAddress,
}) => {
  const { selectedAccount } = useAccount()
  const handleMint = () => {
    if (!selectedAccount || !mintableAddress) {
      return
    }

    sendTransaction({
      to: mintableAddress,
      method: "mint",
      calldata: {
        recipient: selectedAccount,
        amount: getUint256CalldataFromBN(ethers.utils.parseUnits("1000", 18)),
      },
    })
  }

  return (
    <AlertWrapper>
      <Title>Deposit funds</Title>
      <Paragraph>
        Or learn how to deploy a contract and mint some tokens
      </Paragraph>
      <Buttons buttonsAmount={mintableAddress ? 2 : 1}>
        <CopyTooltip
          copyValue={formatAddress(accountAddress)}
          message="Account address copied!"
        >
          <Button>Receive</Button>
        </CopyTooltip>
        {mintableAddress && (
          <Button {...makeClickable(handleMint)}>Mint</Button>
        )}
      </Buttons>
    </AlertWrapper>
  )
}
