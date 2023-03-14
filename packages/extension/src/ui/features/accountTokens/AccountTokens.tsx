import { CellStack, Empty, icons } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useMemo, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { userReviewStore } from "../../../shared/userReview"
import { routes } from "../../routes"
import { redeployAccount } from "../../services/backgroundAccounts"
import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { useMultisig } from "../multisig/multisig.state"
import { MultisigBanner } from "../multisig/MultisigBanner"
import { useShouldShowNetworkUpgradeMessage } from "../networks/showNetworkUpgrade"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { EscapeBanner } from "../shield/escape/EscapeBanner"
import { accountHasEscape } from "../shield/escape/useAccountEscape"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBanner"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { AccountTokensHeader } from "./AccountTokensHeader"
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
  const { accountNames } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const transactionsBeforeReview = useKeyValueStorage(
    userReviewStore,
    "transactionsBeforeReview",
  )

  const userHasReviewed = useKeyValueStorage(userReviewStore, "hasReviewed")

  const hasPendingTransactions = pendingTransactions.length > 0
  const accountName = getAccountName(account, accountNames)
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
    needsUpgrade && !hasPendingTransactions && feeTokenBalance?.gt(0),
  )
  const showNoBalanceForUpgrade = Boolean(
    needsUpgrade && !hasPendingTransactions && feeTokenBalance?.lte(0),
  )

  const showBackupBanner = isBackupRequired && !showUpgradeBanner

  const hasEscape = accountHasEscape(account)

  const hadPendingTransactions = useRef(false)
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

  const showAddFundsBackdrop = useMemo(() => {
    return multisig?.needsDeploy && feeTokenBalance?.lte(0)
  }, [feeTokenBalance, multisig?.needsDeploy])

  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader
          status={status}
          account={account}
          accountName={accountName}
          onRedeploy={onRedeploy}
        />
        <AccountTokensButtons account={account} />
      </VStack>
      <CellStack pt={0}>
        <StatusMessageBannerContainer />
        {hasEscape && <EscapeBanner account={account} />}
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
          <TokenList variant={tokenListVariant} showNewTokenButton />
        )}
      </CellStack>
    </Flex>
  )
}
