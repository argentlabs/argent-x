import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useKeyValueStorage } from "../../hooks/useStorage"
import { userReviewStore } from "../../../shared/userReview"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { hasSavedRecoverySeedPhraseView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import {
  useCheckUpgradeAvailable,
  useIsDeprecatedTxV0,
} from "../accounts/accountUpgradeCheck"
import { useIsMultisigDeploying } from "../multisig/hooks/useIsMultisigDeploying"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import { accountHasEscape } from "../shield/escape/accountHasEscape"
import { useAccountGuardianIsSelf } from "../shield/useAccountGuardian"
import { AccountTokens } from "./AccountTokens"
import { hasSeenAvnuAtom, hasSeenEkuboAtom } from "./banner/banner.state"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { AddFundsDialogProvider } from "./useAddFundsDialog"
import { useHasFeeTokenBalance } from "./useFeeTokenBalance"
import { clientAccountService } from "../../services/account"
import { useAtom } from "jotai"
import { useAccountOwnerIsSelf } from "../accounts/useAccountOwner"

interface AccountTokensContainerProps {
  account: Account
}

export const AccountTokensContainer: FC<AccountTokensContainerProps> = ({
  account,
}) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  const { pendingTransactions } = useAccountTransactions(account)
  const [hasSeenEkuboBanner, setHasSeenEkuboBanner] = useAtom(hasSeenEkuboAtom)
  const [hasSeenAvnuBanner, setHasSeenAvnuBanner] = useAtom(hasSeenAvnuAtom)
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const transactionsBeforeReview = useKeyValueStorage(
    userReviewStore,
    "transactionsBeforeReview",
  )
  const hasSavedRecoverySeedPhrase = useView(hasSavedRecoverySeedPhraseView)
  const isMainnet = useIsMainnet()
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const userHasReviewed = useKeyValueStorage(userReviewStore, "hasReviewed")

  const hasPendingTransactions = pendingTransactions.length > 0

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (
      !userHasReviewed &&
      transactionsBeforeReview === 0 &&
      !(window as any).PLAYWRIGHT
    ) {
      timeoutId = setTimeout(() => navigate(routes.userReview()), 1000)
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [navigate, transactionsBeforeReview, userHasReviewed])

  const hasFeeTokenBalance = useHasFeeTokenBalance(account)

  const needsUpgrade = useCheckUpgradeAvailable(account)
  const multisig = useMultisig(account)
  const isMultisigDeploying = useIsMultisigDeploying(multisig)

  const showUpgradeBanner = Boolean(
    needsUpgrade &&
      !hasPendingTransactions &&
      !isMultisigDeploying &&
      !account.needsDeploy,
  )

  const showNoBalanceForUpgrade = Boolean(
    needsUpgrade &&
      !hasPendingTransactions &&
      !hasFeeTokenBalance &&
      !account.needsDeploy,
  )

  const hasEscape = accountHasEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  const accountOwnerIsSelf = useAccountOwnerIsSelf(account)

  const signerIsInMultisig = useIsSignerInMultisig(multisig)

  const isDeprecated = useIsDeprecatedTxV0(account)

  const showTokensAndBanners = useMemo(() => {
    if (multisig) {
      return signerIsInMultisig
    }

    return true
  }, [multisig, signerIsInMultisig])

  const showSaveRecoverySeedphraseBanner = useMemo(() => {
    return !hasSavedRecoverySeedPhrase && isMainnet
  }, [hasSavedRecoverySeedPhrase, isMainnet])

  const showAddFundsBackdrop = useMemo(() => {
    return !showSaveRecoverySeedphraseBanner && !hasFeeTokenBalance
  }, [hasFeeTokenBalance, showSaveRecoverySeedphraseBanner])

  const shouldShowDappBanner =
    !showAddFundsBackdrop &&
    !showSaveRecoverySeedphraseBanner &&
    !needsUpgrade &&
    !hasPendingTransactions &&
    !hasEscape &&
    !multisig?.needsDeploy

  const showAvnuBanner = !hasSeenAvnuBanner && shouldShowDappBanner
  // Show Ekubo banner only after Avnu banner has been dismissed
  const showEkuboBanner =
    !hasSeenEkuboBanner && shouldShowDappBanner && hasSeenAvnuBanner
  const setAvnuBannerSeen = useCallback(() => {
    setHasSeenAvnuBanner(true)
  }, [setHasSeenAvnuBanner])
  const setEkuboBannerSeen = useCallback(() => {
    setHasSeenEkuboBanner(true)
  }, [setHasSeenEkuboBanner])

  const hadPendingTransactions = useRef(false)

  useEffect(() => {
    if (hasPendingTransactions) {
      hadPendingTransactions.current = true
    }
    if (hadPendingTransactions.current && hasPendingTransactions === false) {
      // switched from true to false
      hadPendingTransactions.current = false
    }
  }, [hasPendingTransactions])

  const tokenListVariant = currencyDisplayEnabled ? "default" : "no-currency"

  const onUpgradeBannerClick = useCallback(async () => {
    if (showNoBalanceForUpgrade) {
      return navigate(routes.funding())
    }
    setUpgradeLoading(true)
    await clientAccountService.upgrade(account)
    setUpgradeLoading(false)
  }, [account, navigate, showNoBalanceForUpgrade])

  const onAvnuClick = () => navigate(routes.swap())

  return (
    <AddFundsDialogProvider account={account}>
      <AccountTokens
        account={account}
        showTokensAndBanners={showTokensAndBanners}
        hasEscape={hasEscape}
        accountGuardianIsSelf={accountGuardianIsSelf}
        accountOwnerIsSelf={accountOwnerIsSelf}
        showUpgradeBanner={showUpgradeBanner}
        showNoBalanceForUpgrade={showNoBalanceForUpgrade}
        onUpgradeBannerClick={() => void onUpgradeBannerClick()}
        upgradeLoading={upgradeLoading}
        multisig={multisig}
        showAddFundsBackdrop={showAddFundsBackdrop}
        tokenListVariant={tokenListVariant}
        hasFeeTokenBalance={hasFeeTokenBalance}
        showSaveRecoverySeedphraseBanner={showSaveRecoverySeedphraseBanner}
        isDeprecated={isDeprecated}
        showEkuboBanner={showEkuboBanner}
        showAvnuBanner={showAvnuBanner}
        setAvnuBannerSeen={setAvnuBannerSeen}
        setEkuboBannerSeen={setEkuboBannerSeen}
        onAvnuClick={onAvnuClick}
        returnTo={returnTo}
      />
    </AddFundsDialogProvider>
  )
}
