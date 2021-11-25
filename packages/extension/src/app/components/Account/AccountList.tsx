import { FC } from "react"
import styled from "styled-components"

import { makeClickable } from "../../utils/a11y"
import { truncateAddress } from "../../utils/addresses"
import { WalletStatus, getAccountImageUrl } from "../../utils/wallet"
import { AccountColumn, AccountRow } from "./Header"
import { AccountStatusIndicator, AccountStatusWrapper } from "./Network"
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
  accountNumber: number
  address: string
  status: WalletStatus
  onClick?: () => void
}

export const AccountListItem: FC<AccountListProps> = ({
  accountNumber,
  address,
  status,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
}) => {
  return (
    <AccountListItemWrapper {...makeClickable(onClick)}>
      <ProfilePicture src={getAccountImageUrl(accountNumber)} />
      <AccountRow>
        <AccountColumn>
          <AccountName>Account {accountNumber}</AccountName>
          <p>{truncateAddress(address)}</p>
        </AccountColumn>
        <AccountStatusWrapper>
          <AccountStatusIndicator status={status.code} />
          <AccountStatusText>{status.text}</AccountStatusText>
        </AccountStatusWrapper>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
