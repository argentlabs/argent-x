import { FC } from "react"
import { useShieldVerifiedEmail } from "../shield/useShieldVerifiedEmail"

import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"
import { ArgentAccountLoggedInScreen } from "./ArgentAccountLoggedInScreen"
import { allAccountsWithGuardianView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { argentAccountService } from "../../services/argentAccount"
import { useToast } from "@argent/x-ui"
import { useEmailPreferences } from "./hooks/useEmailPreferences"

export const ArgentAccountLoggedInScreenContainer: FC = () => {
  const verifiedEmail = useShieldVerifiedEmail()
  const navigate = useNavigate()
  const accountsWithGuardian = useView(allAccountsWithGuardianView)
  const toast = useToast()
  const { data: emailPreferences } = useEmailPreferences()
  if (!verifiedEmail) {
    return null
  }

  const handleClose = () => {
    navigate(routes.accountTokens())
  }
  const handleLogout = async () => {
    try {
      await argentAccountService.logout()
      navigate(routes.accountTokens())
    } catch (e) {
      console.error(e)
      toast({
        title: "Unable to log out",
        status: "error",
        duration: 3000,
      })
    }
  }

  const accountsWithShieldEnabled = accountsWithGuardian.map((acc) => ({
    accountName: acc.name,
  }))
  return (
    <ArgentAccountLoggedInScreen
      handleClose={handleClose}
      handleLogout={handleLogout}
      isEmailNotificationsEnabled={Boolean(
        emailPreferences?.isAnnouncementsEnabled ||
          emailPreferences?.isNewsletterEnabled,
      )}
      verifiedEmail={verifiedEmail}
      accountsWithShieldEnabled={accountsWithShieldEnabled}
    />
  )
}
