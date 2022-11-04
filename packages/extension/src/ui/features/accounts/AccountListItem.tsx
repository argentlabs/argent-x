import { ButtonRect, H6, L2, P4 } from "@argent/ui"
import { Box, Circle, Flex, Image } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"
import styled from "styled-components"

import { ArgentAccountType } from "../../../shared/wallet.model"
import {
  ArrowCircleDownIcon,
  LinkIcon,
  VisibilityIcon,
} from "../../components/Icons/MuiIcons"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { formatTruncatedAddress } from "../../services/addresses"
import { getNetworkAccountImageUrl } from "./accounts.service"

export interface AccountListItemWrapperProps
  extends ComponentProps<typeof ButtonRect> {
  highlighted?: boolean
  transparent?: boolean
  dark?: boolean
  outlined?: boolean
}

export interface AccountListItemProps extends AccountListItemWrapperProps {
  accountName: string
  accountAddress: string
  networkId: string
  networkName?: string
  accountType?: ArgentAccountType
  deploying?: boolean
  upgrade?: boolean
  connected?: boolean
  hidden?: boolean
  avatarOutlined?: boolean
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

interface AccountAvatarProps extends ComponentProps<"img"> {
  outlined?: boolean
}

const AccountAvatar: FC<AccountAvatarProps> = ({ outlined, ...rest }) => {
  return (
    <Flex position={"relative"} flexShrink={0}>
      <Image borderRadius={"full"} width={12} height={12} {...rest} />
      {outlined && (
        <>
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.25rem"}
            borderColor={"black"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.125rem"}
            borderColor={"white"}
          />
        </>
      )}
    </Flex>
  )
}

export const NetworkStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 4px;
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

export const AccountListItem: FC<AccountListItemProps> = ({
  accountName,
  accountAddress,
  networkId,
  networkName,
  accountType,
  deploying,
  upgrade,
  connected,
  hidden,
  avatarOutlined,
  children,
  ...rest
}) => {
  return (
    <AccountListItemWrapper dark={hidden} {...rest}>
      <AccountAvatar
        outlined={avatarOutlined}
        src={getNetworkAccountImageUrl({
          accountName,
          accountAddress,
          networkId,
          backgroundColor: hidden ? "333332" : undefined,
        })}
      />
      <AccountRow>
        <Flex direction={"column"} overflow={"hidden"}>
          <Flex gap={1} alignItems={"center"} overflow={"hidden"}>
            <H6 noOfLines={1}>{accountName}</H6>
            {accountType === "argent-plugin" && (
              <L2
                backgroundColor={"neutrals.900"}
                px={1}
                py={0.5}
                textTransform="uppercase"
                fontWeight={"extrabold"}
                color={"neutrals.200"}
                borderRadius={"base"}
                border={"1px solid"}
                borderColor={"neutrals.700"}
              >
                Plugin
              </L2>
            )}
          </Flex>
          <Flex gap={2} color={"neutrals.400"}>
            <P4 fontWeight={"bold"}>
              {formatTruncatedAddress(accountAddress)}
            </P4>
            {networkName && <P4 noOfLines={1}>{networkName}</P4>}
          </Flex>
        </Flex>
        <AccountColumnAccessory>
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
