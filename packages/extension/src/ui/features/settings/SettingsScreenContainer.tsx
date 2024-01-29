import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { useStopSession } from "../../services/useStopSession"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useAccount } from "../accounts/accounts.state"
import { useExtensionIsInTab, useOpenExtensionInTab } from "../browser/tabs"
import { useShieldVerifiedEmail } from "../shield/useShieldVerifiedEmail"
import { SettingsScreen } from "./SettingsScreen"
import { useIsSignedIn } from "../argentAccount/hooks/useIsSignedIn"

export const SettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const openExtensionInTab = useOpenExtensionInTab()
  const extensionIsInTab = useExtensionIsInTab()
  const selectedAccount = useView(selectedAccountView)
  const returnTo = useCurrentPathnameWithQuery()
  const account = useAccount(selectedAccount)
  const navigate = useNavigate()
  const stopSession = useStopSession()
  const verifiedEmail = useShieldVerifiedEmail()
  const isSignedIn = useIsSignedIn()

  const onSignIn = () => {
    navigate(
      routes.argentAccountEmail(
        selectedAccount?.address,
        "argentAccount",
        returnTo,
      ),
    )
  }

  const onNavigateToAccount = () => {
    navigate(routes.argentAccountLoggedIn(selectedAccount?.address))
  }

  const onLock = () => void stopSession(true)

  const shouldDisplayGuardianBanner = Boolean(
    account && !account.guardian && account.type !== "multisig",
  )

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
      openExtensionInTab={openExtensionInTab}
      returnTo={returnTo}
      verifiedEmail={verifiedEmail}
    />
  )
}
