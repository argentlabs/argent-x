import { FC } from 'react';
import styled from 'styled-components';
import { getProfileImageUrl, WalletStatus } from '../../utils/wallet';
import { makeClickable } from '../../utils/a11y';
import { AccountAddress, AccountName } from './Address';
import { AccountColumn, AccountRow } from './Header';
import {
  AccountStatusIndicator,
  AccountStatusText,
  AccountStatusWrapper,
} from './Network';
import { ProfilePicture } from './ProfilePicture';

export const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

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
`;

interface AccountListProps {
  accountNumber: number;
  address: string;
  status: WalletStatus;
  onClick?: () => void;
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
      <ProfilePicture src={getProfileImageUrl(accountNumber)} />
      <AccountRow>
        <AccountColumn>
          <AccountName>Account {accountNumber}</AccountName>
          <AccountAddress>{address}</AccountAddress>
        </AccountColumn>
        <AccountStatusWrapper>
          <AccountStatusIndicator status={status.code} />
          <AccountStatusText>{status.text}</AccountStatusText>
        </AccountStatusWrapper>
      </AccountRow>
    </AccountListItemWrapper>
  );
};
