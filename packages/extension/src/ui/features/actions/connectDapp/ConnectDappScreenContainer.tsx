import { FC, useCallback, useEffect, useMemo, useState } from "react"

import { useIsPreauthorized } from "../../preAuthorizations/hooks"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { useAppState } from "../../../app.state"
import { visibleAccountsOnNetworkFamily } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useActionScreen } from "../hooks/useActionScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { ConnectDappScreen } from "./ConnectDappScreen"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"
import { clientAccountService } from "../../../services/account"
import { preAuthorizationService } from "../../../../shared/preAuthorization/service"
import { useRiskAssessment } from "./useRiskAssessment"
import { AccountNavigationBarContainer } from "../../accounts/AccountNavigationBarContainer"
import { WarningBanner } from "../warning/WarningBanner"
import { ReviewFooter } from "../warning/ReviewFooter"

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

  const { switcherNetworkId } = useAppState()
  const visibleAccounts = useView(
    visibleAccountsOnNetworkFamily(switcherNetworkId),
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
      await clientAccountService.select(selectedAccount)
    }
    await approveAndClose()
  }, [approveAndClose, selectedAccount])

  const onDisconnect = useCallback(async () => {
    if (selectedAccount) {
      await preAuthorizationService.remove({
        account: selectedAccount,
        host: action.payload.host,
      })
    }
    await reject()
  }, [action.payload.host, reject, selectedAccount])

  const networkNavigationBar = (
    <AccountNavigationBarContainer
      showSettingsButton={false}
      showAccountButton={false}
    />
  )

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
