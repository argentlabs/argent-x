import { H6, P4, icons, typographyStyles } from "@argent/ui"
import { Circle, Flex, Text, Tooltip, chakra } from "@chakra-ui/react"
import { FC } from "react"

import { ArgentAccountType } from "../../../shared/wallet.model"
import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { formatTruncatedAddress } from "../../services/addresses"
import { AccountAvatar } from "./AccountAvatar"
import { AccountLabel } from "./AccountLabel"
import { AccountListItemShieldBadgeContainer } from "./AccountListItemShieldBadgeContainer"
import { AccountListItemUpgradeBadge } from "./AccountListItemUpgradeBadge"
import { getNetworkAccountImageUrl } from "./accounts.service"

const { LinkIcon, ViewIcon } = icons

export interface AccountListItemProps extends CustomButtonCellProps {
  accountName: string
  accountAddress: string
  networkId: string
  networkName?: string
  accountType?: ArgentAccountType
  deploying?: boolean
  upgrade?: boolean
  connectedHost?: string
  hidden?: boolean
  avatarOutlined?: boolean
  avatarSize?: number
  isShield?: boolean
  isRemovedFromMultisig?: boolean
}

const NetworkStatusWrapper = chakra(Flex, {
  baseStyle: {
    alignItems: "center",
    justifyContent: "right",
    gap: 1,
    ml: 1,
    pointerEvents: "none",
    ...typographyStyles.L1,
  },
})

export const AccountListItem: FC<AccountListItemProps> = ({
  accountName,
  accountAddress,
  networkId,
  networkName,
  accountType,
  isShield,
  deploying,
  upgrade,
  connectedHost,
  hidden,
  avatarOutlined,
  avatarSize,
  isRemovedFromMultisig,
  children,
  ...rest
}) => {
  const avatarBadge = upgrade ? (
    <AccountListItemUpgradeBadge />
  ) : isShield ? (
    <AccountListItemShieldBadgeContainer
      accountAddress={accountAddress}
      networkId={networkId}
    />
  ) : null
  return (
    <CustomButtonCell {...rest}>
      <AccountAvatar
        outlined={avatarOutlined}
        size={avatarSize}
        src={getNetworkAccountImageUrl({
          accountName,
          accountAddress,
          networkId,
          backgroundColor: hidden ? "#333332" : undefined,
        })}
      >
        {avatarBadge}
      </AccountAvatar>
      <Flex
        flex={1}
        overflow={"hidden"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex direction={"column"} overflow={"hidden"}>
          <Flex gap={1} alignItems={"center"}>
            <H6 overflow={"hidden"} textOverflow={"ellipsis"}>
              {accountName}
            </H6>
            {accountType && <AccountLabel accountType={accountType} />}
          </Flex>
          <Flex gap={2} color={"neutrals.300"}>
            <P4 fontWeight={"semibold"}>
              {isRemovedFromMultisig ? (
                <>Removed from multisig</>
              ) : (
                formatTruncatedAddress(accountAddress)
              )}
            </P4>
            {networkName && <P4 noOfLines={1}>{networkName}</P4>}
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          {deploying ? (
            <NetworkStatusWrapper>
              <TransactionStatusIndicator color="orange" />
              Deploying
            </NetworkStatusWrapper>
          ) : connectedHost ? (
            <Tooltip label={`Connected to ${connectedHost}`}>
              <Circle size={8} bg={"neutrals.900"}>
                <Circle size={6} bg={"secondary.500"} color={"white"}>
                  <LinkIcon />
                </Circle>
              </Circle>
            </Tooltip>
          ) : (
            hidden && (
              <Circle size={10} bg={"neutrals.600"}>
                <Text fontSize={"2xl"}>
                  <ViewIcon />
                </Text>
              </Circle>
            )
          )}
          {children}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
