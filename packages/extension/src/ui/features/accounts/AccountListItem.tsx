import { ButtonRect, H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { ComponentProps, FC, HTMLProps, ReactNode } from "react"
import styled from "styled-components"

import { ArgentAccountType } from "../../../shared/wallet.model"
import {
  ArrowCircleDownIcon,
  LinkIcon,
  VisibilityIcon,
} from "../../components/Icons/MuiIcons"
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
  outlined?: boolean
  highlighted?: boolean
  deploying?: boolean
  upgrade?: boolean
  connected?: boolean
  transparent?: boolean
  hidden?: boolean
  children?: ReactNode
  onClick?: () => void
  style?: HTMLProps<HTMLDivElement>["style"]
}

interface AccountListItemWrapperProps
  extends ComponentProps<typeof ButtonRect>,
    Pick<IAccountListItem, "highlighted" | "outlined" | "transparent"> {
  dark?: boolean
}

const AccountListItemWrapper: FC<AccountListItemWrapperProps> = ({
  highlighted,
  transparent,
  dark,
  outlined,
  ...rest
}) => {
  const colorScheme = transparent
    ? "transparent"
    : highlighted
    ? "neutrals600"
    : "neutrals800"
  const borderColor = outlined ? "neutrals.600" : "transparent"
  return (
    <ButtonRect
      gap={3}
      p={4}
      h={"initial"}
      textAlign={"left"}
      fontWeight={"initial"}
      colorScheme={colorScheme}
      border={"1px solid"}
      borderColor={borderColor}
      {...rest}
    />
  )
}

const AccountAvatar = styled.img`
  border-radius: 500px;
  width: 40px;
  height: 40px;
`

const AccountColumn = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const AccountColumnAccessory = styled.div`
  display: flex;
  flex-direction: column;
`

const AccountRow = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
`

const AccountStatusText = styled.p`
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
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
  ...rest
}) => {
  return (
    <AccountListItemWrapper dark={hidden} {...rest}>
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
          <H6>{accountName}</H6>
          <Flex gap={2} color={"neutrals.400"}>
            <P4 fontWeight={"bold"}>
              {formatTruncatedAddress(accountAddress)}
            </P4>
            {networkName && <P4 noOfLines={1}>{networkName}</P4>}
          </Flex>
        </AccountColumn>
        <AccountColumnAccessory>
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
        </AccountColumnAccessory>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
