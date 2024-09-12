import { FC } from "react"
import { useSmartAccountVerifiedEmail } from "../smartAccount/useSmartAccountVerifiedEmail"

import { useToast } from "@argent/x-ui"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { clientArgentAccountService } from "../../services/argentAccount"
import { allAccountsWithGuardianView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { ArgentAccountLoggedInScreen } from "./ArgentAccountLoggedInScreen"

export const ArgentAccountLoggedInScreenContainer: FC = () => {
  const verifiedEmail = useSmartAccountVerifiedEmail()
  const navigate = useNavigate()
  const accountsWithGuardian = useView(allAccountsWithGuardianView)
  const toast = useToast()
  if (!verifiedEmail) {
    return null
  }

  const handleClose = () => {
    navigate(routes.accountTokens())
  }
  const handleLogout = async () => {
    try {
      await clientArgentAccountService.logout()
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

  const accountsWithGuardianEnabled = accountsWithGuardian.map((acc) => ({
    accountName: acc.name,
  }))
  return (
    <ArgentAccountLoggedInScreen
      handleClose={handleClose}
      handleLogout={handleLogout}
      verifiedEmail={verifiedEmail}
      accountsWithGuardianEnabled={accountsWithGuardianEnabled}
    />
  )
}
