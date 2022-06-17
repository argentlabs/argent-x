import { FC, Suspense, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"

import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
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
import { useNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountSubHeader } from "./AccountSubheader"
import { MigrationBanner } from "./MigrationBanner"
import { TokenList } from "./TokenList"
import { AddTokenIconButton, TokenTitle, TokenWrapper } from "./TokenListItem"
import { fetchFeeTokenBalance } from "./tokens.service"
import { TransferButtons } from "./TransferButtons"
import { UpgradeBanner } from "./UpgradeBanner"
import { useAccountStatus } from "./useAccountStatus"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const status = useAccountStatus(account)
  const { pendingTransactions } = useAccountTransactions(account.address)
  const { accountNames, setAccountName } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()

  const showPendingTransactions = pendingTransactions.length > 0
  const accountName = getAccountName(account, accountNames)
  const { network } = useNetwork(switcherNetworkId)

  const { data: feeTokenBalance } = useSWR(
    [account, switcherNetworkId],
    fetchFeeTokenBalance,
    { suspense: false },
  )
  const { data: needsUpgrade = false, mutate } = useSWR(
    [account, network.accountClassHash, "showUpgradeBanner"],
    checkIfUpgradeAvailable,
    { suspense: false },
  )

  const canShowEmptyAccountAlert = !showPendingTransactions && !needsUpgrade
  const showUpgradeBanner = Boolean(
    needsUpgrade && !showPendingTransactions && feeTokenBalance?.gt(0),
  )
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
  }, [showPendingTransactions])

  useEffect(() => {
    connectAccount(account)
  }, [account])

  return (
    <Container>
      <AccountSubHeader
        status={status}
        accountName={accountName}
        accountAddress={account.address}
        onChangeName={(name) =>
          setAccountName(account.networkId, account.address, name)
        }
      />
      <TransferButtons />
      {isDeprecated(account) && <MigrationBanner />}
      {showBackupBanner && <RecoveryBanner />}
      {showUpgradeBanner && network.accountClassHash && (
        <Link to={routes.upgrade()}>
          <UpgradeBanner />
        </Link>
      )}
      <PendingTransactions accountAddress={account.address} />
      <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
        <TokenList
          showTitle={showPendingTransactions}
          accountAddress={account.address}
          canShowEmptyAccountAlert={canShowEmptyAccountAlert}
        />
        <TokenWrapper {...makeClickable(() => navigate(routes.newToken()))}>
          <AddTokenIconButton size={40}>
            <AddIcon />
          </AddTokenIconButton>
          <TokenTitle>Add token</TokenTitle>
        </TokenWrapper>
      </Suspense>
    </Container>
  )
}
