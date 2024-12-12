import {
  BarIconButton,
  icons,
  L2Bold,
  Label3Bold,
  logosDeprecated,
  NavigationBar,
  typographyStyles,
} from "@argent/x-ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"

import type { AccountNavigationBarContainerProps } from "./AccountNavigationBarContainer"
import { AccountAvatar } from "../accounts/AccountAvatar"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { SettingsBarIconButton } from "./SettingsBarIconButton"

const { MultisigSecondaryIcon, ShieldSecondaryIcon, DonutSecondaryIcon } = icons

const { LedgerLogo } = logosDeprecated

export interface AccountNavigationBarProps
  extends AccountNavigationBarContainerProps {
  accountName?: string
  accountId?: string
  isSmartAccount?: boolean
  isMultisig?: boolean
  isLedgerAccount?: boolean
  onAccountList?: ReactEventHandler
  envLabel?: string
  onPortfolio?: ReactEventHandler
  networkName?: string
}

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  accountName = "No account",
  accountId,
  isSmartAccount,
  isMultisig,
  isLedgerAccount,
  onAccountList,
  scroll,
  showSettingsButton = true,
  showPortfolioButton = true,
  onPortfolio,
  envLabel,
  networkName,
}) => {
  const leftButton = showSettingsButton ? <SettingsBarIconButton /> : undefined
  const rightButton = showPortfolioButton ? (
    <BarIconButton
      aria-label="Show portfolio"
      onClick={onPortfolio}
      colorScheme="default"
    >
      <DonutSecondaryIcon />
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
                src={getNetworkAccountImageUrl({
                  accountName,
                  accountId,
                })}
              />
            )}
            <Flex
              {...typographyStyles.B2}
              gap={1}
              overflow="hidden"
              alignItems="center"
            >
              {isSmartAccount && (
                <ShieldSecondaryIcon
                  data-testid="smart-account-on-account-view"
                  flexShrink={0}
                />
              )}
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
            <Label3Bold
              as={Text}
              color="text-secondary"
              overflow="hidden"
              textOverflow="ellipsis"
            >
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
