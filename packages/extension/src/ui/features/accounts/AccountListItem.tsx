import { addressSchema, isStarknetId } from "@argent/shared"
import { H6, L2, P4, icons, typographyStyles } from "@argent/ui"
import { Box, Circle, Flex, Switch, Tooltip, chakra } from "@chakra-ui/react"
import { FC, useMemo } from "react"

import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { formatTruncatedAddress } from "../../services/addresses"
import { AccountAvatar } from "./AccountAvatar"
import { AccountLabel } from "./AccountLabel"
import { AccountListItemDeprecatedBadge } from "./AccountListItemDeprecatedBadge"
import { AccountListItemShieldBadgeContainer } from "./AccountListItemShieldBadgeContainer"
import { AccountListItemUpgradeBadge } from "./AccountListItemUpgradeBadge"
import { AccountListItemProps } from "./accountListItem.model"
import { getNetworkAccountImageUrl } from "./accounts.service"

const { LinkIcon } = icons

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

const notClickableProps: CustomButtonCellProps = {
  as: Box,
  pointerEvents: "none",
  _hover: {
    bg: undefined,
  },
  _active: {
    transform: undefined,
  },
}

export const AccountListItem: FC<AccountListItemProps> = ({
  accountName,
  accountDescription,
  accountAddress,
  networkId,
  networkName,
  accountType,
  isClickable = true,
  isShield,
  deploying,
  upgrade,
  connectedHost,
  hidden,
  avatarIcon,
  avatarOutlined,
  avatarSize = 12,
  children,
  isDeprecated,
  rightElementFlexProps,
  connectedTooltipLabel,
  prettyAccountBalance,
  accountExtraInfo,
  ...rest
}) => {
  const getAvatarBadge = () => {
    if (isDeprecated) {
      return <AccountListItemDeprecatedBadge />
    }
    if (upgrade) {
      return <AccountListItemUpgradeBadge />
    }
    if (isShield) {
      return (
        <AccountListItemShieldBadgeContainer
          accountAddress={accountAddress}
          networkId={networkId}
        />
      )
    }
    return null
  }

  const rightElements = useMemo(() => {
    if (deploying) {
      return (
        <NetworkStatusWrapper>
          <TransactionStatusIndicator color="orange" />
          Deploying
        </NetworkStatusWrapper>
      )
    }
    if (connectedHost || prettyAccountBalance) {
      return (
        <Flex alignItems="center" gap={3}>
          {prettyAccountBalance && <H6>{prettyAccountBalance}</H6>}
          {connectedHost && (
            <Tooltip
              label={connectedTooltipLabel || `Connected to ${connectedHost}`}
            >
              <Circle size={6} bg={"secondary.500"} color={"white"} p={1}>
                <LinkIcon />
              </Circle>
            </Tooltip>
          )}
        </Flex>
      )
    }

    if (hidden !== undefined) {
      return <Switch size={"lg"} isChecked={hidden} />
    }
    return null
  }, [
    connectedHost,
    connectedTooltipLabel,
    deploying,
    hidden,
    prettyAccountBalance,
  ])

  const description = useMemo(() => {
    const descriptionElements = []
    if (accountDescription) {
      descriptionElements.push(accountDescription)
    } else if (isStarknetId(accountAddress)) {
      descriptionElements.push(accountAddress)
    } else {
      if (addressSchema.safeParse(accountAddress).success) {
        descriptionElements.push(formatTruncatedAddress(accountAddress))
      } else {
        descriptionElements.push(accountAddress)
      }
    }
    descriptionElements.push(networkName)
    return descriptionElements.filter(Boolean).join("  ∙  ")
  }, [accountAddress, accountDescription, networkName])

  const additionalProps = isClickable ? {} : notClickableProps
  return (
    <CustomButtonCell {...additionalProps} {...rest}>
      {avatarIcon ? (
        <Flex position={"relative"} flexShrink={0}>
          <Circle size={avatarSize} bg={"neutrals.600"} fontSize={"xl"}>
            {avatarIcon}
          </Circle>
        </Flex>
      ) : (
        <AccountAvatar
          outlined={avatarOutlined}
          size={avatarSize}
          src={getNetworkAccountImageUrl({
            accountName,
            accountAddress,
            networkId,
          })}
        >
          {getAvatarBadge()}
        </AccountAvatar>
      )}
      <Flex
        flex={1}
        overflow={"hidden"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex direction={"column"} overflow={"hidden"}>
          <Flex gap={2} alignItems={"center"}>
            {accountName && (
              <H6 overflow={"hidden"} textOverflow={"ellipsis"}>
                {accountName}
              </H6>
            )}
            {accountExtraInfo && (
              <Flex
                justifyContent="center"
                alignItems="center"
                backgroundColor="neutrals.900"
                borderColor="neutrals.700"
                borderWidth={1}
                p="3px 5px"
                borderRadius={4}
              >
                <L2 fontWeight={700} color="neutrals.300">
                  {accountExtraInfo}
                </L2>
              </Flex>
            )}
            {accountType && <AccountLabel accountType={accountType} />}
          </Flex>
          {description && (
            <Flex gap={2} color={"neutrals.300"}>
              <P4 fontWeight={"semibold"} w="full" sx={{ textWrap: "wrap" }}>
                {description}
              </P4>
            </Flex>
          )}
        </Flex>
        <Flex direction="column" {...rightElementFlexProps}>
          {rightElements}
          {children}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
