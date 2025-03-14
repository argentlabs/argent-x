import { formatTruncatedAddress } from "@argent/x-shared"
import type { NavigationBarProps } from "@argent/x-ui"
import {
  B2,
  L3,
  L3Bold,
  NavigationBar,
  NavigationBarHeight,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { LedgerStatusText } from "./LedgerStatusText"
import { AccountAvatar } from "../accounts/AccountAvatar"
import type {
  AvatarMeta,
  WalletAccountType,
} from "../../../shared/wallet.model"

import { typographyStyles } from "@argent/x-ui/theme"

export interface AccountDetailsNavigationBarProps extends NavigationBarProps {
  accountAddress?: string
  accountName?: string
  accountId?: string
  avatarMeta?: AvatarMeta
  accountType?: WalletAccountType
  networkName?: string
  isLedgerConnected?: boolean
}

export const AccountDetailsNavigationBar: FC<
  AccountDetailsNavigationBarProps
> = ({
  accountAddress,
  accountName,
  accountId,
  accountType,
  networkName,
  isLedgerConnected,
  leftButton,
  rightButton,
  avatarMeta,
  ...rest
}) => {
  return (
    <NavigationBar
      leftButton={leftButton}
      rightButton={rightButton}
      borderBottom="1px solid"
      borderBottomColor="stroke-subtle"
      {...rest}
    >
      <Flex
        position="absolute"
        top={2}
        bottom={2}
        gap={2}
        left={leftButton ? NavigationBarHeight : 5}
        right={rightButton ? NavigationBarHeight : 5}
        alignItems="center"
        justifyContent="space-between"
        overflow="hidden"
      >
        <Flex gap={2} alignItems="center" overflow="hidden">
          {accountName && accountId && (
            <AccountAvatar
              size={6}
              accountId={accountId}
              accountName={accountName}
              accountType={accountType}
              emojiStyle={typographyStyles.P3}
              initialsStyle={typographyStyles.P4}
              avatarMeta={avatarMeta}
            />
          )}
          <Flex direction="column" gap={0.5} overflow="hidden">
            <B2 overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {accountName}
            </B2>
            <Flex gap={1} alignItems="center">
              {isLedgerConnected && (
                <LedgerStatusText as={L3} isConnected={isLedgerConnected} />
              )}
              {accountAddress && (
                <L3 color="text-secondary">
                  {formatTruncatedAddress(accountAddress)}
                </L3>
              )}
            </Flex>
          </Flex>
        </Flex>
        <L3Bold
          color="text-secondary"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {networkName}
        </L3Bold>
      </Flex>
    </NavigationBar>
  )
}
