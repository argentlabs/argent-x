import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { ethers } from "ethers"
import React, { FC, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { getNetwork } from "../../shared/networks"
import {
  AccountAddressIconsWrapper,
  AccountAddressLink,
  AccountAddressWrapper,
} from "../components/Account/Address"
import { Alert } from "../components/Alert"
import { BackButton } from "../components/BackButton"
import { Button, ButtonGroup } from "../components/Button"
import { CopyTooltip } from "../components/CopyTooltip"
import { Header } from "../components/Header"
import { InputText } from "../components/Input"
import { TokenIcon } from "../components/TokenIcon"
import { routes } from "../routes"
import { useAppState } from "../states/app"
import { useTokensWithBalance } from "../states/tokens"
import { formatAddress, truncateAddress } from "../utils/addresses"
import { toTokenView } from "../utils/tokens"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../utils/transactions"

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
const TokenAddressWrapper = styled(AccountAddressWrapper)`
  padding-top: 6px;
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
  const { switcherNetworkId } = useAppState()

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  if (!token) {
    return <></>
  }

  const { address, name, symbol, balance, decimals } = toTokenView(token)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    navigate(routes.account())
  }

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <TokenScreenWrapper>
        <TokenTitle>
          <TokenIcon name={name} large />
          <TokenName>{name}</TokenName>
        </TokenTitle>
        <TokenAddressWrapper>
          <AccountAddressLink
            href={`${
              getNetwork(switcherNetworkId).explorerUrl
            }/contract/${address}`}
            target="_blank"
          >
            {truncateAddress(address)}
            <OpenInNewIcon style={{ fontSize: 10 }} />
          </AccountAddressLink>
          <CopyTooltip copyValue={formatAddress(address)} message="Copied!">
            <AccountAddressIconsWrapper>
              <ContentCopyIcon style={{ fontSize: 12 }} />
            </AccountAddressIconsWrapper>
          </CopyTooltip>
        </TokenAddressWrapper>
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
          <Button onClick={() => navigate(routes.hideToken(token.address))}>
            Hide
          </Button>
        </ButtonGroup>
      </TokenScreenWrapper>
    </>
  )
}
