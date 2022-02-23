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
  margin: 16px 20px;
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
      <Buttons>
        <CopyTooltip
          copyValue={formatAddress(accountAddress)}
          message="Account address copied!"
        >
          <AlertButton>Receive</AlertButton>
        </CopyTooltip>
        {mintableAddress && (
          <AlertButton {...makeClickable(handleMint)}>Mint</AlertButton>
        )}
      </Buttons>
    </AlertWrapper>
  )
}
