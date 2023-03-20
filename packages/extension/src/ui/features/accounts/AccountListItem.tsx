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
import { MultisigStatus } from "../multisig/hooks/useMultisigStatus"
import { getEscapeDisplayAttributes } from "../shield/escape/EscapeBanner"
import { useLiveAccountEscape } from "../shield/escape/useAccountEscape"
import { AccountAvatar } from "./AccountAvatar"
import { AccountLabel } from "./AccountLabel"
import { getNetworkAccountImageUrl } from "./accounts.service"
import { useAccount } from "./accounts.state"

const { LinkIcon, ViewIcon, UpgradeIcon, ArgentShieldIcon } = icons

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
  isShield?: boolean
  multisigStatus?: MultisigStatus
}

export const NetworkStatusWrapper = chakra(Flex, {
  baseStyle: {
    alignItems: "center",
    justifyContent: "right",
    gap: 1,
    ml: 1,
    pointerEvents: "none",
    ...typographyStyles.L1,
  },
})

export const AccountListItemUpgradeBadge: FC = () => (
  <Tooltip label="This account needs to be upgraded">
    <Circle
      position={"absolute"}
      right={-0.5}
      bottom={-0.5}
      size={5}
      bg={"primary.500"}
      border={"2px solid"}
      borderColor={"neutrals.800"}
      color={"neutrals.800"}
      fontSize={"2xs"}
    >
      <UpgradeIcon />
    </Circle>
  </Tooltip>
)

type AccountListItemShieldBadgeProps = Pick<
  AccountListItemProps,
  "accountAddress" | "networkId"
>

export const AccountListItemShieldBadge: FC<
  AccountListItemShieldBadgeProps
> = ({ accountAddress, networkId }) => {
  const account = useAccount({ address: accountAddress, networkId })
  const liveAccountEscape = useLiveAccountEscape(account)
  if (liveAccountEscape) {
    const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
    return (
      <Tooltip label={title}>
        <Circle
          position={"absolute"}
          right={-0.5}
          bottom={-0.5}
          size={5}
          bg={`${colorScheme}.500`}
          border={"2px solid"}
          borderColor={"neutrals.800"}
          color={"neutrals.900"}
          fontSize={"2xs"}
        >
          <ArgentShieldIcon />
        </Circle>
      </Tooltip>
    )
  }
  return (
    <Tooltip label="This account is protected by Argent Shield 2FA">
      <Circle
        position={"absolute"}
        right={-0.5}
        bottom={-0.5}
        size={5}
        bg={"neutrals.800"}
        color={"white"}
        fontSize={"2xs"}
      >
        <ArgentShieldIcon />
      </Circle>
    </Tooltip>
  )
}

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
  multisigStatus,
  children,
  ...rest
}) => {
  const avatarBadge = upgrade ? (
    <AccountListItemUpgradeBadge />
  ) : isShield ? (
    <AccountListItemShieldBadge
      accountAddress={accountAddress}
      networkId={networkId}
    />
  ) : null
  return (
    <CustomButtonCell {...rest}>
      <AccountAvatar
        outlined={avatarOutlined}
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
              {accountType === "multisig" && multisigStatus === "pending"
                ? "Awaiting owner to finish setup"
                : formatTruncatedAddress(accountAddress)}
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
