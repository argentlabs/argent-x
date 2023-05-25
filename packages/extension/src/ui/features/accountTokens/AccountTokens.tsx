import { CellStack, DapplandBanner, Empty, icons } from "@argent/ui"
import dapplandBanner from "@argent/ui/assets/dapplandBannerBackground.png"
import { Flex, VStack } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { FC, useCallback, useEffect, useMemo, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { userReviewStore } from "../../../shared/userReview"
import { routes } from "../../routes"
import { redeployAccount } from "../../services/backgroundAccounts"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { useIsMultisigDeploying } from "../multisig/hooks/useIsMultisigDeploying"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { MultisigBanner } from "../multisig/MultisigBanner"
import { useShouldShowNetworkUpgradeMessage } from "../networks/hooks/useShouldShowNetworkUpgradeMessage"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { EscapeBanner } from "../shield/escape/EscapeBanner"
import { accountHasEscape } from "../shield/escape/useAccountEscape"
import { useAccountGuardianIsSelf } from "../shield/useAccountGuardian"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBanner"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { AccountTokensHeader } from "./AccountTokensHeader"
import { useDapplandBanner } from "./dappland/banner.state"
import { TokenList } from "./TokenList"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { useFeeTokenBalance } from "./tokens.service"
import { UpgradeBanner } from "./UpgradeBanner"
import { useAccountStatus } from "./useAccountStatus"

const { MultisigIcon } = icons

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const status = useAccountStatus(account)
  const { pendingTransactions } = useAccountTransactions(account)
  const { isBackupRequired } = useBackupRequired()
  const { hasSeenBanner } = useDapplandBanner()
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const transactionsBeforeReview = useKeyValueStorage(
    userReviewStore,
    "transactionsBeforeReview",
  )

  const userHasReviewed = useKeyValueStorage(userReviewStore, "hasReviewed")

  const hasPendingTransactions = pendingTransactions.length > 0
  const {
    shouldShow: shouldShowNetworkUpgradeMessage,
    updateLastShown: updateLastShownNetworkUpgradeMessage,
  } = useShouldShowNetworkUpgradeMessage()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (!userHasReviewed && transactionsBeforeReview === 0) {
      timeoutId = setTimeout(() => navigate(routes.userReview()), 1000)
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [navigate, transactionsBeforeReview, userHasReviewed])

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { needsUpgrade = false, mutate } = useCheckUpgradeAvailable(account)

  const multisig = useMultisig(account)
  const isMultisigDeploying = useIsMultisigDeploying(multisig)

  const onRedeploy = useCallback(async () => {
    const data = account.toBaseWalletAccount()
    try {
      const result = await redeployAccount(data)
      account.updateDeployTx(result.txHash)
    } catch {
      // ignore, account should enter error state and failure will be actionable elsewhere in UI
    }
  }, [account])

  const showUpgradeBanner = Boolean(
    needsUpgrade &&
      !hasPendingTransactions &&
      feeTokenBalance?.gt(0) &&
      !isMultisigDeploying,
  )
  const showNoBalanceForUpgrade = Boolean(
    needsUpgrade && !hasPendingTransactions && feeTokenBalance?.lte(0),
  )

  const showBackupBanner =
    isBackupRequired && !showUpgradeBanner && !isMultisigDeploying

  const hasEscape = accountHasEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)

  const showAddFundsBackdrop = useMemo(() => {
    return multisig?.needsDeploy && feeTokenBalance?.lte(0)
  }, [feeTokenBalance, multisig?.needsDeploy])

  const signerIsInMultisig = useIsSignerInMultisig(multisig)

  const showTokensAndBanners = useMemo(() => {
    if (multisig) {
      return signerIsInMultisig
    }

    return true
  }, [multisig, signerIsInMultisig])

  const showDapplandBanner =
    !hasSeenBanner &&
    !showBackupBanner &&
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
      mutate(false) // update upgrade banner
    }
  }, [mutate, hasPendingTransactions])

  useEffect(() => {
    if (shouldShowNetworkUpgradeMessage) {
      updateLastShownNetworkUpgradeMessage()
      navigate(routes.networkUpgradeV4())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowNetworkUpgradeMessage])

  const tokenListVariant = currencyDisplayEnabled ? "default" : "no-currency"

  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader
          status={status}
          account={account}
          accountName={account.name}
          onRedeploy={onRedeploy}
        />
        <AccountTokensButtons account={account} />
      </VStack>
      <CellStack pt={0}>
        {showTokensAndBanners ? (
          <>
            <AnimatePresence initial={false}>
              {showDapplandBanner && (
                <motion.div
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DapplandBanner
                    backgroundImageUrl={dapplandBanner}
                    href="https://www.dappland.com?utm_source=argent&utm_medium=extension&utm_content=banner"
                    onClose={setDappLandBannerSeen}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <StatusMessageBannerContainer />
            {(hasEscape || accountGuardianIsSelf) && (
              <EscapeBanner account={account} />
            )}
            {showBackupBanner && <RecoveryBanner />}
            {showUpgradeBanner && (
              <UpgradeBanner
                to={routes.accountUpgradeV4()}
                state={{ from: location.pathname }}
              />
            )}
            {showNoBalanceForUpgrade && (
              <UpgradeBanner canNotPay to={routes.funding()} />
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
          </>
        ) : (
          <Empty
            icon={<MultisigIcon color="neutrals.500" />}
            title="You can no longer use this account"
          />
        )}
      </CellStack>
    </Flex>
  )
}
