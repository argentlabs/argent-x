import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "styled-components"

import { routes } from "../../routes"
import { resetAll } from "../../services/background"
import { P } from "../../theme/Typography"
import { ConfirmScreen } from "../actions/ConfirmScreen"

export const ResetScreen: FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <ConfirmScreen
      title="Reset wallet"
      confirmButtonText="RESET"
      confirmButtonBackgroundColor={theme.red1}
      rejectButtonText="Cancel"
      onSubmit={() => {
        resetAll()
        localStorage.clear()
        navigate(routes.onboardingStart())
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
