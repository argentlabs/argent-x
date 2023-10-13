import { FC } from "react"
import { useTheme } from "styled-components"

import { useResetAll } from "../../hooks/useResetAll"
import { P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"

export const ResetScreen: FC = () => {
  const theme = useTheme()
  const resetAll = useResetAll()

  return (
    <DeprecatedConfirmScreen
      title="Reset wallet"
      confirmButtonText="RESET"
      confirmButtonBackgroundColor={theme.red1}
      rejectButtonText="Cancel"
      onSubmit={() => {
        resetAll(true)
      }}
    >
      <P>
        If you reset your wallet, the only way to recover it is with your
        12-word seed phrase. Make sure to back it up from the Argent X settings
        and save it somewhere securely before resetting the extension
      </P>
    </DeprecatedConfirmScreen>
  )
}
