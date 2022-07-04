import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { P } from "../../components/Typography"
import { routes } from "../../routes"
import { resetAll } from "../../services/background"
import { initialState, useAccounts } from "../accounts/accounts.state"
import { ConfirmScreen } from "../actions/ConfirmScreen"

export const ResetScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <ConfirmScreen
      title="Reset wallet"
      confirmButtonText="RESET"
      confirmButtonBackgroundColor="#c12026"
      rejectButtonText="Cancel"
      onSubmit={() => {
        resetAll()
        localStorage.clear()
        useAccounts.setState(initialState)
        navigate(routes.welcome())
      }}
    >
      <P>
        If you reset your wallet, the only way to recover it is with your
        12-word seed phrase. Make sure to back it up from the Argent X settings
        and save it somewhere securely before resetting the extension
      </P>
    </ConfirmScreen>
  )
}
