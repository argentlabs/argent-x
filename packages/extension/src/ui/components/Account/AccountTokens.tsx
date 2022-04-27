import AddIcon from "@mui/icons-material/Add"
import { FC, Suspense, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"

import { Account } from "../../Account"
import { useAccountStatus } from "../../hooks/useAccountStatus"
import { useNetwork } from "../../hooks/useNetworks"
import { routes } from "../../routes"
import {
  getAccountName,
  useAccountMetadata,
} from "../../states/accountMetadata"
import { useAccountTransactions } from "../../states/accountTransactions"
import { useAppState } from "../../states/app"
import { useBackupRequired } from "../../states/backupDownload"
import { makeClickable } from "../../utils/a11y"
import { connectAccount } from "../../utils/accounts"
import { checkIfUpgradeAvailable } from "../../utils/upgrade"
import { RecoveryBanner } from "../RecoveryBanner"
import { Spinner } from "../Spinner"
import { AddTokenIconButton, TokenTitle, TokenWrapper } from "../Token"
import { AccountSubHeader } from "./AccountSubheader"
import { PendingTransactions } from "./PendingTransactions"
import { TokenList } from "./TokenList"
import { UpgradeBanner } from "./UpgradeBanner"

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

  const { data: needsUpgrade = false, mutate } = useSWR(
    [account, network.accountImplementation, "showUpgradeBanner"],
    checkIfUpgradeAvailable,
    { suspense: false },
  )

  const canShowEmptyAccountAlert = !showPendingTransactions && !needsUpgrade
  const showUpgradeBanner = needsUpgrade && !showPendingTransactions
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
        networkId={switcherNetworkId}
        status={status}
        accountName={accountName}
        accountAddress={account.address}
        onChangeName={(name) =>
          setAccountName(account.networkId, account.address, name)
        }
      />
      {showBackupBanner && <RecoveryBanner />}
      {showUpgradeBanner && (
        <UpgradeBanner
          onClick={() => {
            if (network.accountImplementation) {
              navigate(routes.upgrade())
            }
          }}
        />
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
