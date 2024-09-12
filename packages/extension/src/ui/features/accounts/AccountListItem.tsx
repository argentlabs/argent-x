import {
  addressSchema,
  formatTruncatedAddress,
  isStarknetDomainName,
} from "@argent/x-shared"
import {
  BarIconButton,
  H6,
  L2,
  P4,
  iconsDeprecated,
  typographyStyles,
} from "@argent/x-ui"
import {
  Box,
  Circle,
  Flex,
  Link,
  Switch,
  Tooltip,
  chakra,
} from "@chakra-ui/react"
import { FC, useMemo, useState } from "react"

import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { AccountAvatar } from "./AccountAvatar"
import { AccountLabel } from "./AccountLabel"
import { AccountListItemWarningBadge } from "./AccountListItemDeprecatedBadge"
import { AccountListItemSmartAccountBadgeContainer } from "./AccountListItemSmartAccountBadgeContainer"
import { AccountListItemUpgradeBadge } from "./AccountListItemUpgradeBadge"
import { AccountListItemProps } from "./accountListItem.model"
import { getNetworkAccountImageUrl } from "./accounts.service"
import { useWalletAccount } from "./accounts.state"
import { useOnSettingsAccountNavigate } from "./useOnSettingsAccountNavigate"
import { AccountListItemLedgerBadge } from "./AccountListItemLedgerBadge"

const { LinkIcon, MoreIcon } = iconsDeprecated

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

const AccountListRightElements: FC<
  AccountListItemProps & { isHovering: boolean }
> = ({
  accountAddress,
  networkId,
  deploying,
  prettyAccountBalance,
  isHovering,
  hidden,
}) => {
  const account = useWalletAccount({
    address: accountAddress,
    networkId: networkId,
  })
  const onSettingsClick = useOnSettingsAccountNavigate(account)

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation()
    void onSettingsClick()
  }
  if (deploying) {
    return (
      <NetworkStatusWrapper>
        <TransactionStatusIndicator status="amber" label="Deploying" />
        Deploying
      </NetworkStatusWrapper>
    )
  }

  if (typeof hidden === "boolean") {
    return <Switch size={"lg"} isChecked={hidden} />
  } else {
    return (
      <Flex alignItems="center" gap={3} data-testid="connected-dapp">
        {isHovering ? (
          <BarIconButton
            data-testid="goto-settings"
            as={Link}
            onClick={handleButtonClick}
            backgroundColor="neutrals.900"
          >
            <MoreIcon />
          </BarIconButton>
        ) : (
          <>{prettyAccountBalance && <H6>{prettyAccountBalance}</H6>}</>
        )}
      </Flex>
    )
  }
}

export const AccountListItem: FC<AccountListItemProps> = ({
  accountName,
  accountDescription,
  accountAddress,
  networkId,
  networkName,
  accountType,
  isClickable = true,
  isSmartAccount,
  isOwner,
  isLedger,
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
  showRightElements = false,
  ...rest
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const handleMouseEnter = () => {
    setIsHovering(true)
  }
  const handleMouseLeave = () => {
    setIsHovering(false)
  }
  const getAvatarBadge = () => {
    if (isDeprecated || isOwner === false) {
      return <AccountListItemWarningBadge />
    }
    if (upgrade) {
      return <AccountListItemUpgradeBadge />
    }
    if (isLedger) {
      return <AccountListItemLedgerBadge />
    }
    if (isSmartAccount) {
      return (
        <AccountListItemSmartAccountBadgeContainer
          accountAddress={accountAddress}
          networkId={networkId}
        />
      )
    }
    return null
  }

  const description = useMemo(() => {
    const descriptionElements = []
    if (accountDescription) {
      descriptionElements.push(accountDescription)
    } else if (isStarknetDomainName(accountAddress)) {
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
    <CustomButtonCell
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...additionalProps}
      {...rest}
      _active={{
        transform: "none",
      }}
    >
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
        data-testid={accountName}
      >
        <Flex direction={"column"} overflow={"hidden"}>
          <Flex gap={2} alignItems={"center"}>
            {accountName && (
              <H6
                data-testid="account-name"
                overflow={"hidden"}
                textOverflow={"ellipsis"}
                pointerEvents="auto"
              >
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
                data-testid="confirmations"
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
              <P4
                data-testid="description"
                fontWeight={"semibold"}
                w="full"
                sx={{ textWrap: "wrap" }}
              >
                {description}
              </P4>
            </Flex>
          )}
          {connectedHost && (
            <Tooltip
              label={connectedTooltipLabel || `Connected to ${connectedHost}`}
            >
              <Flex
                gap={1}
                px={1}
                py={"1px"}
                color={"accent.green"}
                bg={"surface-success-default"}
                alignSelf={"flex-start"}
                rounded={"base"}
                alignItems={"center"}
                mt={0.5}
                {...typographyStyles.L3}
              >
                <LinkIcon display={"inline-block"} /> Connected
              </Flex>
            </Tooltip>
          )}
        </Flex>
        <Flex direction="column" {...rightElementFlexProps}>
          {(showRightElements || deploying) && (
            <AccountListRightElements
              accountAddress={accountAddress}
              accountName={accountName}
              networkId={networkId}
              isHovering={isHovering}
              prettyAccountBalance={prettyAccountBalance}
              hidden={hidden}
              deploying={deploying}
            />
          )}
          {children}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
