import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../../routes"
import { useGlobalState } from "../../states/global"
import { makeClickable } from "../../utils/a11y"
import { truncateAddress } from "../../utils/addresses"
import { WalletStatus, getAccountImageUrl } from "../../utils/wallet"
import {
  NetworkStatusIndicator,
  NetworkStatusWrapper,
} from "../NetworkSwitcher"
import { AccountColumn } from "./AccountColumn"
import { AccountRow } from "./AccountRow"
import { ProfilePicture } from "./ProfilePicture"

export const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

export const AccountListItemWrapper = styled.div`
  cursor: pointer;
  height: 76px;
  width: 256px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 20px 16px;

  display: flex;
  gap: 12px;
  align-items: center;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.25);
    outline: 0;
  }
`

const AccountStatusText = styled.p`
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
`

const AccountName = styled.h1`
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  margin: 0 0 5px 0;
`

interface AccountListProps {
  accountNumber: number
  address: string
  status: WalletStatus
}

export const AccountListItem: FC<AccountListProps> = ({
  accountNumber,
  address,
  status,
}) => {
  const navigate = useNavigate()

  return (
    <AccountListItemWrapper
      {...makeClickable(() => {
        useGlobalState.setState({ selectedWallet: address })
        navigate(routes.account)
      })}
    >
      <ProfilePicture src={getAccountImageUrl(accountNumber)} />
      <AccountRow>
        <AccountColumn>
          <AccountName>Account {accountNumber}</AccountName>
          <p>{truncateAddress(address)}</p>
        </AccountColumn>
        <NetworkStatusWrapper>
          <NetworkStatusIndicator status={status.code} />
          <AccountStatusText>{status.text}</AccountStatusText>
        </NetworkStatusWrapper>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
