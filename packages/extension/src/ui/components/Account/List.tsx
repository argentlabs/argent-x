import { FC } from "react"
import styled from "styled-components"

import { makeClickable } from "../../utils/a11y"
import { AccountStatus, getAccountImageUrl } from "../../utils/accounts"
import { truncateAddress } from "../../utils/addresses"
import { NetworkStatusWrapper } from "../NetworkSwitcher"
import {
  AccountStatusIndicator,
  mapAccountStatusCodeToColor,
} from "../StatusIndicator"
import { AccountColumn } from "./AccountColumn"
import { AccountRow } from "./AccountRow"
import { ProfilePicture } from "./ProfilePicture"

export const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  accountName: string
  address: string
  status: AccountStatus
  onClick?: () => void
}

export const AccountListItem: FC<AccountListProps> = ({
  accountName,
  address,
  status,
  onClick,
}) => {
  return (
    <AccountListItemWrapper {...makeClickable(onClick)}>
      <ProfilePicture src={getAccountImageUrl(accountName, address)} />
      <AccountRow>
        <AccountColumn>
          <AccountName>{accountName}</AccountName>
          <p>{truncateAddress(address)}</p>
        </AccountColumn>
        <NetworkStatusWrapper>
          <AccountStatusIndicator
            color={mapAccountStatusCodeToColor(status.code)}
          />
          <AccountStatusText>{status.text}</AccountStatusText>
        </NetworkStatusWrapper>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
