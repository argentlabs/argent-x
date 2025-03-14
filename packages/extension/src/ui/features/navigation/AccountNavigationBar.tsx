import {
  MultisigSecondaryIcon,
  SidebarSecondaryIcon,
  ExtensionSecondaryIcon,
} from "@argent/x-ui/icons"
import { BarIconButton, L2Bold, Label3Bold, NavigationBar } from "@argent/x-ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"

import type {
  AvatarMeta,
  WalletAccountType,
} from "../../../shared/wallet.model"
import { AccountAvatar } from "../accounts/AccountAvatar"
import { AccountListItemSmartAccountBadgeContainer } from "../accounts/AccountListItemSmartAccountBadgeContainer"
import type { AccountNavigationBarContainerProps } from "./AccountNavigationBarContainer"
import { SettingsBarIconButton } from "./SettingsBarIconButton"

import { typographyStyles } from "@argent/x-ui/theme"

import { LedgerLogo } from "@argent/x-ui/logos-deprecated"

export interface AccountNavigationBarProps
  extends AccountNavigationBarContainerProps {
  accountName?: string
  accountId?: string
  accountType?: WalletAccountType
  isSmartAccount?: boolean
  isMultisig?: boolean
  isLedgerAccount?: boolean
  onAccountList?: ReactEventHandler
  envLabel?: string
  networkName?: string
  avtarMeta?: AvatarMeta
  extensionIsInSidePanel?: boolean
}

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  accountName = "No account",
  accountId,
  accountType,
  isSmartAccount,
  isMultisig,
  isLedgerAccount,
  onAccountList,
  scroll,
  showSettingsButton = true,
  showSidePanelButton = true,
  extensionIsInSidePanel,
  onSidePanelClick,
  envLabel,
  networkName,
  avtarMeta,
}) => {
  const leftButton = showSettingsButton ? <SettingsBarIconButton /> : undefined
  const rightButton = showSidePanelButton ? (
    <BarIconButton
      aria-label={
        extensionIsInSidePanel ? "Switch to popup" : "Switch to sidebar"
      }
      onClick={onSidePanelClick}
    >
      {extensionIsInSidePanel ? (
        <ExtensionSecondaryIcon />
      ) : (
        <SidebarSecondaryIcon />
      )}
    </BarIconButton>
  ) : undefined
  return (
    <NavigationBar
      scroll={scroll}
      leftButton={leftButton}
      rightButton={rightButton}
      title={
        <>
          <Button
            aria-label={"Show account list"}
            size={"2xs"}
            pl={accountName && accountId ? 2 : 3}
            onClick={onAccountList}
            gap={2}
            maxWidth="full"
            overflow="hidden"
          >
            {accountName && accountId && (
              <AccountAvatar
                size={5}
                accountId={accountId}
                accountName={accountName}
                accountType={accountType}
                emojiStyle={typographyStyles.P3}
                initialsStyle={typographyStyles.L3Bold}
                avatarMeta={avtarMeta}
              >
                {isSmartAccount && (
                  <AccountListItemSmartAccountBadgeContainer
                    accountId={accountId}
                    size={"10px"}
                  />
                )}
              </AccountAvatar>
            )}
            <Flex
              {...typographyStyles.B2}
              gap={1}
              overflow="hidden"
              alignItems="center"
            >
              {isMultisig && <MultisigSecondaryIcon flexShrink={0} />}
              {isLedgerAccount && <LedgerLogo flexShrink={0} />}
              <Text overflow="hidden" textOverflow="ellipsis">
                {accountName}
              </Text>
            </Flex>
            <Flex
              alignSelf="stretch"
              borderLeft="1px solid"
              borderLeftColor="text-secondary"
              my={1}
            />
            <Label3Bold as={Text} color="text-secondary" whiteSpace="normal">
              {networkName}
            </Label3Bold>
          </Button>
          {envLabel && (
            <L2Bold
              as={Text}
              color="text-secondary"
              overflow="hidden"
              textOverflow="ellipsis"
              pointerEvents={"none"}
              whiteSpace="nowrap"
              ml={2}
            >
              {envLabel}
            </L2Bold>
          )}
        </>
      }
    />
  )
}
