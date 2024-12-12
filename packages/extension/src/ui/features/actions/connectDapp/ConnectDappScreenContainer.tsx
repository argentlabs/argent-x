import type { FC } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useIsPreauthorized } from "../../preAuthorizations/hooks"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { visibleAccountsOnNetworkFamily } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useActionScreen } from "../hooks/useActionScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { ConnectDappScreen } from "./ConnectDappScreen"
import { useDappDisplayAttributes } from "../../../services/knownDapps/useDappDisplayAttributes"
import { clientAccountService } from "../../../services/account"
import { useRiskAssessment } from "./useRiskAssessment"
import { WarningBanner } from "../warning/WarningBanner"
import { ReviewFooter } from "../warning/ReviewFooter"
import { preAuthorizationUIService } from "../../../services/preAuthorization"
import { selectedNetworkIdView } from "../../../views/network"
import { AccountDetailsNavigationBarContainer } from "../../navigation/AccountDetailsNavigationBarContainer"

export const ConnectDappScreenContainer: FC = () => {
  const {
    action,
    selectedAccount: initiallySelectedAccount,
    approveAndClose,
    reject,
  } = useActionScreen()
  if (action?.type !== "CONNECT_DAPP") {
    throw new Error(
      "ConnectDappScreenContainer used with incompatible action.type",
    )
  }
  const host = action.payload.host
  const riskAssessment = useRiskAssessment({
    host,
  })
  const [isHighRisk, setIsHighRisk] = useState(false)
  const [hasAcceptedRisk, setHasAcceptedRisk] = useState(false)
  useEffect(() => {
    const isRiskyTransaction =
      riskAssessment?.warning?.severity === "critical" ||
      riskAssessment?.warning?.severity === "high"
    if (isRiskyTransaction) {
      setIsHighRisk(true)
    }
  }, [riskAssessment?.warning?.severity])
  const transactionReviewWarnings = useMemo(() => {
    if (!riskAssessment?.warning) {
      return null
    }

    return (
      <WarningBanner
        warnings={[riskAssessment.warning]}
        onReject={() => void reject()}
        onConfirm={() => setHasAcceptedRisk(true)}
      />
    )
  }, [riskAssessment?.warning, reject])

  const selectedNetworkId = useView(selectedNetworkIdView)
  const visibleAccounts = useView(
    visibleAccountsOnNetworkFamily(selectedNetworkId),
  )
  const [connectedAccount, setConnectedAccount] = useState<
    BaseWalletAccount | undefined
  >(initiallySelectedAccount)
  const isConnected = useIsPreauthorized(host, initiallySelectedAccount)

  const dappDisplayAttributes = useDappDisplayAttributes(host)

  const selectedAccount = useMemo(() => {
    if (connectedAccount) {
      const account = visibleAccounts.find((account) =>
        accountsEqual(account, connectedAccount),
      )
      return account
    }
  }, [visibleAccounts, connectedAccount])

  const onSelectedAccountChange = useCallback((account: BaseWalletAccount) => {
    setConnectedAccount(account)
  }, [])

  const onConnect = useCallback(async () => {
    if (selectedAccount) {
      // continue with approval with selected account
      await clientAccountService.select(selectedAccount.id)
    }
    await approveAndClose()
  }, [approveAndClose, selectedAccount])

  const onDisconnect = useCallback(async () => {
    if (selectedAccount) {
      await preAuthorizationUIService.remove({
        account: selectedAccount,
        host: action.payload.host,
      })
    }
    await reject()
  }, [action.payload.host, reject, selectedAccount])

  const networkNavigationBar = <AccountDetailsNavigationBarContainer />

  return (
    <ConnectDappScreen
      isConnected={isConnected}
      onConnect={() => void onConnect()}
      onDisconnect={() => void onDisconnect()}
      onReject={() => void reject()}
      host={host}
      accounts={visibleAccounts}
      dappDisplayAttributes={dappDisplayAttributes}
      selectedAccount={connectedAccount}
      onSelectedAccountChange={onSelectedAccountChange}
      actionIsApproving={Boolean(action.meta.startedApproving)}
      navigationBar={networkNavigationBar}
      isHighRisk={isHighRisk}
      hasAcceptedRisk={hasAcceptedRisk}
      footer={
        <>
          {isHighRisk && <ReviewFooter />}
          <WithActionScreenErrorFooter />
        </>
      }
    >
      {transactionReviewWarnings}
    </ConnectDappScreen>
  )
}
