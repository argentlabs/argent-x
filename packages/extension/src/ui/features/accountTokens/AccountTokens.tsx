import { CellStack, Banner, Empty, icons } from "@argent/ui"
import avnuBanner from "@argent/ui/assets/avnuBannerBackground.png"
import ekuboBanner from "@argent/ui/assets/ekuboBannerBackground.png"
import { Center, Flex, VStack } from "@chakra-ui/react"
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
import { AccountDeprecatedBanner } from "./warning/AccountDeprecatedBanner"
import { classHashSupportsTxV3 } from "../../../shared/network/txv3"
import { AccountOwnerBanner } from "./warning/AccountOwnerBanner"

const { MultisigIcon, WalletIcon } = icons

export interface AccountTokensProps {
  account: Account
  showTokensAndBanners: boolean
  showEkuboBanner: boolean
  showAvnuBanner: boolean
  hasEscape: boolean
  accountGuardianIsSelf: boolean | null
  accountOwnerIsSelf?: boolean
  showUpgradeBanner: boolean
  showNoBalanceForUpgrade: boolean
  onUpgradeBannerClick?: () => void
  upgradeLoading?: boolean
  multisig?: Multisig
  showAddFundsBackdrop?: boolean
  tokenListVariant?: TokenListItemVariant
  hasFeeTokenBalance?: boolean
  showSaveRecoverySeedphraseBanner: boolean
  isDeprecated?: boolean
  setEkuboBannerSeen: () => void
  setAvnuBannerSeen: () => void
  onAvnuClick?: () => void
  returnTo?: string
}

export const AccountTokens: FC<AccountTokensProps> = ({
  account,
  showEkuboBanner,
  showAvnuBanner,
  showTokensAndBanners,
  hasEscape,
  accountGuardianIsSelf,
  accountOwnerIsSelf,
  showUpgradeBanner,
  showNoBalanceForUpgrade,
  onUpgradeBannerClick,
  upgradeLoading,
  multisig,
  showAddFundsBackdrop,
  tokenListVariant,
  hasFeeTokenBalance,
  showSaveRecoverySeedphraseBanner,
  isDeprecated = false,
  setEkuboBannerSeen,
  setAvnuBannerSeen,
  onAvnuClick,
  returnTo,
}) => {
  const supportsStrkAsFeeToken = classHashSupportsTxV3(account.classHash)
  const feeTokenCurrency = supportsStrkAsFeeToken ? "ETH or STRK" : "ETH"
  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader account={account} accountName={account.name} />
        <AccountTokensButtonsContainer
          account={account}
          hideSend={showAddFundsBackdrop}
        />
      </VStack>
      {showTokensAndBanners ? (
        <CellStack pt={0}>
          {showEkuboBanner && (
            <Banner
              backgroundImageUrl={ekuboBanner}
              href="https://ekubo.org/"
              onClose={setEkuboBannerSeen}
              title="Provide liquidity on Ekubo"
              subTitle="Starknet's most powerful AMM"
              dark
            />
          )}
          {showAvnuBanner && (
            <Banner
              backgroundImageUrl={avnuBanner}
              title="Swap with AVNU"
              subTitle="Get the best rate on Argent X"
              onClose={setAvnuBannerSeen}
              onClick={onAvnuClick}
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
          {showAddFundsBackdrop && (
            <Empty
              icon={<WalletIcon color="neutrals.500" />}
              title={"Add funds"}
            >
              <Center textAlign={"center"}>
                {multisig
                  ? `You will need some ${feeTokenCurrency} to activate the multisig account`
                  : `You will need some ${feeTokenCurrency} to use the account`}
              </Center>
            </Empty>
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
