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
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { AddFundsDialogProvider } from "./useAddFundsDialog"
import { useHasFeeTokenBalance } from "./useFeeTokenBalance"
import { clientAccountService } from "../../services/account"
import { useAccountOwnerIsSelf } from "../accounts/useAccountOwner"
import { useProvisionBanner } from "./banner/useAirdropBanner"

interface AccountTokensContainerProps {
  account: Account
}

export const AccountTokensContainer: FC<AccountTokensContainerProps> = ({
  account,
}) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  const { pendingTransactions } = useAccountTransactions(account)
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const transactionsBeforeReview = useKeyValueStorage(
    userReviewStore,
    "transactionsBeforeReview",
  )
  const hasSavedRecoverySeedPhrase = useView(hasSavedRecoverySeedPhraseView)
  const isMainnet = useIsMainnet()
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const userHasReviewed = useKeyValueStorage(userReviewStore, "hasReviewed")
  const { provisionStatus, onProvisionBannerClose, shouldShowProvisionBanner } =
    useProvisionBanner()
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
    showUpgradeBanner && !hasFeeTokenBalance,
  )

  const showWithBalanceForUpgrade = Boolean(
    showUpgradeBanner && hasFeeTokenBalance,
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

  // If important banners are displayed we dont want to display secondary banners
  const canShowSecondaryBanner =
    !showSaveRecoverySeedphraseBanner &&
    !needsUpgrade &&
    !hasEscape &&
    !multisig?.needsDeploy

  const showProvisionBanner =
    shouldShowProvisionBanner && canShowSecondaryBanner

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

  return (
    <AddFundsDialogProvider account={account}>
      <AccountTokens
        onProvisionBannerClose={onProvisionBannerClose}
        provisionStatus={provisionStatus}
        shouldShowProvisionBanner={Boolean(showProvisionBanner)}
        account={account}
        showTokensAndBanners={showTokensAndBanners}
        hasEscape={hasEscape}
        accountGuardianIsSelf={accountGuardianIsSelf}
        accountOwnerIsSelf={accountOwnerIsSelf}
        showUpgradeBanner={showWithBalanceForUpgrade}
        showNoBalanceForUpgrade={showNoBalanceForUpgrade}
        onUpgradeBannerClick={() => void onUpgradeBannerClick()}
        upgradeLoading={upgradeLoading}
        multisig={multisig}
        tokenListVariant={tokenListVariant}
        hasFeeTokenBalance={hasFeeTokenBalance}
        showSaveRecoverySeedphraseBanner={showSaveRecoverySeedphraseBanner}
        isDeprecated={isDeprecated}
        returnTo={returnTo}
      />
    </AddFundsDialogProvider>
  )
}
