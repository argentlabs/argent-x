import { FC, ReactNode } from "react"
import styled from "styled-components"

import { ArrowCircleDownIcon, LinkIcon } from "../../components/Icons/MuiIcons"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { formatTruncatedAddress } from "../../services/addresses"
import { NetworkStatusWrapper } from "../networks/NetworkSwitcher"
import { getNetworkAccountImageUrl } from "./accounts.service"
import { ProfilePicture } from "./ProfilePicture"

export interface IAccountListItem {
  accountName: string
  accountAddress: string
  networkId: string
  outline?: boolean
  highlight?: boolean
  deploying?: boolean
  upgrade?: boolean
  connected?: boolean
  children?: ReactNode
}

type AccountListItemWrapperProps = Pick<
  IAccountListItem,
  "highlight" | "outline"
>

export const AccountListItemWrapper = styled.div<AccountListItemWrapperProps>`
  cursor: pointer;
  background-color: ${({ highlight }) =>
    highlight ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 4px;
  padding: 20px 16px;
  border: 1px solid
    ${({ outline }) => (outline ? "rgba(255, 255, 255, 0.3)" : "transparent")};

  display: flex;
  gap: 12px;
  align-items: center;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    outline: 0;
  }
`

const AccountColumn = styled.div`
  display: flex;
  flex-direction: column;
`

const AccountRow = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
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

const AccountAddress = styled.div`
  font-size: 13px;
`

const UpgradeIcon = styled(ArrowCircleDownIcon)`
  font-size: 16px;
`

const ConnectedStatusWrapper = styled(NetworkStatusWrapper)`
  color: ${({ theme }) => theme.blue1};
`

const ConnectedIcon = styled(LinkIcon)`
  transform: rotate(-45deg);
  font-size: 16px;
`

export const AccountListItem: FC<IAccountListItem> = ({
  accountName,
  accountAddress,
  networkId,
  outline,
  highlight,
  deploying,
  upgrade,
  connected,
  children,
  ...rest
}) => {
  return (
    <AccountListItemWrapper outline={outline} highlight={highlight} {...rest}>
      <ProfilePicture
        src={getNetworkAccountImageUrl({
          accountName,
          accountAddress,
          networkId,
        })}
      />
      <AccountRow>
        <AccountColumn>
          <AccountName>{accountName}</AccountName>
          <AccountAddress>
            {formatTruncatedAddress(accountAddress)}
          </AccountAddress>
        </AccountColumn>
        <AccountColumn>
          {deploying ? (
            <NetworkStatusWrapper>
              <TransactionStatusIndicator color="orange" />
              <AccountStatusText>Deploying</AccountStatusText>
            </NetworkStatusWrapper>
          ) : upgrade ? (
            <NetworkStatusWrapper>
              <UpgradeIcon />
              <AccountStatusText>Upgrade</AccountStatusText>
            </NetworkStatusWrapper>
          ) : (
            connected && (
              <ConnectedStatusWrapper>
                <ConnectedIcon />
                <AccountStatusText>Connected</AccountStatusText>
              </ConnectedStatusWrapper>
            )
          )}
          {children}
        </AccountColumn>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
