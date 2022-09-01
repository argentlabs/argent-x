import { FC, HTMLProps, ReactNode } from "react"
import styled from "styled-components"

import { ArgentAccountType } from "../../../shared/wallet.model"
import {
  ArrowCircleDownIcon,
  LinkIcon,
  VisibilityIcon,
} from "../../components/Icons/MuiIcons"
import Row from "../../components/Row"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { formatTruncatedAddress } from "../../services/addresses"
import { NetworkStatusWrapper } from "../networks/NetworkSwitcher"
import { getNetworkAccountImageUrl } from "./accounts.service"

export interface IAccountListItem {
  accountName: string
  accountAddress: string
  networkId: string
  networkName?: string
  accountType: ArgentAccountType
  outline?: boolean
  highlight?: boolean
  deploying?: boolean
  upgrade?: boolean
  connected?: boolean
  transparent?: boolean
  hidden?: boolean
  children?: ReactNode
  onClick?: () => void
  style?: HTMLProps<HTMLDivElement>["style"]
}

type AccountListItemWrapperProps = Pick<
  IAccountListItem,
  "highlight" | "outline" | "transparent"
> & {
  dark?: boolean
}

export const AccountListItemWrapper = styled.div<AccountListItemWrapperProps>`
  position: relative;
  cursor: pointer;
  background-color: ${({ highlight, transparent, dark }) =>
    transparent || dark
      ? "transparent"
      : highlight
      ? "rgba(255, 255, 255, 0.15)"
      : "rgba(255, 255, 255, 0.1)"};
  border-radius: 4px;
  padding: 20px 16px;
  border: 1px solid
    ${({ outline, dark }) =>
      outline || dark ? "rgba(255, 255, 255, 0.3)" : "transparent"};

  display: flex;
  gap: 12px;
  align-items: center;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    background: ${({ transparent, dark }) =>
      transparent
        ? "transparent"
        : dark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.15)"};
    outline: 0;
  }
`

const AccountAvatar = styled.img`
  border-radius: 500px;
  width: 40px;
  height: 40px;
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
  line-height: 13px;
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

const HiddenStatusWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  width: 40px;
  height: 40px;
  border-radius: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NetworkContainer = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  padding: 0px 3px 1px;
  font-weight: 600;
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text2};
`

const PluginTextContainer = styled(NetworkContainer)`
  font-size: 10px;
  position: absolute;
  top: 7.5px;
  right: 8px;
`

const StyledContactAddress = styled.p`
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.text1};
`

export const AccountListItem: FC<IAccountListItem> = ({
  accountName,
  accountAddress,
  networkId,
  networkName,
  accountType,
  deploying,
  upgrade,
  connected,
  hidden,
  children,
  onClick,
  style,
  ...rest
}) => {
  return (
    <AccountListItemWrapper
      dark={hidden}
      style={style}
      {...rest}
      onClick={onClick}
    >
      <AccountAvatar
        src={getNetworkAccountImageUrl({
          accountName,
          accountAddress,
          networkId,
          backgroundColor: hidden ? "333332" : undefined,
        })}
      />
      <AccountRow>
        <AccountColumn>
          <AccountName>{accountName}</AccountName>

          {networkName ? (
            <Row gap="8px">
              <StyledContactAddress>
                {formatTruncatedAddress(accountAddress)}
              </StyledContactAddress>
              <NetworkContainer>{networkName}</NetworkContainer>
            </Row>
          ) : (
            <AccountAddress>
              {formatTruncatedAddress(accountAddress)}
            </AccountAddress>
          )}
        </AccountColumn>
        <AccountColumn>
          {accountType === "argent-plugin" && (
            <PluginTextContainer>Plugin</PluginTextContainer>
          )}
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
          ) : connected ? (
            <ConnectedStatusWrapper>
              <ConnectedIcon />
              <AccountStatusText>Connected</AccountStatusText>
            </ConnectedStatusWrapper>
          ) : (
            hidden && (
              <HiddenStatusWrapper>
                <VisibilityIcon />
              </HiddenStatusWrapper>
            )
          )}
          {children}
        </AccountColumn>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
