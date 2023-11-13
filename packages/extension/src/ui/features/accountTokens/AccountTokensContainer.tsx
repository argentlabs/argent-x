import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { userReviewStore } from "../../../shared/userReview"
import { routes } from "../../routes"
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
import { useDapplandBanner } from "./dappland/banner.state"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { AddFundsDialogProvider } from "./useAddFundsDialog"
import { useFeeTokenBalance } from "./useFeeTokenBalance"
import { accountService } from "../../../shared/account/service"

interface AccountTokensContainerProps {
  account: Account
}

export const AccountTokensContainer: FC<AccountTokensContainerProps> = ({
  account,
}) => {
  const navigate = useNavigate()
  const { pendingTransactions } = useAccountTransactions(account)
  const { hasSeenBanner } = useDapplandBanner()
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
    if (!userHasReviewed && transactionsBeforeReview === 0) {
      timeoutId = setTimeout(() => navigate(routes.userReview()), 1000)
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [navigate, transactionsBeforeReview, userHasReviewed])

  const { feeTokenBalance } = useFeeTokenBalance(account)

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
      feeTokenBalance &&
      !account.needsDeploy &&
      feeTokenBalance <= 0n,
  )

  const hasEscape = accountHasEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)

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
    return (
      !showSaveRecoverySeedphraseBanner &&
      feeTokenBalance !== undefined &&
      feeTokenBalance <= 0n
    )
  }, [feeTokenBalance, showSaveRecoverySeedphraseBanner])

  const showDapplandBanner =
    !hasSeenBanner &&
    !showAddFundsBackdrop &&
    !showSaveRecoverySeedphraseBanner &&
    !needsUpgrade &&
    !hasPendingTransactions &&
    !hasEscape &&
    !multisig?.needsDeploy

  const hadPendingTransactions = useRef(false)

  const setDappLandBannerSeen = useCallback(() => {
    useDapplandBanner.setState({
      hasSeenBanner: true,
    })
  }, [])

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
    await accountService.upgrade(account)
    setUpgradeLoading(false)
  }, [account, navigate, showNoBalanceForUpgrade])

  return (
    <AddFundsDialogProvider account={account}>
      <AccountTokens
        account={account}
        showTokensAndBanners={showTokensAndBanners}
        showDapplandBanner={showDapplandBanner}
        setDappLandBannerSeen={setDappLandBannerSeen}
        hasEscape={hasEscape}
        accountGuardianIsSelf={accountGuardianIsSelf}
        showUpgradeBanner={showUpgradeBanner}
        showNoBalanceForUpgrade={showNoBalanceForUpgrade}
        onUpgradeBannerClick={() => void onUpgradeBannerClick()}
        upgradeLoading={upgradeLoading}
        multisig={multisig}
        showAddFundsBackdrop={showAddFundsBackdrop}
        tokenListVariant={tokenListVariant}
        feeTokenBalance={feeTokenBalance}
        showSaveRecoverySeedphraseBanner={showSaveRecoverySeedphraseBanner}
        isDeprecated={isDeprecated}
      />
    </AddFundsDialogProvider>
  )
}
