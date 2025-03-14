import { type FC } from "react"
import { useNavigate } from "react-router-dom"
import { useSmartAccountEnabled } from "../../../shared/smartAccount/useSmartAccountEnabled"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { useStopSession } from "../../services/useStopSession"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useWalletAccount } from "../accounts/accounts.state"
import { useIsSignedIn } from "../argentAccount/hooks/useIsSignedIn"
import { useExtensionIsInTab, useOpenExtensionInTab } from "../browser/tabs"
import { useSmartAccountVerifiedEmail } from "../smartAccount/useSmartAccountVerifiedEmail"
import { SettingsScreen } from "./SettingsScreen"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"

export const SettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const openExtensionInTab = useOpenExtensionInTab()
  const extensionIsInTab = useExtensionIsInTab()
  const selectedAccount = useView(selectedAccountView)
  const returnTo = useCurrentPathnameWithQuery()
  const account = useWalletAccount(selectedAccount?.id)
  const navigate = useNavigate()
  const stopSession = useStopSession()
  const verifiedEmail = useSmartAccountVerifiedEmail()
  const isSignedIn = useIsSignedIn({ initiator: "SettingsScreenContainer" })
  const isSmartAccountEnabled = useSmartAccountEnabled(account?.networkId)
  const isLedgerSigner = useIsLedgerSigner(account?.id)

  const onSignIn = () => {
    void navigate(
      routes.argentAccountEmail(selectedAccount?.id, "argentAccount", returnTo),
    )
  }

  const onNavigateToAccount = () => {
    void navigate(routes.argentAccountLoggedIn(selectedAccount?.id))
  }

  const onLock = () => void stopSession(true)

  const shouldDisplayGuardianBanner =
    isSmartAccountEnabled &&
    (account?.type === "standard" || account?.type === "smart") &&
    !account?.guardian &&
    !isLedgerSigner

  return (
    <SettingsScreen
      onBack={onBack}
      onLock={onLock}
      onNavigateToAccount={onNavigateToAccount}
      account={account}
      shouldDisplayGuardianBanner={shouldDisplayGuardianBanner}
      isSignedIn={isSignedIn}
      onSignIn={onSignIn}
      extensionIsInTab={extensionIsInTab}
      openExtensionInTab={() => void openExtensionInTab()}
      returnTo={returnTo}
      verifiedEmail={verifiedEmail}
    />
  )
}
