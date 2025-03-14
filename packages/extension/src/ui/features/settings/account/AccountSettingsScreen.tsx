import { EditPrimaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  CellStack,
  H2,
  IconButton,
  NavigationContainer,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { StarknetIdOrAddressCopyButton } from "../../../components/StarknetIdOrAddressCopyButton"
import { useReturnTo } from "../../../hooks/useRoute"
import { AccountListItemLedgerBadge } from "../../accounts/AccountListItemLedgerBadge"
import {
  UpgradeBannerContainer,
  useShowUpgradeBanner,
} from "../../banners/UpgradeBannerContainer"
import { useIsLedgerSigner } from "../../ledger/hooks/useIsLedgerSigner"
import { useRouteWalletAccount } from "../../smartAccount/useRouteWalletAccount"
import { AccountEditButtonsContainer } from "./AccountEditButtons/AccountEditButtonsContainer"
import { routes } from "../../../../shared/ui/routes"
import { AccountAvatar } from "../../accounts/AccountAvatar"

import { typographyStyles } from "@argent/x-ui/theme"
import { useShowLegacyVersionBanner } from "../../banners/useShowLegacyVersionBanner"
import { LegacyVersionBannerContainer } from "../../banners/LegacyVersionBannerContainer"

export const AccountSettingsScreen: FC = () => {
  const account = useRouteWalletAccount()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const accountName = account ? account.name : "Not found"
  const showUpgradeBanner = useShowUpgradeBanner(account)
  const showLegacyVersionBanner = useShowLegacyVersionBanner(account)

  const isLedger = useIsLedgerSigner(account?.id)

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  if (!account) {
    return <></>
  }

  const testId = `account-settings-${accountName?.replaceAll(/ /g, "") ?? "unknown"}`

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title="Account settings"
        data-testid={testId}
      >
        <Center p={4}>
          <AccountAvatar
            size={16}
            accountId={account.id}
            accountName={accountName}
            accountType={account.type}
            emojiStyle={typographyStyles.H1}
            initialsStyle={typographyStyles.H3}
            avatarMeta={account.avatarMeta}
          >
            {isLedger && (
              <AccountListItemLedgerBadge
                fontSize="sm"
                size={6}
                p="4px"
                right={0.5}
                bottom={0.5}
                bg="surface-default"
              />
            )}
          </AccountAvatar>
        </Center>
        <Flex justify="center" gap="3">
          <IconButton
            icon={<EditPrimaryIcon />}
            p={2}
            minH={0}
            visibility="hidden" // Required for centering
          />
          <Flex direction="column" align="center" mb="2">
            <H2 color="text-primary" mb="2">
              {accountName}
            </H2>
            <StarknetIdOrAddressCopyButton account={account} p={2} />
          </Flex>
          <IconButton
            data-testid="edit-account-label"
            icon={<EditPrimaryIcon />}
            p={2}
            minH={0}
            onClick={() => navigate(routes.editAccountLabel(account.id))}
          />
        </Flex>
        <CellStack>
          {showUpgradeBanner && !showLegacyVersionBanner && (
            <UpgradeBannerContainer account={account} />
          )}
          {showLegacyVersionBanner && (
            <LegacyVersionBannerContainer account={account} />
          )}
          <AccountEditButtonsContainer account={account} />
        </CellStack>
      </NavigationContainer>
    </>
  )
}
