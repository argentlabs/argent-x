import { CellStack, DapplandBanner, Empty, icons } from "@argent/ui"
import dapplandBanner from "@argent/ui/assets/dapplandBannerBackground.png"
import { Flex, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { Multisig } from "../multisig/Multisig"
import { MultisigBanner } from "../multisig/MultisigBanner"
import { EscapeBanner } from "../shield/escape/EscapeBanner"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBanner"
import { AccountTokensButtonsContainer } from "./AccountTokensButtonsContainer"
import { AccountTokensHeader } from "./AccountTokensHeader"
import { SaveRecoverySeedphraseBanner } from "./SaveRecoverySeedphraseBanner"
import { TokenList } from "./TokenList"
import { TokenListItemVariant } from "./TokenListItem"
import { UpgradeBanner } from "./UpgradeBanner"
import { AccountDeprecatedBanner } from "./AccountDeprecatedBanner"

const { MultisigIcon } = icons

export interface AccountTokensProps {
  account: Account
  showTokensAndBanners: boolean
  showDapplandBanner: boolean
  setDappLandBannerSeen: () => void
  hasEscape: boolean
  accountGuardianIsSelf: boolean | null
  showUpgradeBanner: boolean
  showNoBalanceForUpgrade: boolean
  onUpgradeBannerClick?: () => void
  upgradeLoading?: boolean
  multisig?: Multisig
  showAddFundsBackdrop?: boolean
  tokenListVariant?: TokenListItemVariant
  feeTokenBalance?: bigint
  showSaveRecoverySeedphraseBanner: boolean
  isDeprecated?: boolean
}

export const AccountTokens: FC<AccountTokensProps> = ({
  account,
  showDapplandBanner,
  showTokensAndBanners,
  setDappLandBannerSeen,
  hasEscape,
  accountGuardianIsSelf,
  showUpgradeBanner,
  showNoBalanceForUpgrade,
  onUpgradeBannerClick,
  upgradeLoading,
  multisig,
  showAddFundsBackdrop,
  tokenListVariant,
  feeTokenBalance,
  showSaveRecoverySeedphraseBanner,
  isDeprecated = false,
}) => {
  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader account={account} accountName={account.name} />
        <AccountTokensButtonsContainer account={account} />
      </VStack>
      {showTokensAndBanners ? (
        <CellStack pt={0}>
          {showDapplandBanner && (
            <DapplandBanner
              backgroundImageUrl={dapplandBanner}
              href="https://www.dappland.com?utm_source=argent&utm_medium=extension&utm_content=banner"
              onClose={setDappLandBannerSeen}
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
              to={routes.accountDeprecated()}
              state={{ from: location.pathname }}
            />
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
              feeTokenBalance={feeTokenBalance}
            />
          )}
          {showAddFundsBackdrop && (
            <Empty
              icon={<MultisigIcon color="neutrals.500" />}
              title="Add funds to activate multisig"
            />
          )}
          {!showAddFundsBackdrop && (
            <TokenList
              variant={tokenListVariant}
              showNewTokenButton
              onItemClick={multisig?.needsDeploy ? () => null : undefined}
            />
          )}
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
