import { FC, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"

import {
  getAccountIdentifier,
  isDeprecated,
} from "../../../shared/wallet.service"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { IconButton } from "../../components/IconButton"
import { AddIcon } from "../../components/Icons/MuiIcons"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { connectAccount } from "../../services/backgroundAccounts"
import { PendingTransactions } from "../accountActivity/PendingTransactions"
import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { checkIfUpgradeAvailable } from "../accounts/upgrade.service"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountSubHeader } from "./AccountSubheader"
import { MigrationBanner } from "./MigrationBanner"
import { TokenList } from "./TokenList"
import { TokenTitle, TokenWrapper } from "./TokenListItem"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { fetchFeeTokenBalance } from "./tokens.service"
import { useTokensWithBalance } from "./tokens.state"
import { TransferButtons } from "./TransferButtons"
import { UpgradeBanner } from "./UpgradeBanner"
import { useAccountStatus } from "./useAccountStatus"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

export const AddTokenIconButton = styled(IconButton)`
  &:hover,
  &:focus {
    background-color: rgba(255, 255, 255, 0.15);
    outline: 0;
  }
`

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const navigate = useNavigate()
  const status = useAccountStatus(account)
  const { pendingTransactions } = useAccountTransactions(account)
  const { accountNames, setAccountName } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()

  const showPendingTransactions = pendingTransactions.length > 0
  const accountName = getAccountName(account, accountNames)
  const network = useCurrentNetwork()

  const { data: feeTokenBalance } = useSWR(
    [getAccountIdentifier(account), network.id, "feeTokenBalance"],
    () => fetchFeeTokenBalance(account, network.id),
    { suspense: false },
  )

  const { isValidating, error, tokenDetails, tokenDetailsIsInitialising } =
    useTokensWithBalance(account)

  const { data: needsUpgrade = false, mutate } = useSWR(
    [
      getAccountIdentifier(account),
      network.accountClassHash,
      "showUpgradeBanner",
    ],
    () => checkIfUpgradeAvailable(account, network.accountClassHash),
    { suspense: false },
  )

  const showUpgradeBanner = Boolean(
    needsUpgrade && !showPendingTransactions && feeTokenBalance?.gt(0),
  )
  const showNoBalanceForUpgrade = !showUpgradeBanner && needsUpgrade
  const showBackupBanner = isBackupRequired && !showUpgradeBanner

  const hadPendingTransactions = useRef(false)
  useEffect(() => {
    if (showPendingTransactions) {
      hadPendingTransactions.current = true
    }
    if (hadPendingTransactions.current && showPendingTransactions === false) {
      // switched from true to false
      hadPendingTransactions.current = false
      mutate(false) // update upgrade banner
    }
  }, [mutate, showPendingTransactions])

  useEffect(() => {
    connectAccount(account)
  }, [account])

  const tokenListVariant = currencyDisplayEnabled ? "default" : "no-currency"

  return (
    <Container data-testid="account-tokens">
      <AccountSubHeader
        status={status}
        account={account}
        accountName={accountName}
        onChangeName={(name) =>
          setAccountName(account.networkId, account.address, name)
        }
      />
      <TransferButtons />
      {isDeprecated(account) && <MigrationBanner />}
      {showBackupBanner && <RecoveryBanner />}
      {showUpgradeBanner && (
        <Link to={routes.upgrade()}>
          <UpgradeBanner />
        </Link>
      )}
      {showNoBalanceForUpgrade && <UpgradeBanner canNotPay />}
      <PendingTransactions account={account} />
      {/** TODO: remove this extra error boundary once TokenList issues are settled */}
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallbackWithCopyError
            message={"Sorry, an error occurred fetching tokens"}
          />
        }
      >
        {error ? (
          <ErrorBoundaryFallbackWithCopyError
            error={error}
            message={"Sorry, an error occurred fetching tokens"}
          />
        ) : (
          <>
            <TokenList
              showTitle={showPendingTransactions}
              isValidating={isValidating}
              tokenList={tokenDetails}
              variant={tokenListVariant}
            />
            {tokenDetailsIsInitialising ? (
              <Spinner size={64} style={{ marginTop: 40 }} />
            ) : (
              <TokenWrapper
                {...makeClickable(() => navigate(routes.newToken()))}
              >
                <AddTokenIconButton size={40}>
                  <AddIcon />
                </AddTokenIconButton>
                <TokenTitle>Add token</TokenTitle>
              </TokenWrapper>
            )}
          </>
        )}
      </ErrorBoundary>
    </Container>
  )
}
