import { CellStack, Banner, Empty, icons } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { Multisig } from "../multisig/Multisig"
import { MultisigBanner } from "../multisig/MultisigBanner"
import { EscapeBanner } from "../shield/escape/EscapeBanner"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBannerContainer"
import { AccountTokensButtonsContainer } from "./AccountTokensButtonsContainer"
import { AccountTokensHeader } from "./AccountTokensHeader"
import { SaveRecoverySeedphraseBanner } from "./SaveRecoverySeedphraseBanner"
import { TokenList } from "./TokenList"
import { TokenListItemVariant } from "./TokenListItem"
import { UpgradeBanner } from "./UpgradeBanner"
import { AccountDeprecatedBanner } from "./warning/AccountDeprecatedBanner"
import { AccountOwnerBanner } from "./warning/AccountOwnerBanner"
import { ProvisionStatus } from "../../../shared/provision/types"
import { isEmpty } from "lodash-es"

const { MultisigIcon } = icons

export interface AccountTokensProps {
  account: Account
  showTokensAndBanners: boolean
  hasEscape: boolean
  accountGuardianIsSelf: boolean | null
  accountOwnerIsSelf?: boolean
  showUpgradeBanner: boolean
  showNoBalanceForUpgrade: boolean
  onUpgradeBannerClick?: () => void
  upgradeLoading?: boolean
  multisig?: Multisig
  tokenListVariant?: TokenListItemVariant
  hasFeeTokenBalance?: boolean
  showSaveRecoverySeedphraseBanner: boolean
  isDeprecated?: boolean
  onAvnuClick?: () => void
  returnTo?: string
  onProvisionBannerClose: () => void
  shouldShowProvisionBanner: boolean
  provisionStatus:
    | (ProvisionStatus & {
        bannerUrl: string
      })
    | undefined
}

export const AccountTokens: FC<AccountTokensProps> = ({
  account,
  showTokensAndBanners,
  hasEscape,
  accountGuardianIsSelf,
  accountOwnerIsSelf,
  showUpgradeBanner,
  showNoBalanceForUpgrade,
  onUpgradeBannerClick,
  upgradeLoading,
  multisig,
  tokenListVariant,
  hasFeeTokenBalance,
  showSaveRecoverySeedphraseBanner,
  isDeprecated = false,
  returnTo,
  onProvisionBannerClose,
  provisionStatus,
  shouldShowProvisionBanner,
}) => {
  return (
    <Flex direction={"column"} data-testid="account-tokens" flex={1}>
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader account={account} accountName={account.name} />
        <AccountTokensButtonsContainer account={account} />
      </VStack>
      {showTokensAndBanners ? (
        <CellStack pt={0} flex={1}>
          {shouldShowProvisionBanner && provisionStatus && (
            <Banner
              background={`url('${provisionStatus?.bannerUrl}'), linear-gradient(180deg, #1D1D77 0%, #154C7C 100%);`}
              dark
              backgroundSize="contain"
              backgroundRepeat="no-repeat"
              backgroundPosition="left"
              _hover={{
                background: `url('${provisionStatus?.bannerUrl}'), linear-gradient(180deg, #1D1D77 0%, #154C7C 100%);`,
                backgroundSize: "contain",
                backgroundPosition: "left",
                backgroundRepeat: "no-repeat",
              }}
              pl={20}
              title={provisionStatus?.bannerTitle}
              subTitle={provisionStatus?.bannerDescription}
              href={
                !isEmpty(provisionStatus.link)
                  ? provisionStatus?.link
                  : undefined
              }
              onClose={onProvisionBannerClose}
            />
          )}
          {showSaveRecoverySeedphraseBanner && <SaveRecoverySeedphraseBanner />}
          <StatusMessageBannerContainer />
          {(hasEscape || accountGuardianIsSelf) && (
            <EscapeBanner account={account} />
          )}
          {showUpgradeBanner && !isDeprecated && (
            <UpgradeBanner
              loading={upgradeLoading}
              onClick={onUpgradeBannerClick}
            />
          )}
          {isDeprecated && (
            <AccountDeprecatedBanner
              to={routes.accountDeprecated(returnTo)}
              state={{ from: location.pathname }}
            />
          )}
          {!accountOwnerIsSelf && (
            <AccountOwnerBanner to={routes.accountOwnerWarning(returnTo)} />
          )}
          {showNoBalanceForUpgrade && !isDeprecated && (
            <UpgradeBanner
              canNotPay
              loading={upgradeLoading}
              onClick={onUpgradeBannerClick}
            />
          )}
          {multisig && (
            <MultisigBanner
              multisig={multisig}
              hasFeeTokenBalance={hasFeeTokenBalance}
            />
          )}

          <TokenList
            variant={tokenListVariant}
            showNewTokenButton
            onItemClick={multisig?.needsDeploy ? () => null : undefined}
          />
        </CellStack>
      ) : (
        <Empty
          icon={<MultisigIcon color="neutrals.500" />}
          title="You can no longer use this account"
        />
      )}
    </Flex>
  )
}
